'use client'

import { useEffect, useState, useRef, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '../utils/supabase/client'
import Navbar from './Navbar'

const supabase = createClient()

// =====================================================
// 1. BALÓN GIGANTE (no se modifica, está perfecto)
// =====================================================
const BalonGigante = () => (
  <motion.div
    initial={{ x: '-100vw', rotate: -720, scale: 0.5 }}
    animate={{
      x: 0,
      rotate: 0,
      scale: [0.5, 1.2, 1],
      transition: { duration: 0.8, times: [0, 0.6, 1] }
    }}
    exit={{ scale: 2, opacity: 0 }}
    transition={{ duration: 0.5 }}
    className="text-[180px] absolute z-20"
  >
    ⚽
  </motion.div>
)

// =====================================================
// 2. NUEVA ANIMACIÓN: TORNADO DE ENERGÍA VERDE
//    (Reemplaza al terremoto)
// =====================================================
const TornadoEnergia = () => {
  // Generamos muchas partículas que giran en espiral
  const particulas = Array.from({ length: 80 }).map((_, i) => {
    const anguloInicial = Math.random() * 360
    const radioInicial = 20 + Math.random() * 80
    const velocidadAngular = 300 + Math.random() * 200 // grados/segundo
    const velocidadRadial = 150 + Math.random() * 100 // pixeles/segundo
    const tamaño = 4 + Math.random() * 12
    const retraso = Math.random() * 0.5
    return { id: i, anguloInicial, radioInicial, velocidadAngular, velocidadRadial, tamaño, retraso }
  })

  return (
    <>
      {/* Círculo central pulsante */}
      <motion.div
        initial={{ scale: 0, opacity: 0.9 }}
        animate={{ scale: 8, opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute rounded-full bg-green-500 w-40 h-40 blur-xl"
      />
      {/* Anillos concéntricos que se expanden */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 12, opacity: 0 }}
          transition={{ duration: 1.5, delay: i * 0.1 }}
          className="absolute rounded-full border-4 border-green-400 w-20 h-20"
          style={{ borderWidth: 6 - i }}
        />
      ))}
      {/* Partículas en espiral */}
      {particulas.map((p) => {
        // Calculamos la trayectoria en tiempo real con animate personalizado
        // Para simplificar, usamos keyframes complejos o una versión con animate en x/y
        // Hacemos que giren alrededor del centro expandiéndose
        const anguloFinal = p.anguloInicial + 720 // dos vueltas
        const radioFinal = p.radioInicial + 400
        const xFinal = Math.cos(anguloFinal * Math.PI / 180) * radioFinal
        const yFinal = Math.sin(anguloFinal * Math.PI / 180) * radioFinal
        const xInicial = Math.cos(p.anguloInicial * Math.PI / 180) * p.radioInicial
        const yInicial = Math.sin(p.anguloInicial * Math.PI / 180) * p.radioInicial
        return (
          <motion.div
            key={p.id}
            initial={{ x: xInicial, y: yInicial, scale: 0, opacity: 1 }}
            animate={{ x: xFinal, y: yFinal, scale: 1, opacity: 0 }}
            transition={{ duration: 1.2, delay: p.retraso, ease: "easeOut" }}
            className="absolute rounded-full bg-green-300 shadow-lg"
            style={{ width: p.tamaño, height: p.tamaño, boxShadow: '0 0 10px #4ade80' }}
          />
        )
      })}
      {/* Destello final tipo estrella */}
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 15, opacity: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="absolute rounded-full bg-white w-10 h-10"
      />
    </>
  )
}

// =====================================================
// 3. EXPLOSIÓN DE CHISPAS (más larga y cubre más pantalla)
// =====================================================
const ExplosionChispas = () => {
  // Aumentamos a 120 chispas y mayor distancia
  const chispas = Array.from({ length: 120 }).map((_, i) => ({
    id: i,
    angle: Math.random() * 360,
    distance: 250 + Math.random() * 400, // hasta 650px de distancia
    size: 3 + Math.random() * 12,
    delay: Math.random() * 0.4,
    duration: 1.2 + Math.random() * 0.8 // duración más larga (1.2 a 2 seg)
  }))

  return (
    <>
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 18, opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute rounded-full bg-green-500 w-40 h-40 z-10"
      />
      {chispas.map((chispa) => (
        <motion.div
          key={chispa.id}
          initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
          animate={{
            scale: [0, 1, 0.5, 0],
            x: Math.cos(chispa.angle * Math.PI / 180) * chispa.distance,
            y: Math.sin(chispa.angle * Math.PI / 180) * chispa.distance,
          }}
          transition={{ duration: chispa.duration, delay: chispa.delay }}
          className="absolute rounded-full bg-green-400"
          style={{ width: chispa.size, height: chispa.size }}
        />
      ))}
    </>
  )
}

