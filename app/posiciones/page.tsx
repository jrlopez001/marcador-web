'use client'

import Navbar from '../Navbar'
import confetti from 'canvas-confetti'

export default function PosicionesPage() {


  return (
    <main className="min-h-screen bg-[#0B1120] text-white p-4 font-sans pb-32">
      
      {/* Título */}
      <div className="flex justify-between items-center mb-10 mt-6">
        <h1 className="text-[#34D399] font-black tracking-[0.2em] text-[15px] opacity-80 uppercase">
          Tabla de Posiciones
        </h1>
      </div>

      
      {/* Contenido */}
      <div className="text-zinc-500 text-sm text-center">
        <p>Aquí aparecerá la información de las posiciones...</p>
      </div>

      {/* Menú inferior */}
      <Navbar />
    </main>
  )
}