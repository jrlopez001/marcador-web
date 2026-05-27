'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '../utils/supabase/client'

export default function Home() {
  const [partidos, setPartidos] = useState<any[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  const [eventoActivo, setEventoActivo] = useState('VIERNES')

  // Efecto pantalla gol
  const [mostrarGol, setMostrarGol] = useState(false)

  // Equipo que hizo gol
  const [golEquipo, setGolEquipo] = useState<any>({})

  const marcadorAnterior = useRef<any>({})

  const supabase = createClient()

  async function fetchPartidos() {
    const { data } = await supabase
      .from('partidos')
      .select(`
        id,
        goles_ep1,
        goles_ep2,
        estado,
        periodo_actual,
        evento,
        categorias (nombre),
        equipo1:equipo1_id (nombre),
        equipo2:equipo2_id (nombre)
      `)
      .eq('evento', eventoActivo)

    if (data) {
      data.forEach((p) => {
        const anterior = marcadorAnterior.current[p.id]

        if (anterior) {

          // GOL EQUIPO 1
          if (p.goles_ep1 > anterior.goles_ep1) {

            // Mostrar pantalla verde
            setMostrarGol(true)

            // Mostrar pelota en equipo 1
            setGolEquipo((prev: any) => ({
              ...prev,
              [p.id]: 'equipo1'
            }))

            // Pantalla verde
            setTimeout(() => {
              setMostrarGol(false)
            }, 1300)

            // Pelota 10 segundos
            setTimeout(() => {
              setGolEquipo((prev: any) => ({
                ...prev,
                [p.id]: null
              }))
            }, 4500)
          }

          // GOL EQUIPO 2
          if (p.goles_ep2 > anterior.goles_ep2) {

            // Mostrar pantalla verde
            setMostrarGol(true)

            // Mostrar pelota en equipo 2
            setGolEquipo((prev: any) => ({
              ...prev,
              [p.id]: 'equipo2'
            }))

            // Pantalla verde
            setTimeout(() => {
              setMostrarGol(false)
            }, 1300)

            // Pelota 10 segundos
            setTimeout(() => {
              setGolEquipo((prev: any) => ({
                ...prev,
                [p.id]: null
              }))
            }, 4500)
          }
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

  const getTiempoColor = (tiempo: string) => {
    const t = tiempo?.toLowerCase() || ''

    if (t.includes('1er')) return 'text-emerald-400'
    if (t.includes('2do')) return 'text-orange-400'
    if (t.includes('finalizado')) return 'text-red-500'
    if (t.includes('pendiente')) return 'text-zinc-500'

    return 'text-white'
  }

  return (
    <main className="min-h-screen bg-[#0B1120] text-white p-4 font-sans">

      {/* EFECTO GOL */}
      {mostrarGol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <div className="absolute inset-0 bg-green-500 animate-pulse opacity-20"></div>

          <div className="relative animate-bounce">
            <h1 className="text-[100px] sm:text-[250px] font-black text-green-400 uppercase tracking-tight animate-pulse drop-shadow-[0_0_80px_rgba(34,197,94,1)]">
              GOOOOL
            </h1>
          </div>
        </div>
      )}

      {/* CABECERA */}
      <div className="flex justify-between items-center mb-6 mt-2">
        <h1 className="text-[#34D399] font-black tracking-[0.2em] text-[15px] opacity-80 uppercase">
          MARCADOR WEB
        </h1>

        <Link
          href="/torneo"
          className="bg-[#1E293B] hover:bg-[#34D399] hover:text-[#0B1120] transition-all px-4 py-1 rounded-full text-[10px] font-bold uppercase"
        >
          🏆 Torneo
        </Link>
      </div>

      {/* BOTONES EVENTOS */}
      <div className="flex gap-4 mb-6">
        {['VIERNES', 'SABADO'].map((e) => (
          <button
            key={e}
            onClick={() => setEventoActivo(e)}
            className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${
              eventoActivo === e
                ? 'bg-[#34D399] text-[#0B1120]'
                : 'bg-[#1E293B] text-zinc-500'
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      {/* CATEGORÍAS */}
      <div className="text-zinc-500 font-bold mb-6">
        <div className="flex gap-6 overflow-x-auto pb-2">
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
      </div>

      {/* PARTIDOS */}
      <div className="space-y-3">
        {partidos
          .filter(
            (p) =>
              categoriaActiva === 'Todos' ||
              p.categorias?.nombre === categoriaActiva
          )
          .sort((a, b) => {
            if (categoriaActiva === 'Todos') {
              return (a.categorias?.nombre || '').localeCompare(
                b.categorias?.nombre || ''
              )
            }

            return 0
          })
          .map((p) => (
            <div
              key={p.id}
              className={`
                p-4 rounded-xl border flex flex-col gap-2 transition-all duration-500
                ${
                  golEquipo[p.id]
                    ? 'bg-green-500/20 border-green-400 shadow-[0_0_25px_rgba(34,197,94,0.7)]'
                    : 'bg-[#111827] border-slate-800'
                }
              `}
            >

              {/* CATEGORÍA */}
              <div className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider text-center">
                Categoría: {p.categorias?.nombre || 'N/A'}
              </div>

              {/* MARCADOR */}
              <div className="flex items-center justify-between">

                {/* EQUIPO 1 */}
                <div className="w-[35%] flex flex-col items-start">
                  <span className="truncate font-bold text-sm">
                    {p.equipo1?.nombre}
                  </span>

                  {golEquipo[p.id] === 'equipo1' && (
                    <span className="text-2xl animate-bounce mt-1">
                      ⚽
                    </span>
                  )}
                </div>

                {/* GOLES */}
                <div className="flex items-center gap-3 font-mono text-2xl font-black text-[#34D399]">
                  <span>{p.goles_ep1}</span>
                  <span className="text-slate-600">-</span>
                  <span>{p.goles_ep2}</span>
                </div>

                {/* EQUIPO 2 */}
                <div className="w-[35%] flex flex-col items-end">
                  <span className="truncate font-bold text-sm text-right">
                    {p.equipo2?.nombre}
                  </span>

                  {golEquipo[p.id] === 'equipo2' && (
                    <span className="text-2xl animate-bounce mt-1">
                      ⚽
                    </span>
                  )}
                </div>
              </div>

              {/* TIEMPO */}
              <div
                className={`text-[10px] font-bold uppercase text-center mt-1 ${getTiempoColor(
                  p.periodo_actual
                )}`}
              >
                {p.periodo_actual || 'Pendiente'}
              </div>
            </div>
          ))}
      </div>
    </main>
  )
}