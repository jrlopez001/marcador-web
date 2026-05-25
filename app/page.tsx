'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../utils/supabase/client'

export default function Home() {
  const [partidos, setPartidos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [isChecking, setIsChecking] = useState(true)
  const [mostrarGol, setMostrarGol] = useState(false)
  const [categoriaActiva, setCategoriaActiva] = useState('Libre')
  const [eventoActivo, setEventoActivo] = useState('VIERNES')
  const [countdown, setCountdown] = useState('')
  const [eventoIniciado, setEventoIniciado] = useState(false)

  //Contador Fecha
  const fechaEvento = new Date('2026-05-24T08:51:00')
  const marcadorAnterior = useRef<any>({})
  const supabase = createClient()

  // Verificación inicial para evitar parpadeo
  useEffect(() => {
    const ahora = new Date()
    if (ahora.getTime() >= fechaEvento.getTime()) {
      setEventoIniciado(true)
    }
    setIsChecking(false)
  }, [])

  async function getPartidos() {
    const { data, error } = await supabase
      .from('partidos')
      .select(`
        id,
        goles_ep1,
        goles_ep2,
        estado,
        periodo_actual,
        likes,
        evento,
        categorias (nombre),
        equipo1:equipo1_id (nombre),
        equipo2:equipo2_id (nombre)
      `)
      .eq('evento', eventoActivo)

    if (error) {
      console.error(error.message)
      return
    }

    if (data) {
      data.forEach((partido) => {
        const anterior = marcadorAnterior.current[partido.id]

        if (
          anterior &&
          (partido.goles_ep1 > anterior.goles_ep1 ||
            partido.goles_ep2 > anterior.goles_ep2)
        ) {
          setMostrarGol(true)
          setTimeout(() => setMostrarGol(false), 4000)
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
        'postgres_changes',
        { event: '*', schema: 'public', table: 'partidos' },
        () => getPartidos()
      )
      .subscribe()

    const timer = setInterval(() => {
      const ahora = new Date()
      const diferencia = fechaEvento.getTime() - ahora.getTime()

      if (diferencia <= 0) {
        setEventoIniciado(true)
        clearInterval(timer)
      } else {
        const d = Math.floor(diferencia / (1000 * 60 * 60 * 24))
        const h = Math.floor((diferencia / (1000 * 60 * 60)) % 24)
        const m = Math.floor((diferencia / (1000 * 60)) % 60)
        const s = Math.floor((diferencia / 1000) % 60)

        setCountdown(`${d}D ${h}H ${m}M ${s}S`)
      }
    }, 1000)

    return () => {
      supabase.removeChannel(canal)
      clearInterval(timer)
    }
  }, [eventoActivo])

  async function darLike(id: number) {
    const yaDioLike = localStorage.getItem(`like-${id}`)

    if (yaDioLike) {
      alert('Ya diste like a este partido')
      return
    }

    const partido = partidos.find((p) => p.id === id)

    if (!partido) return

    const { error } = await supabase
      .from('partidos')
      .update({ likes: (partido.likes || 0) + 1 })
      .eq('id', id)

    if (!error) localStorage.setItem(`like-${id}`, 'true')
  }

  // Función para determinar qué equipo va ganando
  function obtenerGanador(goles1: number, goles2: number) {
    if (goles1 > goles2) return 'local'
    if (goles2 > goles1) return 'visitante'
    return 'empate'
  }

  // Si aún estamos calculando el estado, no mostramos nada
  if (isChecking) return <main className="min-h-screen bg-[#020617]" />

  if (!eventoIniciado) {
    return (
      <main className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
        <div className="text-4xl sm:text-6xl font-black text-green-400">
          {countdown}
        </div>
        <p className="mt-4 text-slate-500 uppercase tracking-widest font-bold">
          Cuenta regresiva
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white px-3 py-5 overflow-hidden">
      {mostrarGol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <div className="absolute inset-0 bg-green-500 animate-pulse opacity-20"></div>

          <div className="relative animate-bounce">
            <h1 className="text-[100px] sm:text-[180px] md:text-[250px] font-black text-green-400 uppercase tracking-tight animate-pulse drop-shadow-[0_0_80px_rgba(34,197,94,1)]">
              GOOOOL
            </h1>
          </div>

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

      <header className="max-w-4xl mx-auto text-center mb-8">
        <div className="flex justify-start gap-3 mb-6 flex-wrap">
          <Link
            href="/torneo"
            className="bg-slate-800 hover:bg-green-500 transition-all duration-300 px-6 py-3 rounded-2xl border border-slate-700 font-black uppercase hover:scale-105"
          >
            🏆 Torneo
          </Link>

          <select
            value={eventoActivo}
            onChange={(e) => setEventoActivo(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3 font-black uppercase text-white outline-none cursor-pointer hover:border-green-500 transition-all"
          >
            <option value="VIERNES">📅 Viernes</option>
            <option value="SABADO">📅 Sábado</option>
          </select>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black italic uppercase leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
          Marcador
          <br />
          Web
        </h1>
      </header>

      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-2 flex gap-2">
          {['Libre', 'Master', 'Femenino'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`flex-1 py-3 rounded-xl font-black uppercase transition-all ${
                categoriaActiva === cat
                  ? 'bg-green-400 text-black'
                  : 'bg-transparent text-white hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

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
          partidos
            .filter((p) => p.categorias?.nombre === categoriaActiva)
            .map((partido) => {
              const ganador = obtenerGanador(
                partido.goles_ep1,
                partido.goles_ep2
              )

              return (
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
                      {/* EQUIPO LOCAL */}
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase text-white flex items-center gap-2">
                        {partido.equipo1?.nombre || 'Local'}

                        {ganador === 'local' && (
                          <span className="text-green-400 text-3xl sm:text-4xl animate-bounce">
                            ⚽
                          </span>
                        )}
                      </h2>

                      <div className="w-full max-w-[420px] bg-black border-2 border-slate-700 rounded-[28px] px-8 py-7 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
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

                      {/* EQUIPO VISITANTE */}
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase text-white flex items-center gap-2">
                        {ganador === 'visitante' && (
                          <span className="text-green-400 text-3xl sm:text-4xl animate-bounce">
                            ⚽
                          </span>
                        )}

                        {partido.equipo2?.nombre || 'Visitante'}
                      </h2>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 bg-slate-800/20 px-4 py-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-sm sm:text-lg uppercase tracking-[0.2em] text-slate-500 font-bold">
                        {partido.periodo_actual?.replace('_', ' ') ||
                          'Tiempo Regular'}
                      </p>

                      <button
                        onClick={() => darLike(partido.id)}
                        className="bg-slate-800 hover:bg-green-500 transition-all duration-300 px-5 py-3 rounded-2xl border border-slate-700 hover:scale-110 active:scale-95"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">👍</span>

                          <div className="text-left">
                            <p className="text-xs uppercase text-slate-400 font-bold">
                              Buen Partido
                            </p>

                            <p className="text-2xl font-black text-white">
                              {partido.likes || 0}
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
        )}
      </div>
    </main>
  )
}