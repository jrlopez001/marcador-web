'use client'

import Navbar from '../Navbar'

export default function PorteroPage() {
  return (
    <main className="min-h-screen bg-[#0B1120] text-white p-4 font-sans pb-28">
      
      {/* Título de la sección */}
      <div className="flex justify-between items-center mb-6 mt-2">
        <h1 className="text-[#34D399] font-black tracking-[0.2em] text-[15px] opacity-80 uppercase">
          Tabla de Porteros
        </h1>
      </div>

      {/* Aquí irá tu contenido de la tabla de porteros */}
      <div className="text-zinc-500 text-sm">
        <p>Aquí aparecerá la información de los porteros...</p>
      </div>

      {/* Menú inferior */}
      <Navbar />
    </main>
  )
}