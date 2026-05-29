'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '../utils/supabase/client'

export default function Home() {
  const [partidos, setPartidos] = useState<any[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  const [eventoActivo, setEventoActivo] = useState('VIERNES')
  const [mostrarGol, setMostrarGol] = useState(false)
  const [golEquipo, setGolEquipo] = useState<any>({})
  const [likesLocales, setLikesLocales] = useState<string[]>([])

  const marcadorAnterior = useRef<any>({})
  const supabase = createClient()

  useEffect(() => {
    const guardados = JSON.parse(localStorage.getItem('likes_partidos') || '[]')
    setLikesLocales(guardados)
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
      
      setPartidos((prev) => prev.map((p) => 
        p.id === partidoId ? { ...p, likes: nuevoTotal } : p
      ))
    }
  }

  async function fetchPartidos() {
    const { data } = await supabase
      .from('partidos')
      .select(`
        id, likes, goles_ep1, goles_ep2, estado, periodo_actual, evento,
        categorias (nombre), equipo1:equipo1_id (nombre), equipo2:equipo2_id (nombre)
      `)
      .eq('evento', eventoActivo)
      .order('categorias(nombre)', { ascending: true })

    if (data) {
      data.forEach((p) => {
        const anterior = marcadorAnterior.current[p.id]
        if (anterior && (p.goles_ep1 > anterior.goles_ep1 || p.goles_ep2 > anterior.goles_ep2)) {
          setMostrarGol(true)
          setGolEquipo((prev: any) => ({ ...prev, [p.id]: p.goles_ep1 > anterior.goles_ep1 ? 'equipo1' : 'equipo2' }))
          setTimeout(() => setMostrarGol(false), 1300)
          setTimeout(() => setGolEquipo((prev: any) => ({ ...prev, [p.id]: null })), 15000)
        }
        marcadorAnterior.current[p.id] = { goles_ep1: p.goles_ep1, goles_ep2: p.goles_ep2 }
      })
      setPartidos(data || [])
    }
  }

  useEffect(() => {
    fetchPartidos()
    const channel = supabase.channel('realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'partidos' }, () => fetchPartidos()).subscribe()
    return () => { supabase.removeChannel(channel) }
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
          <h1 className="text-[100px] font-black text-green-400 uppercase animate-pulse">GOOOOL</h1>
        </div>
      )}

      <div className="flex justify-between items-center mb-6 mt-2">
        <h1 className="text-[#34D399] font-black tracking-[0.2em] text-[15px] opacity-80 uppercase">MARCADOR WEB</h1>
        <Link href="/sorteo" className="bg-[#1E293B] hover:bg-[#34D399] hover:text-[#0B1120] transition-all px-4 py-1 rounded-full text-[10px] font-bold uppercase">🏆 Sorteo</Link>
      </div>

      <div className="flex gap-4 mb-6">
        {['VIERNES', 'SABADO'].map((e) => (
          <button key={e} onClick={() => setEventoActivo(e)} className={`px-8 py-3 rounded-full text-sm font-bold ${eventoActivo === e ? 'bg-[#34D399] text-[#0B1120]' : 'bg-[#1E293B] text-zinc-500'}`}>{e}</button>
        ))}
      </div>

      <div className="text-zinc-500 font-bold mb-6 flex gap-6 overflow-x-auto pb-2">
        {['Todos', 'Libre', 'Master', 'Femenino'].map((cat) => (
          <button key={cat} onClick={() => setCategoriaActiva(cat)} className={categoriaActiva === cat ? 'text-[#34D399] border-b-2 border-[#34D399]' : 'hover:text-[#34D399]/70'}>{cat}</button>
        ))}
      </div>

      <div className="space-y-4">
        {partidos.filter((p) => categoriaActiva === 'Todos' || p.categorias?.nombre === categoriaActiva).map((p) => (
          <div key={p.id} className={`p-4 rounded-xl border transition-all duration-500 ${golEquipo[p.id] ? 'bg-green-900/40 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'bg-[#111827] border-slate-800'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">Categoría: {p.categorias?.nombre}</span>
              <button 
                onClick={() => toggleLike(p.id, p.likes)} 
                disabled={likesLocales.includes(p.id)}
                className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${likesLocales.includes(p.id) ? 'text-[#34D399]' : 'text-cyan-400'}`}
              >
                <span>{p.likes || 0}</span>
                <svg viewBox="0 0 24 24" fill={likesLocales.includes(p.id) ? "currentColor" : "none"} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </button>
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <div className="w-[40%] text-right font-bold text-sm truncate flex flex-col items-end">
                <div className="h-[36px] flex items-center justify-end w-full"><span>{p.equipo1?.nombre}</span></div>
                <div className="h-[24px] flex items-center justify-center w-full">{golEquipo[p.id] === 'equipo1' && '⚽'}</div>
              </div>
              
              <div className="flex items-center gap-2 font-mono text-xl font-black text-[#34D399]">
                <span>{p.goles_ep1}</span><span>-</span><span>{p.goles_ep2}</span>
              </div>
              
              <div className="w-[40%] text-left font-bold text-sm truncate flex flex-col items-start">
                <div className="h-[36px] flex items-center justify-start w-full"><span>{p.equipo2?.nombre}</span></div>
                <div className="h-[24px] flex items-center justify-center w-full">{golEquipo[p.id] === 'equipo2' && '⚽'}</div>
              </div>
            </div>
            
            <div className={`text-[10px] text-center font-bold uppercase mt-2 ${getTiempoColor(p.periodo_actual)}`}>{p.periodo_actual || 'Pendiente'}</div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-[#1A2234]/90 backdrop-blur-xl border border-slate-700/50 rounded-[28px] flex justify-around items-center py-3 px-2 z-50">
        {[
          { label: 'Marcadores', icon: '/icons/marcadores.png', href: '/', active: true },
          { label: 'Sorteo', icon: '/icons/sorteo.png', href: '/sorteo' },
          { label: 'Posiciones', icon: '/icons/posiciones.png', href: '/posiciones' },
          { label: 'Goleador', icon: '/icons/goleador.png', href: '/goleador' },
          { label: 'Portero', icon: '/icons/portero.png', href: '/portero' },
        ].map((item) => (
          <Link key={item.label} href={item.href} className={`flex flex-col items-center gap-1 ${item.active ? 'text-[#34D399]' : 'text-zinc-500'}`}>
            <Image src={item.icon} alt={item.label} width={30} height={30} />
            <span className="text-[10px] font-semibold">{item.label}</span>
          </Link>
        ))}
      </div>
    </main>
  )
}