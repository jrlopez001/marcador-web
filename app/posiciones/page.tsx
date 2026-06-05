'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import Navbar from '../Navbar'

// Configuración de colores (igual)
const colorMap: Record<string, { border: string; shadow: string; glow: string; tabColor: string; textColor: string }> = {
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
  e: number
  p: number
}

export default function PosicionesPage() {
  const [categoria, setCategoria] = useState('Master')
  const [equipos, setEquipos] = useState<EquipoPosicion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const colors = colorMap[categoria]

  useEffect(() => {
    const fetchPosiciones = async () => {
      setLoading(true)
      setError(null)

      try {
        // 1. Obtener ID de la categoría seleccionada
        const { data: categoriaData, error: catError } = await supabase
          .from('categorias')
          .select('id')
          .eq('nombre', categoria)
          .single()

        if (catError || !categoriaData) {
          throw new Error(`Categoría "${categoria}" no encontrada`)
        }
        const categoriaId = categoriaData.id

        // 2. Obtener equipos a través de la tabla puente equipos_categorias
        const { data: equiposPuente, error: puenteError } = await supabase
          .from('equipos_categorias')
          .select('equipo_id')
          .eq('categoria_id', categoriaId)

        if (puenteError) throw puenteError

        if (!equiposPuente || equiposPuente.length === 0) {
          setEquipos([])
          setLoading(false)
          return
        }

        const equipoIds = equiposPuente.map(item => item.equipo_id)

        // Obtener los datos completos de los equipos
        const { data: equiposData, error: eqError } = await supabase
          .from('equipos')
          .select('id, nombre')
          .in('id', equipoIds)

        if (eqError) throw eqError
        if (!equiposData || equiposData.length === 0) {
          setEquipos([])
          setLoading(false)
          return
        }

        // 3. Obtener partidos finalizados de esta categoría
        const { data: partidosData, error: partError } = await supabase
          .from('partidos')
          .select('equipo1_id, equipo2_id, goles_ep1, goles_ep2')
          .eq('categoria_id', categoriaId)
          .eq('estado', 'FINALIZADO')

        if (partError) throw partError

        // 4. Inicializar estadísticas
        const stats: Record<string, { pts: number; j: number; g: number; e: number; p: number }> = {}
        equiposData.forEach((eq) => {
          stats[eq.id] = { pts: 0, j: 0, g: 0, e: 0, p: 0 }
        })

        // 5. Procesar cada partido
        for (const partido of partidosData || []) {
          const { equipo1_id, equipo2_id, goles_ep1, goles_ep2 } = partido

          const procesar = (eqId: string, gf: number, gc: number) => {
            if (!stats[eqId]) return
            stats[eqId].j += 1
            if (gf > gc) {
              stats[eqId].g += 1
              stats[eqId].pts += 3
            } else if (gf === gc) {
              stats[eqId].e += 1
              stats[eqId].pts += 1
            } else {
              stats[eqId].p += 1
            }
          }

          procesar(equipo1_id, goles_ep1, goles_ep2)
          procesar(equipo2_id, goles_ep2, goles_ep1)
        }

        // 6. Construir array con estadísticas
        let equiposConStats = equiposData.map((eq) => ({
          id: eq.id,
          nombre: eq.nombre,
          ...stats[eq.id],
        }))

        // Ordenar por puntos descendente
        equiposConStats.sort((a, b) => {
          if (a.pts !== b.pts) return b.pts - a.pts
          return a.nombre.localeCompare(b.nombre)
        })

        // Asignar posición
        const resultado: EquipoPosicion[] = equiposConStats.map((eq, idx) => ({
          pos: idx + 1,
          ...eq,
        }))

        setEquipos(resultado)
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Error al cargar las posiciones')
      } finally {
        setLoading(false)
      }
    }

    fetchPosiciones()
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

      <div className="relative flex flex-col md:flex-row gap-4 items-start">
        <div className="bg-[#111827] border border-zinc-800 p-3 rounded-lg text-[10px] text-zinc-400 w-full md:w-32 shadow-lg">
          <p><span className="font-bold text-white">Pts</span> - Puntos</p>
          <p><span className="font-bold text-white">J</span> - Juegos</p>
          <p><span className="font-bold text-white">G</span> - Ganados</p>
          <p><span className="font-bold text-white">E</span> - Empates</p>
          <p><span className="font-bold text-white">P</span> - Perdido</p>
        </div>

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
                  <th className="p-3 text-center">J</th>
                  <th className="p-3 text-center">G</th>
                  <th className="p-3 text-center">E</th>
                  <th className="p-3 text-center">P</th>
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
                    <td className="p-3 text-center">{eq.e}</td>
                    <td className="p-3 text-center">{eq.p}</td>
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