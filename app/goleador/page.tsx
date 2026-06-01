'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import confetti from 'canvas-confetti'
import Navbar from '../Navbar'

interface Goleador {
  id: number
  nombre: string
  numero_camisola: number
  goles: number
  equipos?: { nombre: string }
  categorias?: { nombre: string }
}

export default function GoleadorPage() {
  const [goleadores, setGoleadores] = useState<Goleador[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  
  // Usamos la longitud de la lista para determinar si mostrar el mensaje o la tabla
  const hayDatos = goleadores.length > 0
  
  const supabase = createClient()
  const categorias = ['Todos', 'Libre', 'Master', 'Femenino']

  const dispararConfeti = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
  }

  async function fetchGoleadores(categoria = 'Todos') {
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

    if (error) {
      console.error('Error cargando goleadores:', error)
      return
    }

    const todosLosJugadores: Goleador[] = (data || []).map((j: any) => ({
      id: j.id,
      nombre: j.nombre,
      numero_camisola: j.numero_camisola,
      goles: j.goles ?? 0,
      equipos: Array.isArray(j.equipos) ? j.equipos[0] : j.equipos,
      categorias: Array.isArray(j.categorias) ? j.categorias[0] : j.categorias,
    }))

    const filtrados = todosLosJugadores.filter(
      (j) => (categoria === 'Todos' || j.categorias?.nombre === categoria) && j.goles > 0
    )
    
    setGoleadores(filtrados.slice(0, 5))
  }

  useEffect(() => {
    fetchGoleadores(categoriaActiva)
  }, [categoriaActiva])

  useEffect(() => {
    const channel = supabase
      .channel('realtime:jugadores')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'jugadores' }, () => {
        fetchGoleadores(categoriaActiva)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [categoriaActiva])

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
            className={categoriaActiva === cat ? 'text-[#34D399] border-b-2 border-[#34D399]' : 'hover:text-[#34D399]/70'}
          >
            {cat}
          </button>
        ))}
      </div>

      {!hayDatos ? (
        <div className="flex items-center justify-center mt-20 text-center px-6">
          <p className="text-zinc-400 italic text-sm leading-relaxed border border-white/5 p-8 rounded-2xl bg-[#111827]">
            "La cuenta regresiva ha comenzado: el arco espera al nuevo protagonista."
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {goleadores.map((jugador, index) => (
            <div
              key={jugador.id}
              className={`p-4 rounded-2xl shadow-lg flex items-center transition-all border ${
                index === 0
                  ? 'bg-[#1a1b16] border-yellow-500/50'
                  : 'bg-[#111827] border-white/5'
              }`}
            >
              <span className="absolute top-2 left-3 text-[8px] bg-[#1E293B] text-[#34D399] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                {jugador.categorias?.nombre}
              </span>

              <div className="flex flex-col items-center pr-4 border-r border-white/10 mt-4">
                <span className="text-[7px] uppercase font-bold text-zinc-500">CAMISOLA #</span>
                <span className="font-black text-lg text-[#34D399]">
                  {jugador.numero_camisola}
                </span>
              </div>

              <div className="flex-1 pl-4 mt-4 min-w-0">
                <h3 className="font-bold text-lg text-white leading-tight truncate">
                  {jugador.nombre}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5 truncate">
                  Equipo: <span className="text-white font-medium">{jugador.equipos?.nombre || 'Sin equipo'}</span>
                </p>
              </div>

              <div className="flex flex-col items-center border-l border-white/10 pl-4 mt-4">
                <span className="text-2xl font-black text-white leading-none">
                  {jugador.goles}
                </span>
                <span className="text-[8px] text-[#34D399] uppercase font-bold mb-2">
                  GOLES
                </span>
                
                <button 
                  onClick={dispararConfeti} 
                  className="flex flex-col items-center hover:scale-110 transition-transform"
                >
                  <Heart size={28} className="text-zinc-500" />
                  <span className="text-[10px] text-zinc-400 font-bold mt-1">0</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Navbar />
    </main>
  )
}