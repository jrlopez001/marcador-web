"use client";

export default function ArmAnimationPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F48C3C]">
      {/* Contenedor del brazo */}
      <div className="relative">
        <div 
          className="arm-right"
          style={{
            backgroundColor: '#EAB08C',
            borderLeft: '8px solid rgba(19, 36, 44, 0.1)',
            borderRadius: '50px',
            height: '180px',
            width: '60px',
            // El origen es la parte superior central
            transformOrigin: '30px 30px',
            // Aplicamos la animación
            animation: 'swing 2s infinite ease-in-out'
          }}
        />
      </div>

      <style jsx global>{`
        @keyframes swing {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(45deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}