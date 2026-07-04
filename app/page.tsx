'use client'

import { useEffect, useState, useRef, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '../utils/supabase/client'
import Navbar from './Navbar'

const supabase = createClient()

// =====================================================
// 1. BALÓN GIGANTE
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
// 2. TORNADO DE ENERGÍA VERDE
// =====================================================
const TornadoEnergia = () => {
  const particulas = Array.from({ length: 80 }).map((_, i) => {
    const anguloInicial = Math.random() * 360
    const radioInicial = 20 + Math.random() * 80
    const velocidadAngular = 300 + Math.random() * 200
    const velocidadRadial = 150 + Math.random() * 100
    const tamaño = 4 + Math.random() * 12
    const retraso = Math.random() * 0.5
    return { id: i, anguloInicial, radioInicial, velocidadAngular, velocidadRadial, tamaño, retraso }
  })

  return (
    <>
      <motion.div
        initial={{ scale: 0, opacity: 0.9 }}
        animate={{ scale: 8, opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute rounded-full bg-green-500 w-40 h-40 blur-xl"
      />
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
      {particulas.map((p) => {
        const anguloFinal = p.anguloInicial + 720
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
// 3. EXPLOSIÓN DE CHISPAS
// =====================================================
const ExplosionChispas = () => {
  const chispas = Array.from({ length: 120 }).map((_, i) => ({
    id: i,
    angle: Math.random() * 360,
    distance: 250 + Math.random() * 400,
    size: 3 + Math.random() * 12,
    delay: Math.random() * 0.4,
    duration: 1.2 + Math.random() * 0.8
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
// 4. LLUVIA DE BALONES
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
// Tarjeta de partido (con fondo blanco y resaltado en gol)
// =====================================================
const PartidoCard = memo(({ partido, golInfo }: any) => {
  const getTiempoColor = (t: string) => {
    const str = t?.toLowerCase() || ''
    if (str.includes('1er')) return 'text-emerald-700'
    if (str.includes('2do')) return 'text-orange-600'
    if (str.includes('finalizado')) return 'text-red-600'
    return 'text-gray-500'
  }

  // Indicador de partido en curso (no finalizado)
  const esEnVivo = partido.estado !== 'finalizado' && partido.periodo_actual && !partido.periodo_actual.toLowerCase().includes('finalizado')

  // Fondo de la tarjeta: blanco normalmente, verde claro cuando hay gol
  const cardBg = golInfo ? 'bg-green-100 border-green-300' : 'bg-white border-gray-200'

  return (
    <div className={`p-3 rounded-xl border shadow-sm transition-all duration-500 ${cardBg}`}>
      {/* Línea superior: solo categoría a la izquierda y EN VIVO a la derecha */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">
          {partido.categorias?.nombre}
        </span>
        {esEnVivo && (
          <div className="flex items-center gap-1 text-xs font-bold text-red-600 animate-pulse">
            <span className="inline-block w-2 h-2 bg-red-600 rounded-full"></span>
            EN VIVO
          </div>
        )}
      </div>

      {golInfo && (
        <div className="mb-2 text-center border-b border-green-200 pb-1">
          {/* 
            ============================================================
            🔽 TAMAÑO DEL TEXTO DEL GOL - MODIFICA 'text-base' y 'text-sm'
            ============================================================
            - 'text-base' controla el nombre del goleador.
            - 'text-sm' controla el número y equipo.
            Cambia estas clases por otras como 'text-lg', 'text-xl', etc.
            ============================================================
          */}
          <span className="text-base font-bold text-green-700">
            ⚽ ¡GOL DE: {golInfo.nombre}!
          </span>
          <span className="text-sm font-medium text-green-600 ml-1">
            (#{golInfo.numero}) - {golInfo.equipo}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="w-[40%] text-right font-bold text-sm truncate text-gray-800">
          {partido.equipo1?.nombre}
        </div>
        <div className="flex items-center gap-2 font-mono text-lg font-black text-emerald-600">
          <span>{partido.goles_ep1}</span><span>:</span><span>{partido.goles_ep2}</span>
        </div>
        <div className="w-[40%] text-left font-bold text-sm truncate text-gray-800">
          {partido.equipo2?.nombre}
        </div>
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
  const [golPartidoIdActual, setGolPartidoIdActual] = useState<string | null>(null)

  // Audio: inicia en mute (true)
  const [isMuted, setIsMuted] = useState(true)

  const golTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const golInfoTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({})
  const marcadorAnterior = useRef<any>({})
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioBufferRef = useRef<AudioBuffer | null>(null)

  const animaciones = ['balon', 'tornado', 'explosion', 'lluvia']
  const getRandomAnimacion = () => animaciones[Math.floor(Math.random() * animaciones.length)]

  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    audioContextRef.current = ctx
    fetch('/gol.mp3')
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
      .then(decodedBuffer => {
        audioBufferRef.current = decodedBuffer
      })
      .catch(err => console.error("Error al cargar el búfer de audio:", err))

    const activarContextoAudio = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().then(() => {
          window.removeEventListener('click', activarContextoAudio)
          window.removeEventListener('touchstart', activarContextoAudio)
        })
      } else {
        window.removeEventListener('click', activarContextoAudio)
        window.removeEventListener('touchstart', activarContextoAudio)
      }
    }
    window.addEventListener('click', activarContextoAudio)
    window.addEventListener('touchstart', activarContextoAudio)
    return () => {
      window.removeEventListener('click', activarContextoAudio)
      window.removeEventListener('touchstart', activarContextoAudio)
    }
  }, [])

  const reproducirGolAudio = useCallback(() => {
    if (!audioContextRef.current || !audioBufferRef.current) return
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }
    const source = audioContextRef.current.createBufferSource()
    source.buffer = audioBufferRef.current
    const gainNode = audioContextRef.current.createGain()
    gainNode.gain.setValueAtTime(isMuted ? 0 : 1, audioContextRef.current.currentTime)
    source.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)
    source.start(0)
  }, [isMuted])

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
            setGolPartidoIdActual(partidoId)
            reproducirGolAudio()

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
              setGolPartidoIdActual(null)
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
  }, [fetchPartidos, obtenerUltimoGol, reproducirGolAudio])

  const infoGolActual = golPartidoIdActual ? golInfo[golPartidoIdActual] : null

  return (
    <main className="min-h-screen bg-[#F5F0EB] text-gray-800 p-4 font-sans pb-28 relative overflow-hidden">
      <AnimatePresence>
        {mostrarGol && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 overflow-hidden">
            <div className="absolute inset-0 bg-green-500 animate-pulse opacity-20" />
            {tipoAnimacion === 'balon' && <BalonGigante />}
            {tipoAnimacion === 'tornado' && <TornadoEnergia />}
            {tipoAnimacion === 'explosion' && <ExplosionChispas />}
            {tipoAnimacion === 'lluvia' && <LluviaBalones />}
            <div className="relative z-30 flex flex-col items-center justify-center">
              <h1 className="text-[100px] font-black text-green-400 capitalize animate-pulse">
                Gool
              </h1>
              {infoGolActual && (
                <div className="text-center text-white mt-4">
                  <p className="text-3xl md:text-5xl font-bold text-green-300">
                    ¡{infoGolActual.nombre}!
                  </p>
                  <p className="text-lg md:text-2xl text-green-200/80">
                    #{infoGolActual.numero} - {infoGolActual.equipo}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Cabecera */}
      <div className="flex justify-between items-center mb-6 mt-2">
        <h1 className="font-black tracking-[0.2em] text-[15px] uppercase text-emerald-700">
          MARCADOR WEB
        </h1>
        <button 
          onClick={() => setIsMuted(!isMuted)} 
          className="flex items-center justify-center bg-white hover:bg-gray-100 text-gray-800 w-9 h-9 rounded-full shadow-sm transition-colors duration-200 outline-none border border-gray-200"
          title={isMuted ? "Activar Sonido" : "Silenciar Sonido"}
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-red-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-emerald-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
            </svg>
          )}
        </button>
      </div>

      {/* Filtros de evento */}
      <div className="flex gap-4 mb-6">
        {['VIERNES', 'SABADO'].map((e) => (
          <button key={e} onClick={() => setEventoActivo(e)} className={`px-8 py-3 rounded-full text-sm font-bold transition-colors ${
            eventoActivo === e 
              ? 'bg-emerald-600 text-white' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}>{e}</button>
        ))}
      </div>

      {/* Filtros de categoría */}
      <div className="font-bold mb-6 flex gap-6 overflow-x-auto pb-2 text-gray-600">
        {['Todos', 'Libre', 'Master', 'Femenino'].map((cat) => (
          <button key={cat} onClick={() => setCategoriaActiva(cat)} className={
            categoriaActiva === cat 
              ? 'text-emerald-600 border-b-2 border-emerald-600' 
              : 'hover:text-emerald-500'
          }>{cat}</button>
        ))}
      </div>

      {/* Lista de partidos */}
      <div className="space-y-3">
        {partidos.filter((p) => categoriaActiva === 'Todos' || p.categorias?.nombre === categoriaActiva).map((p) => (
          <PartidoCard key={p.id} partido={p} golInfo={golInfo[p.id]} />
        ))}
      </div>
      <Navbar />
    </main>
  )
}