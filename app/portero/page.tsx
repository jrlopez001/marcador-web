'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import confetti from 'canvas-confetti'
import Navbar from '../Navbar'

interface Portero {
  id: number
  nombre: string
  numero_camisola: number
  goles_recibidos: number
  equipos?: {
    nombre: string
  }
  categorias?: {
    nombre: string
  }
}

export default function PorteroPage() {
  const [porteros, setPorteros] = useState<Portero[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  
  const hayDatos = porteros.length > 0

  const supabase = createClient()

  const categorias = ['Todos', 'Libre', 'Master', 'Femenino']

  const dispararConfeti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
  }

  async function fetchPorteros(categoria = 'Todos') {
    const { data, error } = await supabase
      .from('jugadores')
      .select(`
        id,
        nombre,
        numero_camisola,
        goles_recibidos,
        equipos(nombre),
        categorias(nombre)
      `)
      .eq('posicion', 'PORTERO')
      .order('goles_recibidos', { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    const porterosNormalizados: Portero[] = (data || [])
      .map((p: any) => ({
        id: p.id,
        nombre: p.nombre,
        numero_camisola: p.numero_camisola,
        goles_recibidos: p.goles_recibidos ?? 0,
        equipos: Array.isArray(p.equipos) ? p.equipos[0] : p.equipos,
        categorias: Array.isArray(p.categorias) ? p.categorias[0] : p.categorias,
      }))
      .filter((p) => categoria === 'Todos' || p.categorias?.nombre === categoria)
      .slice(0, 5)

    setPorteros(porterosNormalizados)
  }

  useEffect(() => {
    fetchPorteros(categoriaActiva)
  }, [categoriaActiva])

  useEffect(() => {
    const channel = supabase
      .channel('porteros-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'jugadores' }, () => {
        fetchPorteros(categoriaActiva)
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
          Portero Menos Vencido
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
            El desafío es grande, pero su convicción es mayor: el arco ha dejado de ser una opción para el rival.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {porteros.map((portero, index) => (
            <div
              key={portero.id}
              className={`p-4 rounded-2xl shadow-lg flex items-center transition-all border relative ${
                index === 0
                  ? 'bg-[#1a1b16] border-cyan-500/50'
                  : 'bg-[#111827] border-white/5'
              }`}
            >
              <span className="absolute top-2 left-3 text-[8px] bg-[#1E293B] text-[#34D399] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                {portero.categorias?.nombre}
              </span>

              <div className="flex flex-col items-center pr-4 border-r border-white/10 mt-4">
                <span className="text-[7px] uppercase font-bold text-zinc-500">CAMISOLA #</span>
                <span className="font-black text-lg text-[#34D399]">
                  {portero.numero_camisola}
                </span>
              </div>

              <div className="flex-1 pl-4 mt-4">
                <h3 className="font-bold text-lg text-white leading-tight">
                  {portero.nombre}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Equipo: <span className="text-white font-medium">{portero.equipos?.nombre || 'Sin equipo'}</span>
                </p>
              </div>

              <div className="flex flex-col items-center border-l border-white/10 pl-4 mt-4">
                <span className="text-2xl font-black text-white leading-none">
                  {portero.goles_recibidos}
                </span>
                <span className="text-[8px] text-cyan-400 uppercase font-bold mb-2">
                  RECIBIDOS
                </span>
                
                <button 
                  onClick={dispararConfeti} 
                  className="flex flex-col items-center hover:scale-110 transition-transform"
                >
                  <Heart 
                    size={28} 
                    className="text-white fill-transparent hover:fill-red-500 hover:text-red-500 transition-colors" 
                  />
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