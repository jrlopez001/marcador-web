'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import Navbar from '../Navbar'

const colorMap: Record<string, any> = {
  Libre: {
    border: 'border-blue-500/30',
    shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.3),inset_0_0_10px_rgba(59,130,246,0.1)]',
    glow: 'rgba(59,130,246,0.5)',
    tabColor: '#3b82f6',
    textColor: 'text-blue-400',
  },
  Master: {
    border: 'border-emerald-500/30',
    shadow: 'shadow-[0_0_20px_rgba(52,211,153,0.3),inset_0_0_10px_rgba(52,211,153,0.1)]',
    glow: 'rgba(52,211,153,0.5)',
    tabColor: '#34D399',
    textColor: 'text-emerald-400',
  },
  Femenino: {
    border: 'border-purple-500/30',
    shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.3),inset_0_0_10px_rgba(168,85,247,0.1)]',
    glow: 'rgba(168,85,247,0.5)',
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

  const supabase = createClient()
  const colors = colorMap[categoria]
  const channelRef = useRef<any>(null)
  const isSubscribedRef = useRef(false)

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

  useEffect(() => {
    let isActive = true

    const setup = async () => {
      setLoading(true)
      setError(null)

      try {
        // Obtener ID de la categoría
        const { data: catData, error: catErr } = await supabase
          .from('categorias')
          .select('id')
          .eq('nombre', categoria)
          .single()

        if (catErr || !catData) throw new Error(`Categoría "${categoria}" no encontrada`)
        const categoriaId = catData.id

        // Cargar datos iniciales
        if (isActive) await fetchPosiciones(categoriaId)

        // --- Limpiar canal anterior si existe ---
        if (channelRef.current) {
          await supabase.removeChannel(channelRef.current)
          channelRef.current = null
          isSubscribedRef.current = false
        }

        // --- Crear nuevo canal con los callbacks ANTES de suscribirse ---
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
                fetchPosiciones(categoriaId)
              }
            }
          )

        // Ahora suscribirse
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
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
        isSubscribedRef.current = false
      }
    }
  }, [categoria, supabase])

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
        <div className={`flex-1 overflow-x-auto bg-[#111827] rounded-xl border ${colors.border} ${colors.shadow} electric-glow`}>
          {loading ? (
            <div className="p-8 text-center text-zinc-400">Cargando posiciones...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-400">{error}</div>
          ) : equipos.length === 0 ? (
            <div className="p-8 text-center text-zinc-400">No hay equipos en esta categoría o aún no hay partidos finalizados.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-400 border-b border-zinc-800">
                  <th className="p-3 text-left">EQUIPOS</th>
                  <th className={`p-3 text-center ${colors.textColor}`}>Pts</th>
                  <th className="p-3 text-center">Jugados</th>
                  <th className="p-3 text-center">Ganados</th>
                  <th className="p-3 text-center">Perdidos</th>
                  <th className="p-3 text-center">Goles</th>
                </tr>
              </thead>
              <tbody>
                {equipos.map((eq) => (
                  <tr key={eq.id} className="border-b border-zinc-800/50">
                    <td className="p-3 font-medium flex items-center gap-3">
                      <span
                        className="w-6 h-6 flex items-center justify-center rounded text-xs font-bold text-black"
                        style={{ backgroundColor: colors.tabColor }}
                      >
                        {eq.pos}
                      </span>
                      {eq.nombre}
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
          )}
        </div>
      </div>

      <style jsx global>{`
        .electric-glow {
          animation: pulse-border 2s infinite ease-in-out;
        }
        @keyframes pulse-border {
          0%, 100% {
            box-shadow: 0 0 15px ${colors.glow}, inset 0 0 10px ${colors.glow};
          }
          50% {
            box-shadow: 0 0 30px ${colors.glow}, inset 0 0 20px ${colors.glow};
          }
        }
      `}</style>
      <Navbar />
    </main>
  )
}