// =====================================================
// 4. LLUVIA DE BALONES (se deja igual, está perfecta)
// =====================================================
const LluviaBalones = () => {
  const [windowHeight, setWindowHeight] = useState(0)
  const [windowWidth, setWindowWidth] = useState(0)

  useEffect(() => {
    setWindowHeight(window.innerHeight)
    setWindowWidth(window.innerWidth)
  }, [])

  const balones = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    left: Math.random() * windowWidth,
    size: 20 + Math.random() * 40,
    rotate: Math.random() * 360,
    duration: 1 + Math.random() * 1.5,
    delay: Math.random() * 1.5,
  }))

  if (windowHeight === 0) return null

  return (
    <>
      {balones.map((b) => (
        <motion.div
          key={b.id}
          initial={{ y: -100, rotate: b.rotate, opacity: 1 }}
          animate={{ y: windowHeight + 100, rotate: b.rotate + 360 }}
          transition={{ duration: b.duration, delay: b.delay }}
          className="fixed pointer-events-none z-20"
          style={{ left: b.left, fontSize: b.size }}
        >
          ⚽
        </motion.div>
      ))}
    </>
  )
}

// =====================================================
// Tarjeta de partido (sin corazones)
// =====================================================
const PartidoCard = memo(({ partido, golInfo }: any) => {
  const getTiempoColor = (t: string) => {
    const str = t?.toLowerCase() || ''
    if (str.includes('1er')) return 'text-emerald-400'
    if (str.includes('2do')) return 'text-orange-400'
    if (str.includes('finalizado')) return 'text-red-500'
    return 'text-zinc-500'
  }

  return (
    <div className={`p-3 rounded-xl border transition-all duration-500 ${golInfo ? 'bg-green-900/20 border-green-500/50' : 'bg-[#111827] border-slate-800'}`}>
      {golInfo && (
        <div className="mb-2 text-[10px] text-green-400 font-bold text-center border-b border-green-500/20 pb-1">
          ⚽ ¡GOL DE: {golInfo.nombre} (#{golInfo.numero}) - {golInfo.equipo}!
        </div>
      )}
      <div className="flex justify-between items-center mb-1">
        <span className="text-[9px] uppercase text-zinc-500 font-bold tracking-wider">{partido.categorias?.nombre}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="w-[40%] text-right font-bold text-sm truncate">{partido.equipo1?.nombre}</div>
        <div className="flex items-center gap-2 font-mono text-lg font-black text-[#34D399]">
          <span>{partido.goles_ep1}</span><span>:</span><span>{partido.goles_ep2}</span>
        </div>
        <div className="w-[40%] text-left font-bold text-sm truncate">{partido.equipo2?.nombre}</div>
      </div>
      <div className={`text-[9px] text-center font-bold uppercase mt-1 ${getTiempoColor(partido.periodo_actual)}`}>
        {partido.periodo_actual || 'Pendiente'}
      </div>
    </div>
  )
})
PartidoCard.displayName = 'PartidoCard'

// =====================================================
// Componente principal
// =====================================================
export default function Home() {
  const [partidos, setPartidos] = useState<any[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  const [eventoActivo, setEventoActivo] = useState('VIERNES')
  const [mostrarGol, setMostrarGol] = useState(false)
  const [golInfo, setGolInfo] = useState<any>({})
  const [tipoAnimacion, setTipoAnimacion] = useState<string>('')

  const golTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const golInfoTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({})
  const marcadorAnterior = useRef<any>({})

  const animaciones = ['balon', 'tornado', 'explosion', 'lluvia']

  const getRandomAnimacion = () => animaciones[Math.floor(Math.random() * animaciones.length)]

  const fetchPartidos = useCallback(async () => {
    const { data } = await supabase
      .from('partidos')
      .select(`
        id, goles_ep1, goles_ep2, estado, periodo_actual, evento,
        categorias (nombre), 
        equipo1:equipo1_id (nombre), 
        equipo2:equipo2_id (nombre)
      `)
      .eq('evento', eventoActivo)
      .order('categorias(nombre)', { ascending: true })

    if (data) {
      data.forEach((p) => {
        marcadorAnterior.current[p.id] = {
          goles_ep1: p.goles_ep1,
          goles_ep2: p.goles_ep2,
        }
      })
      setPartidos(data)
    }
  }, [eventoActivo])

  const obtenerUltimoGol = useCallback(async (partidoId: string) => {
    try {
      const { data } = await supabase
        .from('goles')
        .select(`
          jugadores (nombre, numero_camisola),
          equipos (nombre)
        `)
        .eq('partido_id', partidoId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        const jugador = data.jugadores?.[0] || data.jugadores
        const equipo = data.equipos?.[0] || data.equipos
        return {
          nombre: jugador?.nombre || 'Jugador',
          numero: jugador?.numero_camisola || '0',
          equipo: equipo?.nombre || 'Equipo',
        }
      }
    } catch (error) {
      console.error('Error al obtener gol:', error)
    }
    return null
  }, [])

  useEffect(() => {
    fetchPartidos()

    const channel = supabase
      .channel('realtime')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'partidos' },
        async (payload) => {
          const partidoActualizado = payload.new
          const partidoId = partidoActualizado.id
          const anterior = marcadorAnterior.current[partidoId]

          const huboGol = anterior && (
            partidoActualizado.goles_ep1 > anterior.goles_ep1 ||
            partidoActualizado.goles_ep2 > anterior.goles_ep2
          )

          if (huboGol) {
            const randomAnim = getRandomAnimacion()
            setTipoAnimacion(randomAnim)
            setMostrarGol(true)

            // Info del gol
            if (partidoActualizado.ultimo_gol_jugador && partidoActualizado.ultimo_gol_equipo) {
              const infoGol = {
                nombre: partidoActualizado.ultimo_gol_jugador,
                numero: partidoActualizado.ultimo_gol_numero || '?',
                equipo: partidoActualizado.ultimo_gol_equipo,
              }
              setGolInfo((prev: any) => ({ ...prev, [partidoId]: infoGol }))
              if (golInfoTimeoutRef.current[partidoId]) clearTimeout(golInfoTimeoutRef.current[partidoId])
              golInfoTimeoutRef.current[partidoId] = setTimeout(() => {
                setGolInfo((prev: any) => ({ ...prev, [partidoId]: null }))
              }, 15000)
            } else {
              const infoGol = await obtenerUltimoGol(partidoId)
              if (infoGol) {
                setGolInfo((prev: any) => ({ ...prev, [partidoId]: infoGol }))
                if (golInfoTimeoutRef.current[partidoId]) clearTimeout(golInfoTimeoutRef.current[partidoId])
                golInfoTimeoutRef.current[partidoId] = setTimeout(() => {
                  setGolInfo((prev: any) => ({ ...prev, [partidoId]: null }))
                }, 15000)
              }
            }

            if (golTimeoutRef.current) clearTimeout(golTimeoutRef.current)
            golTimeoutRef.current = setTimeout(() => {
              setMostrarGol(false)
              setTipoAnimacion('')
            }, 5000)
          }

          setPartidos((prev) =>
            prev.map((p) =>
              p.id === partidoId ? { ...p, ...partidoActualizado } : p
            )
          )

          marcadorAnterior.current[partidoId] = {
            goles_ep1: partidoActualizado.goles_ep1,
            goles_ep2: partidoActualizado.goles_ep2,
          }
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'partidos' },
        () => fetchPartidos()
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'partidos' },
        () => fetchPartidos()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      if (golTimeoutRef.current) clearTimeout(golTimeoutRef.current)
      Object.values(golInfoTimeoutRef.current).forEach(clearTimeout)
    }
  }, [fetchPartidos, obtenerUltimoGol])

  return (
    <main className="min-h-screen bg-[#0B1120] text-white p-4 font-sans pb-28 relative overflow-hidden">
      <AnimatePresence>
        {mostrarGol && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 overflow-hidden">
            {/* Fondo pulsante común */}
            <div className="absolute inset-0 bg-green-500 animate-pulse opacity-20" />

            {/* Animaciones según tipo */}
            {tipoAnimacion === 'balon' && <BalonGigante />}
            {tipoAnimacion === 'tornado' && <TornadoEnergia />}
            {tipoAnimacion === 'explosion' && <ExplosionChispas />}
            {tipoAnimacion === 'lluvia' && <LluviaBalones />}

            {/* Texto central Gool, siempre visible */}
            <h1 className="text-[100px] font-black text-green-400 capitalize animate-pulse relative z-30">
              Gool
            </h1>
          </div>
        )}
      </AnimatePresence>

      {/* Resto de la interfaz */}
      <div className="flex justify-between items-center mb-6 mt-2">
        <h1 className="text-[#34D399] font-black tracking-[0.2em] text-[15px] opacity-80 uppercase">MARCADOR WEB</h1>
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

      <div className="space-y-3">
        {partidos.filter((p) => categoriaActiva === 'Todos' || p.categorias?.nombre === categoriaActiva).map((p) => (
          <PartidoCard key={p.id} partido={p} golInfo={golInfo[p.id]} />
        ))}
      </div>
      <Navbar />
    </main>
  )
}