'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function TorneoPage() {
  const [categoria, setCategoria] = useState('Libre')
  const [grupo, setGrupo] = useState('A')
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
          (p) =>
            p.categorias?.nombre === categoria &&
            p.grupo === grupo
        )

        const agrupados: any[] = []

        const padres = filtrados.filter(
          (p) => !p.hora?.includes('#')
        )

        padres.forEach((padre) => {
          const hijo = filtrados.find((p) =>
            p.hora?.includes(String(padre.id))
          )

          agrupados.push({
            ...padre,
            equipo1: padre.equipos?.nombre || 'Pendiente',
            equipo2: hijo?.equipos?.nombre || 'Pendiente',
            horaLimpia: padre.hora?.split('#')[0] || '',
          })
        })

        setMatches(agrupados)
      }

      setLoading(false)
    }

    cargar()
  }, [categoria, grupo])

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg,#020817 0%,#041222 100%)',
        padding: '20px 14px',
        color: 'white',
        fontFamily: 'system-ui',
      }}
    >
      {/* TITULO */}

      <h1
        style={{
          textAlign: 'center',
          fontSize: '28px',
          marginBottom: '28px',
          fontWeight: '900',
          color: '#ffffff',
          letterSpacing: '-1px',
        }}
      >
        SORTEO DE PARTIDOS
      </h1>

      {/* CATEGORIAS */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '22px',
          flexWrap: 'wrap',
        }}
      >
        {['Libre', 'Master', 'Femenino'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoria(cat)}
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              border: '2px solid #00ff9d',
              background:
                categoria === cat
                  ? '#00ff9d'
                  : 'transparent',
              color:
                categoria === cat
                  ? '#000'
                  : '#ffffff',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: '0.3s',
              fontSize: '15px',
              boxShadow:
                categoria === cat
                  ? '0 0 20px rgba(0,255,157,0.25)'
                  : 'none',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GRUPOS */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '30px',
          flexWrap: 'wrap',
        }}
      >
        {['A', 'B', 'C', 'D'].map((g) => (
          <button
            key={g}
            onClick={() => setGrupo(g)}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '2px solid #00ff9d',
              background:
                grupo === g
                  ? '#00ff9d'
                  : 'transparent',
              color:
                grupo === g
                  ? '#000'
                  : '#ffffff',
              fontWeight: '900',
              fontSize: '20px',
              cursor: 'pointer',
              transition: '0.3s',
              boxShadow:
                grupo === g
                  ? '0 0 20px rgba(0,255,157,0.45)'
                  : 'none',
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* LOADING */}

      {loading && (
        <p
          style={{
            textAlign: 'center',
            color: '#94a3b8',
          }}
        >
          Cargando partidos...
        </p>
      )}

      {/* SIN PARTIDOS */}

      {!loading && matches.length === 0 && (
        <p
          style={{
            textAlign: 'center',
            color: '#94a3b8',
          }}
        >
          No hay partidos disponibles
        </p>
      )}

      {/* PARTIDOS */}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          maxWidth: '520px',
          margin: '0 auto',
        }}
      >
        {matches.map((m, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            {/* FECHA */}

            <div
              style={{
                background:
                  'linear-gradient(180deg,#0b1220 0%,#111827 100%)',
                padding: '8px',
                borderRadius: '14px',
                border:
                  '1px solid rgba(0,255,157,0.12)',
                textAlign: 'center',
                width: '88px',
                minWidth: '88px',
                boxShadow:
                  '0 10px 30px rgba(0,0,0,0.45)',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                }}
              >
                {m.dia}
              </div>

              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: '14px',
                  marginTop: '4px',
                  color: '#00ff9d',
                }}
              >
                {m.horaLimpia}
              </div>
            </div>

            {/* PARTIDO */}

            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background:
                  'linear-gradient(180deg,#0f172a 0%,#111827 100%)',
                color: '#ffffff',
                padding: '14px 16px',
                borderRadius: '16px',
                fontWeight: 'bold',
                gap: '8px',
                border:
                  '1px solid rgba(0,255,157,0.12)',
                boxShadow:
                  '0 10px 30px rgba(0,0,0,0.45)',
              }}
            >
              <span
                style={{
                  fontSize: '15px',
                  flex: 1,
                  wordBreak: 'break-word',
                }}
              >
                {m.equipo1}
              </span>

              <span
                style={{
                  color: '#00ff9d',
                  fontSize: '11px',
                  fontWeight: '900',
                }}
              >
                VS
              </span>

              <span
                style={{
                  fontSize: '15px',
                  flex: 1,
                  textAlign: 'right',
                  wordBreak: 'break-word',
                }}
              >
                {m.equipo2}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}