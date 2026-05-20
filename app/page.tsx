'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '../utils/supabase/client'

export default function Home() {
  const [partidos, setPartidos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [mostrarGol, setMostrarGol] = useState(false)

  const marcadorAnterior = useRef<any>({})

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
      console.error(error.message)
      return
    }

    if (data) {
      data.forEach((partido) => {
        const anterior = marcadorAnterior.current[partido.id]

        if (
          anterior &&
          (
            partido.goles_ep1 > anterior.goles_ep1 ||
            partido.goles_ep2 > anterior.goles_ep2
          )
        ) {

          // ACTIVAR ANIMACION
          setMostrarGol(true)

          setTimeout(() => {
            setMostrarGol(false)
          }, 4000)
        }

        marcadorAnterior.current[partido.id] = {
          goles_ep1: partido.goles_ep1,
          goles_ep2: partido.goles_ep2,
        }
      })

      setPartidos(data)
      setCargando(false)
    }
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
    <main className="min-h-screen bg-[#020617] text-white px-3 py-5 overflow-hidden">

      {/* ANIMACION GOL */}
      {mostrarGol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">

          {/* FONDO PARPADEANTE */}
          <div className="absolute inset-0 bg-green-500 animate-pulse opacity-20"></div>

          {/* TEXTO */}
          <div className="relative animate-bounce">

            <h1
              className="
                text-[100px]
                sm:text-[180px]
                md:text-[250px]
                font-black
                text-green-400
                uppercase
                tracking-tight
                animate-pulse
                drop-shadow-[0_0_80px_rgba(34,197,94,1)]
              "
            >
              GOOOOL
            </h1>

          </div>

          {/* PELOTAS */}
          <div className="absolute top-10 left-10 text-7xl animate-spin">
            ⚽
          </div>

          <div className="absolute top-16 right-16 text-6xl animate-bounce">
            ⚽
          </div>

          <div className="absolute bottom-10 left-20 text-8xl animate-ping">
            ⚽
          </div>

          <div className="absolute bottom-10 right-10 text-7xl animate-spin">
            ⚽
          </div>

        </div>
      )}

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

              <div className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-800/40 px-4 py-3">

                <div className="text-[11px] sm:text-sm font-black uppercase tracking-wider text-green-400">
                  ● {partido.estado?.replace('_', ' ') || 'EN CURSO'}
                </div>

                <div className="text-[10px] sm:text-xs uppercase text-slate-400 font-bold text-right">
                  Categoría: {partido.categorias?.nombre || 'General'}
                </div>
              </div>

              <div className="px-4 py-8 sm:px-8">

                <div className="flex flex-col items-center text-center gap-6">

                  <div className="w-full">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase text-white">
                      {partido.equipo1?.nombre || 'Local'}
                    </h2>
                  </div>

                  <div className="w-full max-w-[420px] bg-black border-2 border-slate-700 rounded-[28px] px-8 py-7">

                    <div className="flex items-center justify-center gap-6">

                      <span className="text-7xl sm:text-8xl md:text-9xl font-black text-green-400">
                        {partido.goles_ep1}
                      </span>

                      <span className="text-5xl font-black text-slate-700">
                        -
                      </span>

                      <span className="text-7xl sm:text-8xl md:text-9xl font-black text-green-400">
                        {partido.goles_ep2}
                      </span>

                    </div>
                  </div>

                  <div className="w-full">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase text-white">
                      {partido.equipo2?.nombre || 'Visitante'}
                    </h2>
                  </div>

                </div>
              </div>

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