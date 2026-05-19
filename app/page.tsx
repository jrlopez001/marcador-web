'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../utils/supabase/client'

export default function Home() {
  const [partidos, setPartidos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  const supabase = createClient()

  async function getPartidos() {
    const { data, error } = await supabase
      .from('partidos')
      .select(`
        id,
        goles_ep1,
        goles_ep2,
        estado,
        periodo_actual,
        categorias (nombre),
        equipo1:equipo1_id (nombre),
        equipo2:equipo2_id (nombre)
      `)

    if (error) {
      console.error('Error cargando partidos:', error.message)
    } else {
      setPartidos(data || [])
    }

    setCargando(false)
  }

  useEffect(() => {
    getPartidos()

    const canal = supabase
      .channel('realtime-partidos')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'partidos',
        },
        () => {
          getPartidos()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#020617] text-white px-3 py-5 sm:px-5">
      
      {/* HEADER */}
      <header className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black italic uppercase leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
          Marcador
          <br />
          Web
        </h1>

        <p className="mt-4 text-slate-500 text-xs sm:text-sm uppercase tracking-[0.3em] font-bold">
          Resultados en Vivo
        </p>
      </header>

      {/* CONTENIDO */}
      <div className="max-w-4xl mx-auto grid gap-6">

        {cargando ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center animate-pulse">
            Cargando marcador...
          </div>
        ) : partidos.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center text-yellow-500">
            No hay partidos activos
          </div>
        ) : (
          partidos.map((partido) => (
            <div
              key={partido.id}
              className="overflow-hidden rounded-[30px] border border-slate-800 bg-slate-900 shadow-2xl"
            >

              {/* TOP BAR */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-800/40 px-4 py-3">
                
                <div className="text-[11px] sm:text-sm font-black uppercase tracking-wider text-green-400">
                  ● {partido.estado?.replace('_', ' ') || 'EN CURSO'}
                </div>

                <div className="text-[10px] sm:text-xs uppercase text-slate-400 font-bold text-right">
                  Categoría: {partido.categorias?.nombre || 'General'}
                </div>
              </div>

              {/* BODY */}
              <div className="px-4 py-8 sm:px-8">

                <div className="flex flex-col items-center text-center gap-6">

                  {/* EQUIPO 1 */}
                  <div className="w-full">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase text-white leading-tight break-words">
                      {partido.equipo1?.nombre || 'Local'}
                    </h2>
                  </div>

                  {/* SCORE */}
                  <div className="w-full max-w-[320px] sm:max-w-[420px] bg-black border-2 border-slate-700 rounded-[28px] px-4 py-5 sm:px-8 sm:py-7 shadow-[0_0_30px_rgba(34,197,94,0.12)]">
                    
                    <div className="flex items-center justify-center gap-4 sm:gap-6">

                      <span className="text-7xl sm:text-8xl md:text-9xl font-black text-green-400 leading-none tabular-nums">
                        {partido.goles_ep1}
                      </span>

                      <span className="text-3xl sm:text-5xl font-black text-slate-700">
                        -
                      </span>

                      <span className="text-7xl sm:text-8xl md:text-9xl font-black text-green-400 leading-none tabular-nums">
                        {partido.goles_ep2}
                      </span>

                    </div>
                  </div>

                  {/* EQUIPO 2 */}
                  <div className="w-full">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase text-white leading-tight break-words">
                      {partido.equipo2?.nombre || 'Visitante'}
                    </h2>
                  </div>

                </div>
              </div>

              {/* FOOTER */}
              <div className="border-t border-slate-800 bg-slate-800/20 px-4 py-4 text-center">
                <p className="text-sm sm:text-lg uppercase tracking-[0.2em] text-slate-500 font-bold">
                  {partido.periodo_actual?.replace('_', ' ') || 'Tiempo Regular'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}