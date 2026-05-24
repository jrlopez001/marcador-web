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
          'linear-gradient(135deg, #063d21 0%, #0a4a29 100%)',
        padding: '20px',
        color: 'white',
        fontFamily: 'system-ui',
      }}
    >
      <h1
        style={{
          textAlign: 'center',
          fontSize: '24px',
          marginBottom: '20px',
          fontWeight: '800',
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
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        {['Libre', 'Master', 'Femenino'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoria(cat)}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              border: '2px solid white',
              background:
                categoria === cat ? 'white' : 'transparent',
              color:
                categoria === cat ? '#0a4a29' : 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s',
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
          gap: '10px',
          marginBottom: '30px',
          flexWrap: 'wrap',
        }}
      >
        {['A', 'B', 'C', 'D'].map((g) => (
          <button
            key={g}
            onClick={() => setGrupo(g)}
            style={{
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              border: '2px solid white',
              background:
                grupo === g ? '#FFD700' : 'transparent',
              color: grupo === g ? '#000' : 'white',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              transform:
                grupo === g ? 'scale(1.1)' : 'scale(1)',
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
            opacity: 0.8,
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
            opacity: 0.8,
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
          gap: '15px',
          maxWidth: '500px',
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
                background: 'rgba(255,255,255,0.1)',
                padding: '8px',
                borderRadius: '8px',
                border:
                  '1px solid rgba(255,255,255,0.2)',
                textAlign: 'center',
                width: '80px',
              }}
            >
              <div
                style={{
                  fontSize: '9px',
                  opacity: 0.7,
                }}
              >
                {m.dia}
              </div>

              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: '12px',
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
                background: 'rgba(255,255,255,0.9)',
                color: '#000',
                padding: '12px 15px',
                borderRadius: '12px',
                fontWeight: 'bold',
              }}
            >
              <span style={{ fontSize: '14px' }}>
                {m.equipo1}
              </span>

              <span
                style={{
                  color: '#0a4a29',
                  fontSize: '10px',
                  fontStyle: 'italic',
                  margin: '0 5px',
                }}
              >
                vrs
              </span>

              <span style={{ fontSize: '14px' }}>
                {m.equipo2}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}