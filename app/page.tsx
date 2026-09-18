'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Ruleta() {
  const [opcionesTexto, setOpcionesTexto] = useState(
    '¡Casi ganas, colocho(a)! (Cero premio)\n' +
    '¡A la gran! No ganaste (Cero premio)\n' +
    '¡Puchis, qué salado! Perdiste (Cero premio)\n' +
    'Premio Consuelo, por buzo: ¡Tomá un premio!\n' +
    '¡Buena onda, tomá un premio!\n' +
    '¡Mejor dedicate a vender atol! (Cero premio)\n' +
    '¡Puchis, qué chilero, te ganaste un premio!\n' +
    'Ya te hiciste bolas, por eso perdiste (Cero premio)\n' +
    '¡Te fuiste en blanco, mejor pedí fiado! (Cero premio)\n' +
    '¡Pilas pues, te rayaste 1 premio'
  )
  const [rotacion, setRotacion] = useState(0)
  const [girando, setGirando] = useState(false)
  const [ganador, setGanador] = useState<string | null>(null)

  const opciones = opcionesTexto
    .split('\n')
    .map((opt) => opt.trim())
    .filter((opt) => opt.length > 0)

  const girarRuleta = () => {
    if (girando || opciones.length === 0) return

    setGirando(true)
    setGanador(null)

    const totalOpciones = opciones.length
    const gradosPorOpcion = 360 / totalOpciones

    const vueltasExtras = Math.floor(Math.random() * 5) + 5
    const opcionGanadoraIndex = Math.floor(Math.random() * totalOpciones)
    
    const anguloDestino = rotacion + (360 * vueltasExtras) + (360 - (opcionGanadoraIndex * gradosPorOpcion) - (gradosPorOpcion / 2))

    setRotacion(anguloDestino)

    setTimeout(() => {
      setGirando(false)
      setGanador(opciones[opcionGanadoraIndex])
    }, 4000)
  }

  const colores = ['#059669', '#10b981', '#047857', '#34d399', '#065f46', '#6ee7b7', '#046c4e', '#2bb673']

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col items-center">
      <h2 className="text-xl font-black text-emerald-700 tracking-wider uppercase mb-2">
        Ruleta Chapina
      </h2>
      <p className="text-xs text-gray-500 mb-4 text-center">
        ¡Gira la ruleta y mira qué te depara la suerte hoy!
      </p>

      {/* Contenedor de la Ruleta */}
      <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center my-4">
        {/* Indicador / Flecha superior */}
        <div className="absolute -top-3 z-30 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-red-600 drop-shadow-md" />

        <motion.div
          animate={{ rotate: rotacion }}
          transition={{ duration: 4, ease: [0.15, 0.85, 0.15, 1] }}
          className="w-full h-full rounded-full border-4 border-emerald-800 shadow-xl relative overflow-hidden bg-white"
        >
          {opciones.length > 0 ? (
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {opciones.map((op, i) => {
                const total = opciones.length
                const angulo = 360 / total
                const rotacionSlice = i * angulo
                
                const x1 = 50 + 50 * Math.cos((Math.PI * rotacionSlice) / 180)
                const y1 = 50 + 50 * Math.sin((Math.PI * rotacionSlice) / 180)
                const x2 = 50 + 50 * Math.cos((Math.PI * (rotacionSlice + angulo)) / 180)
                const y2 = 50 + 50 * Math.sin((Math.PI * (rotacionSlice + angulo)) / 180)
                const largeArc = angulo > 180 ? 1 : 0

                // Ángulo medio para posicionar el texto dentro del gajo
                const anguloMedio = rotacionSlice + angulo / 2
                
                // Recortar texto largo para que se vea ordenado dentro de la gráfica
                const textoCorto = op.length > 22 ? op.substring(0, 20) + '...' : op

                return (
                  <g key={i}>
                    <path
                      d={`M50,50 L${x1},${y1} A50,50 0 ${largeArc},1 ${x2},${y2} Z`}
                      fill={colores[i % colores.length]}
                      stroke="#ffffff"
                      strokeWidth="0.8"
                    />
                    <text
                      x="72"
                      y="50"
                      fill="#ffffff"
                      fontSize="3.2"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                      transform={`rotate(${anguloMedio}, 50, 50)`}
                      style={{ textShadow: '0px 0px 2px rgba(0,0,0,0.7)' }}
                    >
                      {textoCorto}
                    </text>
                  </g>
                )
              })}
            </svg>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-gray-400 font-bold">
              Agrega opciones
            </div>
          )}
        </motion.div>

        {/* Botón Central de la Ruleta */}
        <button
          onClick={girarRuleta}
          disabled={girando || opciones.length === 0}
          className="absolute z-20 w-16 h-16 bg-white border-4 border-emerald-800 rounded-full flex items-center justify-center shadow-lg font-black text-xs text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-transform cursor-pointer disabled:opacity-50"
        >
          {girando ? '...' : 'GIRAR'}
        </button>
      </div>

      {/* Textarea para editar o agregar más opciones */}
      <div className="w-full mt-4">
        <label className="block text-xs font-bold uppercase text-gray-600 mb-2">
          Opciones de la ruleta (una por línea):
        </label>
        <textarea
          rows={5}
          value={opcionesTexto}
          onChange={(e) => setOpcionesTexto(e.target.value)}
          disabled={girando}
          className="w-full p-3 rounded-xl border border-gray-200 bg-white text-xs text-gray-800 focus:outline-none focus:border-emerald-600 shadow-sm resize-none font-medium"
        />
      </div>

      {/* Modal de Resultado */}
      <AnimatePresence>
        {ganador && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          >
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-emerald-100">
              <span className="text-3xl">🎯</span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-2 mb-1">
                Resultado
              </h3>
              <p className="text-xl font-black text-emerald-700 my-3">
                {ganador}
              </p>
              <button
                onClick={() => setGanador(null)}
                className="mt-4 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-md text-sm"
              >
                ¡Probar otra vez!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}