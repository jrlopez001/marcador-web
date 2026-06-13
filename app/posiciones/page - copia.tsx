'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import Navbar from '../Navbar'

const colorMap: Record<string, any> = {
  Libre: {
    border: 'border-blue-500/30',
    shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.3),inset_0_0_10px_rgba(59,130,246,0.1)]',
    glow: '#3b82f6',
    tabColor: '#3b82f6',
    textColor: 'text-blue-400',
  },
  Master: {
    border: 'border-emerald-500/30',
    shadow: 'shadow-[0_0_20px_rgba(52,211,153,0.3),inset_0_0_10px_rgba(52,211,153,0.1)]',
    glow: '#34D399',
    tabColor: '#34D399',
    textColor: 'text-emerald-400',
  },
  Femenino: {
    border: 'border-purple-500/30',
    shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.3),inset_0_0_10px_rgba(168,85,247,0.1)]',
    glow: '#a855f7',
    tabColor: '#a855f7',
    textColor: 'text-purple-400',
  },
}

interface EquipoPosicion {
  pos: number
  id: string
  nombre: string
  pts: number
  j: number
  g: number
  p: number
  gf: number
}

export default function PosicionesPage() {
  const [categoria, setCategoria] = useState('Master')
  const [equipos, setEquipos] = useState<EquipoPosicion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const colors = colorMap[categoria]
  const channelRef = useRef<any>(null)
  const isSubscribedRef = useRef(false)
  const debounceRef = useRef<NodeJS.Timeout>()

  const fetchPosiciones = async (categoriaId: string) => {
    try {
      const { data, error: statsError } = await supabase
        .from('equipos_categorias')
        .select(`
          equipo_id,
          partidos_jugados,
          ganados,
          perdidos,
          goles_favor,
          puntos,
          equipos ( nombre )
        `)
        .eq('categoria_id', categoriaId)

      if (statsError) throw statsError

      if (!data || data.length === 0) {
        setEquipos([])
        return
      }

      let equiposConStats = data.map((item: any) => ({
        id: item.equipo_id,
        nombre: item.equipos?.nombre || 'Sin nombre',
        pts: item.puntos || 0,
        j: item.partidos_jugados || 0,
        g: item.ganados || 0,
        p: item.perdidos || 0,
        gf: item.goles_favor || 0,
      }))

      equiposConStats.sort((a, b) => {
        if (a.pts !== b.pts) return b.pts - a.pts
        return a.nombre.localeCompare(b.nombre)
      })

      const resultado = equiposConStats.map((eq, idx) => ({ pos: idx + 1, ...eq }))
      setEquipos(resultado)
    } catch (err: any) {
      console.error(err)
      throw err
    }
  }

  const refreshData = (categoriaId: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchPosiciones(categoriaId)
    }, 500)
  }

  useEffect(() => {
    let isActive = true

    const setup = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data: catData, error: catErr } = await supabase
          .from('categorias')
          .select('id')
          .eq('nombre', categoria)
          .single()

        if (catErr || !catData) throw new Error(`Categoría "${categoria}" no encontrada`)
        const categoriaId = catData.id

        if (isActive) await fetchPosiciones(categoriaId)

        if (channelRef.current) {
          await supabase.removeChannel(channelRef.current)
          channelRef.current = null
          isSubscribedRef.current = false
        }

        const newChannel = supabase
          .channel(`equipos-categoria-${categoriaId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'equipos_categorias',
              filter: `categoria_id=eq.${categoriaId}`,
            },
            () => {
              if (isActive && categoriaId === catData.id) {
                refreshData(categoriaId)
              }
            }
          )

        newChannel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            isSubscribedRef.current = true
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Error en canal Realtime')
          }
        })

        channelRef.current = newChannel
      } catch (err: any) {
        if (isActive) setError(err.message)
      } finally {
        if (isActive) setLoading(false)
      }
    }

    setup()

    return () => {
      isActive = false
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
        isSubscribedRef.current = false
      }
    }
  }, [categoria])

  return (
    <main className="min-h-screen bg-[#0B1120] text-white p-4 font-sans pb-32">
      <h1 className="text-center text-[#34D399] font-black tracking-[0.2em] text-lg uppercase mb-8 mt-6">
        Tabla de Posiciones
      </h1>

      <div className="flex p-1 bg-[#1a2234] rounded-xl w-full mb-8 border border-zinc-800">
        {['Libre', 'Master', 'Femenino'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoria(cat)}
            className="relative flex-1 py-2.5 text-sm font-semibold transition-colors duration-300"
          >
            {categoria === cat && (
              <motion.div
                layoutId="glow"
                className="absolute inset-0 rounded-lg"
                style={{ backgroundColor: colorMap[cat].tabColor }}
                transition={{ type: 'spring', duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{cat}</span>
          </button>
        ))}
      </div>

      <div className="relative flex flex-col gap-4 items-start">
        <div className={`flex-1 w-full bg-[#111827] rounded-xl border ${colors.border} ${colors.shadow} pulse-opacity`}>
          {loading ? (
            <div className="p-8 text-center text-zinc-400">Cargando posiciones...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-400">{error}</div>
          ) : equipos.length === 0 ? (
            <div className="p-8 text-center text-zinc-400">
              No hay equipos en esta categoría o aún no hay partidos finalizados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-400 border-b border-zinc-800">
                    <th className="p-3 text-left">EQUIPOS</th>
                    <th className={`p-3 text-center ${colors.textColor}`}>PTS</th>
                    <th className="p-3 text-center">PJ</th>
                    <th className="p-3 text-center">PG</th>
                    <th className="p-3 text-center">PP</th>
                    <th className="p-3 text-center">GF</th>
                  </tr>
                </thead>
                <tbody>
                  {equipos.map((eq) => (
                    <tr key={eq.id} className="border-b border-zinc-800/50">
                      <td className="p-3 font-medium">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-6 h-6 flex items-center justify-center rounded text-xs font-bold text-black"
                            style={{ backgroundColor: colors.tabColor }}
                          >
                            {eq.pos}
                          </span>
                          {eq.nombre}
                        </div>
                      </td>
                      <td className={`p-3 text-center font-bold ${colors.textColor}`}>{eq.pts}</td>
                      <td className="p-3 text-center">{eq.j}</td>
                      <td className="p-3 text-center">{eq.g}</td>
                      <td className="p-3 text-center">{eq.p}</td>
                      <td className="p-3 text-center font-mono">{eq.gf}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Leyenda con colores dinámicos según categoría */}
      <div
        className="mt-6 flex flex-wrap justify-center gap-4 text-xs bg-[#111827]/50 p-3 rounded-xl border"
        style={{ borderColor: colors.tabColor }}
      >
        <div className="flex items-center gap-1">
          <span className={`font-bold ${colors.textColor}`}>PTS</span>
          <span className="text-zinc-400">Puntos</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`font-bold ${colors.textColor}`}>PJ</span>
          <span className="text-zinc-400">Partidos Jugados</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`font-bold ${colors.textColor}`}>PG</span>
          <span className="text-zinc-400">Partidos Ganados</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`font-bold ${colors.textColor}`}>PP</span>
          <span className="text-zinc-400">Partidos Perdidos</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`font-bold ${colors.textColor}`}>GF</span>
          <span className="text-zinc-400">Goles a Favor</span>
        </div>
      </div>

      <style jsx global>{`
        .pulse-opacity {
          animation: pulse-opacity 2s infinite ease-in-out;
          will-change: transform, opacity;
        }
        @keyframes pulse-opacity {
          0%, 100% {
            transform: scale(1);
            opacity: 0.95;
          }
          50% {
            transform: scale(1.005);
            opacity: 1;
          }
        }
      `}</style>

      <Navbar />
    </main>
  )
}