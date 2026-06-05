'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '../utils/supabase/client'
import Navbar from './Navbar'

export default function Home() {
  const [partidos, setPartidos] = useState<any[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  const [eventoActivo, setEventoActivo] = useState('VIERNES')
  const [mostrarGol, setMostrarGol] = useState(false)
  const [golInfo, setGolInfo] = useState<any>({})
  const [likesLocales, setLikesLocales] = useState<string[]>([])

  const marcadorAnterior = useRef<any>({})
  const supabase = createClient()

  // CARGAR LIKES
  useEffect(() => {
    const guardados = JSON.parse(localStorage.getItem('likes_partidos') || '[]')
    setLikesLocales(guardados)
  }, [])

  // PEDIR PERMISO DE NOTIFICACIONES
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission()
    }
  }, [])

  async function toggleLike(partidoId: string, likesActuales: number) {
    const likesGuardados = JSON.parse(localStorage.getItem('likes_partidos') || '[]')

    if (likesGuardados.includes(partidoId)) return

    const nuevoTotal = likesActuales + 1

    const { error } = await supabase
      .from('partidos')
      .update({ likes: nuevoTotal })
      .eq('id', partidoId)

    if (!error) {
      const nuevosLikes = [...likesGuardados, partidoId]

      localStorage.setItem('likes_partidos', JSON.stringify(nuevosLikes))

      setLikesLocales(nuevosLikes)

      setPartidos((prev) =>
        prev.map((p) =>
          p.id === partidoId
            ? { ...p, likes: nuevoTotal }
            : p
        )
      )
    }
  }

  async function fetchPartidos() {
    const { data } = await supabase
      .from('partidos')
      .select(`
        id,
        likes,
        goles_ep1,
        goles_ep2,
        estado,
        periodo_actual,
        evento,
        categorias (nombre),
        equipo1:equipo1_id (nombre),
        equipo2:equipo2_id (nombre),
        goles (
          jugadores (nombre, numero_camisola),
          equipos (nombre)
        )
      `)
      .eq('evento', eventoActivo)
      .order('categorias(nombre)', { ascending: true })

    if (data) {
      data.forEach((p) => {
        const anterior = marcadorAnterior.current[p.id]

        if (
          anterior &&
          (
            p.goles_ep1 > anterior.goles_ep1 ||
            p.goles_ep2 > anterior.goles_ep2
          )
        ) {
          const ultimoGol =
            p.goles && p.goles.length > 0
              ? p.goles[p.goles.length - 1]
              : null

          setMostrarGol(true)

          if (navigator.vibrate) {
            navigator.vibrate([300, 100, 300])
          }

          if (ultimoGol) {
            const jugador =
              ultimoGol.jugadores &&
              Array.isArray(ultimoGol.jugadores)
                ? ultimoGol.jugadores[0]
                : ultimoGol.jugadores

            const equipo =
              ultimoGol.equipos &&
              Array.isArray(ultimoGol.equipos)
                ? ultimoGol.equipos[0]
                : ultimoGol.equipos

            // GUARDAR INFO DEL GOL
            setGolInfo((prev: any) => ({
              ...prev,
              [p.id]: {
                nombre: jugador?.nombre || 'Jugador',
                numero: jugador?.numero_camisola || '0',
                equipo: equipo?.nombre || 'Equipo'
              }
            }))

            // NOTIFICACIÓN
            if (
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              new Notification('⚽ ¡GOOOOL!', {
                body: `${jugador?.nombre || 'Jugador'} anotó para ${equipo?.nombre || 'Equipo'}`,
                icon: '/icon-192.png'
              })
            }
          }

          setTimeout(() => setMostrarGol(false), 1300)

          setTimeout(() => {
            setGolInfo((prev: any) => ({
              ...prev,
              [p.id]: null
            }))
          }, 15000)
        }

        marcadorAnterior.current[p.id] = {
          goles_ep1: p.goles_ep1,
          goles_ep2: p.goles_ep2
        }
      })

      setPartidos(data || [])
    }
  }

  useEffect(() => {
    fetchPartidos()

    const channel = supabase
      .channel('realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'partidos'
        },
        () => fetchPartidos()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventoActivo])

  const getTiempoColor = (t: string) => {
    const str = t?.toLowerCase() || ''

    if (str.includes('1er')) return 'text-emerald-400'
    if (str.includes('2do')) return 'text-orange-400'
    if (str.includes('finalizado')) return 'text-red-500'

    return 'text-zinc-500'
  }

  return (
    <main className="min-h-screen bg-[#0B1120] text-white p-4 font-sans pb-28">

      {mostrarGol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <div className="absolute inset-0 bg-green-500 animate-pulse opacity-20"></div>

          <h1 className="text-[100px] font-black text-green-400 uppercase animate-pulse">
            GOOOOL
          </h1>
        </div>
      )}

      <div className="flex justify-between items-center mb-6 mt-2">
        <h1 className="text-[#34D399] font-black tracking-[0.2em] text-[15px] opacity-80 uppercase">
          MARCADOR WEB
        </h1>
      </div>

      <div className="flex gap-4 mb-6">
        {['VIERNES', 'SABADO'].map((e) => (
          <button
            key={e}
            onClick={() => setEventoActivo(e)}
            className={`px-8 py-3 rounded-full text-sm font-bold ${
              eventoActivo === e
                ? 'bg-[#34D399] text-[#0B1120]'
                : 'bg-[#1E293B] text-zinc-500'
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      <div className="text-zinc-500 font-bold mb-6 flex gap-6 overflow-x-auto pb-2">
        {['Todos', 'Libre', 'Master', 'Femenino'].map((cat) => (
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
        {partidos
          .filter(
            (p) =>
              categoriaActiva === 'Todos' ||
              p.categorias?.nombre === categoriaActiva
          )
          .map((p) => (
            <div
              key={p.id}
              className={`p-3 rounded-xl border transition-all duration-500 ${
                golInfo[p.id]
                  ? 'bg-green-900/20 border-green-500/50'
                  : 'bg-[#111827] border-slate-800'
              }`}
            >

              {golInfo[p.id] && (
                <div className="mb-2 text-[10px] text-green-400 font-bold text-center border-b border-green-500/20 pb-1">
                  ⚽ ¡GOL DE: {golInfo[p.id].nombre} (#
                  {golInfo[p.id].numero}) - {golInfo[p.id].equipo}!
                </div>
              )}

              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] uppercase text-zinc-500 font-bold tracking-wider">
                  {p.categorias?.nombre}
                </span>

                <button
                  onClick={() => toggleLike(p.id, p.likes)}
                  disabled={likesLocales.includes(p.id)}
                  className={`flex flex-col items-center gap-0 ${
                    likesLocales.includes(p.id)
                      ? 'text-[#34D399]'
                      : 'text-cyan-400'
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill={likesLocales.includes(p.id) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    className="w-8 h-8"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>

                  <span className="text-[10px] font-bold">
                    {p.likes || 0}
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="w-[40%] text-right font-bold text-sm truncate">
                  {p.equipo1?.nombre}
                </div>

                <div className="flex items-center gap-2 font-mono text-lg font-black text-[#34D399]">
                  <span>{p.goles_ep1}</span>
                  <span>:</span>
                  <span>{p.goles_ep2}</span>
                </div>

                <div className="w-[40%] text-left font-bold text-sm truncate">
                  {p.equipo2?.nombre}
                </div>
              </div>

              <div
                className={`text-[9px] text-center font-bold uppercase mt-1 ${getTiempoColor(
                  p.periodo_actual
                )}`}
              >
                {p.periodo_actual || 'Pendiente'}
              </div>
            </div>
          ))}
      </div>

      <Navbar />
    </main>
  )
}