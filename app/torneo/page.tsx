'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface GrupoData {
  id: string
  grupo: string | null
  dia: string | null
  hora: string | null
  equipos: { nombre: string } | { nombre: string }[] | null
  categorias: { id: string; nombre: string } | { id: string; nombre: string }[] | null
}

export default function TorneoPage() {
  // Estados para controlar qué filtro está activo
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('Libre')
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string>('A')
  
  // Estado para guardar los partidos/grupos que vienen de Supabase
  const [partidos, setPartidos] = useState<GrupoData[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Cada vez que cambie la categoría o el grupo, vamos a Supabase a traer la info fresca
  useEffect(() => {
    async function cargarPartidos() {
      setLoading(true)
      
      // Consultamos la tabla grupos filtrando por el nombre del grupo (A, B, C)
      const { data, error } = await supabase
        .from('grupos')
        .select(`
          id,
          grupo,
          dia,
          hora,
          equipos ( nombre ),
          categorias ( id, nombre )
        `)
        .eq('grupo', grupoSeleccionado) as { data: GrupoData[] | null; error: any }

      if (error) {
        console.error('Error cargando datos de torneo:', error)
      } else if (data) {
        // Filtramos en el cliente para asegurarnos de que coincida con el nombre de la categoría seleccionada
        const datosFiltrados = data.filter((item) => {
          const cat = Array.isArray(item.categorias) ? item.categorias[0] : item.categorias
          return cat?.nombre?.toLowerCase() === categoriaSeleccionada.toLowerCase()
        })
        setPartidos(datosFiltrados)
      }
      setLoading(false)
    }

    cargarPartidos()
  }, [categoriaSeleccionada, grupoSeleccionado])

  return (
    <div style={{ backgroundColor: '#0A4A29', minHeight: '100vh', padding: '30px', color: 'white', fontFamily: 'sans-serif' }}>
      
      {/* HEADER DE LA IMAGEN */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', opacity: 0.8 }}>Categoría:</h2>
          <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
            {['Master', 'Femenino', 'Libre'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSeleccionada(cat)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '20px',
                  border: '2px solid white',
                  backgroundColor: categoriaSeleccionada === cat ? 'white' : 'transparent',
                  color: categoriaSeleccionada === cat ? '#0A4A29' : 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, letterSpacing: '1px' }}>FOOTBALL</h1>
          <h2 style={{ fontSize: '20px', fontWeight: 'normal', margin: 0, opacity: 0.9 }}>TOURNAMENT</h2>
        </div>
      </div>

      {/* SELECCIÓN DE GRUPOS (A, B, C) */}
      <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>GRUPO:</span>
        {['A', 'B', 'C'].map((grup) => (
          <button
            key={grup}
            onClick={() => setGrupoSeleccionado(grup)}
            style={{
              width: '35px',
              height: '35px',
              borderRadius: '5px',
              border: '2px solid white',
              backgroundColor: grupoSeleccionado === grup ? 'white' : 'transparent',
              color: grupoSeleccionado === grup ? '#0A4A29' : 'white',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {grup}
          </button>
        ))}
      </div>

      {/* RENDERIZADO DEL TORNEO / LLAVES */}
      {loading ? (
        <p style={{ textAlign: 'center', opacity: 0.7 }}>Cargando fixtures de Supabase...</p>
      ) : partidos.length === 0 ? (
        <p style={{ textAlign: 'center', opacity: 0.7 }}>No hay partidos agendados para la Categoría {categoriaSeleccionada} - Grupo {grupoSeleccionado}.</p>
      ) : (
        /* Contenedor del Bracket / Llaves */
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center', marginTop: '20px' }}>
          
          {/* COLUMNA 1: Cuartos de Final / Enfrentamientos Iniciales de la tabla grupos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {partidos.map((partido, index) => {
              const equipo = Array.isArray(partido.equipos) ? partido.equipos[0]?.nombre : partido.equipos?.nombre
              return (
                <div key={partido.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ 
                    backgroundColor: 'white', 
                    color: 'black', 
                    padding: '10px 20px', 
                    borderRadius: '15px', 
                    width: '180px',
                    textAlign: 'center',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    {equipo || `Equipo ${index + 1}`}
                  </div>
                  <div style={{ fontSize: '11px', textAlign: 'center', opacity: 0.7 }}>
                    {partido.dia} {partido.hora}
                  </div>
                </div>
              )
            })}
          </div>

          {/* COLUMNA 2: Marcador de Ganadores (Simulación visual de la imagen) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '2px solid white', padding: '10px 15px', borderRadius: '15px', fontSize: '13px' }}>
              Ganador Partido 1
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '2px solid white', padding: '10px 15px', borderRadius: '15px', fontSize: '13px' }}>
              Ganador Partido 2
            </div>
          </div>

          {/* COLUMNA 3: Finalistas */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: '2px solid white', padding: '12px 20px', borderRadius: '15px', fontWeight: 'bold' }}>
              ¡Campeón! 🏆
            </div>
          </div>

        </div>
      )}
    </div>
  )
}