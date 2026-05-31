'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import confetti from 'canvas-confetti'
import Navbar from '../Navbar'

export default function GoleadorPage() {
  const [goleadores, setGoleadores] = useState<any[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')

  const supabase = createClient()

  const categorias = ['Todos', 'Libre', 'Master', 'Femenino']

  const dispararConfeti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }

  async function fetchGoleadores() {
    const { data, error } = await supabase
      .from('jugadores')
      .select(`
        id,
        nombre,
        numero_camisola,
        goles,
        equipos(nombre),
        categorias(nombre)
      `)
      .neq('posicion', 'PORTERO')
      .order('goles', { ascending: false })
      .limit(5)

    if (!error && data) {
      setGoleadores(data)
    }
  }

  useEffect(() => {
    // Carga inicial
    fetchGoleadores()

    // Configuración del canal de tiempo real
    const channel = supabase
      .channel('realtime:jugadores')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jugadores',
        },
        () => {
          // Al detectar cualquier cambio, volvemos a consultar la base de datos
          fetchGoleadores()
        }
      )
      .subscribe()

    // Limpieza al desmontar el componente
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#0B1120] text-white p-4 font-sans pb-28">

      <div className="flex justify-between items-center mb-6 mt-2">
        <h1 className="text-[#34D399] font-black tracking-[0.2em] text-[15px] opacity-80 uppercase">
          Top 5 Goleadores
        </h1>
      </div>

      <div className="text-zinc-500 font-bold mb-6 flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaActiva(cat)}
            className={
              categoriaActiva === cat
                ? 'text-[#34D399] border-b-2 border-[#34D399]'
                : 'hover:text-[#34D399]/70'
            }
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {goleadores
          .filter(
            (p) =>
              categoriaActiva === 'Todos' ||
              p.categorias?.nombre === categoriaActiva
          )
          .map((jugador) => (
            <div
              key={jugador.id}
              className="bg-[#111827] p-4 rounded-2xl border border-white/5 shadow-lg flex items-center"
            >
              <div className="flex flex-col items-center pr-4 border-r border-white/10">
                <span className="text-[9px] uppercase font-bold text-zinc-400">
                  CAMISOLA #
                </span>

                <span className="font-black text-2xl text-[#34D399] mt-1">
                  {jugador.numero_camisola}
                </span>
              </div>

              <div className="flex-1 pl-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-white">
                    {jugador.nombre}
                  </h3>

                  <div className="flex flex-col items-end gap-1">
                    {categoriaActiva === 'Todos' && (
                      <span className="text-[8px] bg-[#1E293B] text-[#34D399] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                        {jugador.categorias?.nombre}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-zinc-400 mt-1">
                  Equipo:{' '}
                  <span className="text-white font-medium">
                    {jugador.equipos?.nombre || 'Sin equipo'}
                  </span>
                </p>
              </div>

              <div className="ml-4 flex flex-col items-center border-l border-white/10 pl-4">
                <span className="block text-2xl font-black text-white leading-none">
                  {jugador.goles ?? 0}
                </span>

                <span className="text-[8px] text-[#34D399] uppercase tracking-widest font-bold mt-1 block mb-2">
                  Goles
                </span>

                <button
                  onClick={dispararConfeti}
                  className="flex flex-col items-center hover:scale-110 transition-transform"
                >
                  <Heart
                    size={16}
                    className="text-zinc-500 hover:text-rose-500 transition-colors"
                  />

                  <span className="text-[10px] text-zinc-600 font-bold mt-0.5">
                    0
                  </span>
                </button>
              </div>
            </div>
          ))}
      </div>

      <Navbar />
    </main>
  )
}