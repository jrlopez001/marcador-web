'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function TorneoPage() {
  const [categoria, setCategoria] = useState('Libre')
  const [grupo, setGrupo] = useState('A')
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // LOGICA DE SUPABASE (RECUPERADA)
  useEffect(() => {
    async function cargar() {
      setLoading(true)
      const { data, error } = await supabase
        .from('grupos')
        .select('*, equipos(nombre), categorias(nombre)')
      
      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      if (data) {
        const filtrados = data.filter(
          (p) => p.categorias?.nombre === categoria && p.grupo === grupo
        )
        const agrupados: any[] = []
        const padres = filtrados.filter((p) => !p.hora?.includes('#'))

        padres.forEach((padre) => {
          const hijo = filtrados.find((p) => p.hora?.includes(String(padre.id)))
          agrupados.push({
            ...padre,
            equipo1: padre.equipos?.nombre || 'Pendiente',
            equipo2: hijo?.equipos?.nombre || 'Pendiente',
            horaLimpia: padre.hora?.split('#')[0] || '',
          })
        })
        agrupados.sort((a, b) => (a.horaLimpia || '').localeCompare(b.horaLimpia || ''))
        setMatches(agrupados)
      }
      setLoading(false)
    }
    cargar()
  }, [categoria, grupo])

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#020817 0%,#041222 100%)', padding: '20px 14px 100px 14px', color: 'white', fontFamily: 'system-ui' }}>
      
      <h1 style={{ textAlign: 'center', fontSize: '28px', marginBottom: '28px', fontWeight: '900', color: '#ffffff', letterSpacing: '-1px' }}>
        SORTEO DE PARTIDOS
      </h1>

      {/* Selector Categoría */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '22px', flexWrap: 'wrap' }}>
        {['Libre', 'Master', 'Femenino'].map((cat) => (
          <button key={cat} onClick={() => setCategoria(cat)} style={{ padding: '8px 18px', borderRadius: '20px', border: '2px solid #00ff9d', background: categoria === cat ? '#00ff9d' : 'transparent', color: categoria === cat ? '#000' : '#ffffff', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Selector Grupo */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {['A', 'B', 'C', 'D'].map((g) => (
          <button key={g} onClick={() => setGrupo(g)} style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #00ff9d', background: grupo === g ? '#00ff9d' : 'transparent', color: grupo === g ? '#000' : '#ffffff', fontWeight: '900', fontSize: '20px', cursor: 'pointer' }}>
            {g}
          </button>
        ))}
      </div>

      {/* Lista de Partidos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '520px', margin: '0 auto' }}>
        {matches.map((m, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'linear-gradient(180deg,#0b1220 0%,#111827 100%)', padding: '8px', borderRadius: '14px', border: '1px solid rgba(0,255,157,0.12)', textAlign: 'center', width: '88px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{m.dia}</div>
              <div style={{ fontWeight: 'bold', fontSize: '14px', marginTop: '4px', color: '#00ff9d' }}>{m.horaLimpia}</div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg,#0f172a 0%,#111827 100%)', padding: '14px 16px', borderRadius: '16px', fontWeight: 'bold', border: '1px solid rgba(0,255,157,0.12)' }}>
              <span>{m.equipo1}</span>
              <span style={{ color: '#00ff9d', fontSize: '11px' }}>VS</span>
              <span style={{ textAlign: 'right' }}>{m.equipo2}</span>
            </div>
          </div>
        ))}
      </div>

      {/* BARRA DE NAVEGACIÓN (INTEGRADA) */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-[#1A2234]/90 backdrop-blur-xl border border-slate-700/50 rounded-[28px] flex justify-around items-center py-3 px-2 z-50">
        {[
          { label: 'Marcadores', icon: '/icons/marcadores.png', href: '/' },
          { label: 'Sorteo', icon: '/icons/sorteo.png', href: '/sorteo' },
          { label: 'Posiciones', icon: '/icons/posiciones.png', href: '/posiciones' },
          { label: 'Goleador', icon: '/icons/goleador.png', href: '/goleador' },
          { label: 'Portero', icon: '/icons/portero.png', href: '/portero' },
        ].map((item) => {
          const isActive = typeof window !== 'undefined' && window.location.pathname === item.href;
          return (
            <Link 
              key={item.label} 
              href={item.href} 
              className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-[#34D399]' : 'text-zinc-500'}`}
            >
              <Image 
                src={item.icon} 
                alt={item.label} 
                width={30} 
                height={30} 
                className="object-contain"
              />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}