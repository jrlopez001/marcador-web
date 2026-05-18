'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../utils/supabase/client'

export default function Home() {
  const [partidos, setPartidos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const supabase = createClient()

  // Esta función ahora trae los nombres de las tablas relacionadas
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
      console.error('Error cargando datos:', error.message)
    } else {
      setPartidos(data || [])
    }
    setCargando(false)
  }

  useEffect(() => {
    getPartidos()

    const canal = supabase
      .channel('realtime-partidos')
      .on('postgres_changes' as any, { event: '*', table: 'partidos', schema: 'public' }, () => {
        getPartidos()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <header className="max-w-4xl mx-auto mb-10 text-center">
        <h1 className="text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 uppercase">
          Marcador Web
        </h1>
        <p className="text-slate-500 text-sm font-bold tracking-widest mt-2 uppercase">Resultados en Vivo</p>
      </header>

      <div className="max-w-4xl mx-auto grid gap-8">
        {cargando ? (
          <div className="text-center p-10 bg-slate-900 rounded-3xl animate-pulse">Cargando estadio...</div>
        ) : partidos.length === 0 ? (
          <div className="text-center p-10 bg-slate-900 rounded-3xl border border-slate-800 text-yellow-500">
            No hay partidos activos.
          </div>
        ) : (
          partidos.map((partido) => (
            <div key={partido.id} className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl transition-all hover:border-green-500/50">
              {/* Encabezado: Categoría y Estado */}
              <div className="bg-slate-800/50 px-6 py-3 flex justify-between items-center border-b border-slate-800">
                <span className="text-green-400 text-xs font-black tracking-widest uppercase">
                  ● {partido.estado?.replace('_', ' ') || 'EN CURSO'}
                </span>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
                  Categoría: {partido.categorias?.nombre || 'General'}
                </span>
              </div>

              {/* Marcador Principal con Nombres Reales */}
              <div className="p-8 flex justify-between items-center text-center gap-4">
                <div className="flex-1">
                  <p className="text-xl md:text-2xl font-black uppercase text-slate-100">
                    {partido.equipo1?.nombre || 'Local'}
                  </p>
                </div>

                <div className="flex items-center gap-6 bg-black px-8 py-5 rounded-2xl border-2 border-slate-700 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                  <span className="text-6xl md:text-7xl font-black text-green-400 tabular-nums">
                    {partido.goles_ep1}
                  </span>
                  <span className="text-2xl text-slate-700 font-black">-</span>
                  <span className="text-6xl md:text-7xl font-black text-green-400 tabular-nums">
                    {partido.goles_ep2}
                  </span>
                </div>

                <div className="flex-1">
                  <p className="text-xl md:text-2xl font-black uppercase text-slate-100">
                    {partido.equipo2?.nombre || 'Visitante'}
                  </p>
                </div>
              </div>

              {/* Tiempo de juego */}
              <div className="bg-slate-800/30 p-3 text-center border-t border-slate-800">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
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