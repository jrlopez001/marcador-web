export default function TorneoPage() {

  return (

    <main className="min-h-screen bg-green-900 text-white p-10">

      <h1 className="text-5xl font-black text-center mb-16 uppercase">
        Llaves del Torneo
      </h1>

      <div className="grid grid-cols-4 gap-10">

        {/* OCTAVOS */}

        <div className="space-y-10">

          <div className="bg-white text-black rounded-xl p-4 font-bold">
            Guatemala
          </div>

          <div className="bg-white text-black rounded-xl p-4 font-bold">
            Puerto Barrios
          </div>

          <div className="bg-white text-black rounded-xl p-4 font-bold">
            Cobán
          </div>

          <div className="bg-white text-black rounded-xl p-4 font-bold">
            Petén
          </div>

        </div>

        {/* CUARTOS */}

        <div className="space-y-24 mt-20">

          <div className="bg-white text-black rounded-xl p-4 font-bold">
            Guatemala
          </div>

          <div className="bg-white text-black rounded-xl p-4 font-bold">
            Cobán
          </div>

        </div>

        {/* SEMI */}

        <div className="mt-40 space-y-20">

          <div className="bg-white text-black rounded-xl p-4 font-bold">
            Guatemala
          </div>

        </div>

        {/* FINAL */}

        <div className="mt-60">

          <div className="bg-yellow-400 text-black rounded-xl p-6 font-black text-center text-2xl">
            🏆 Campeón
          </div>

        </div>

      </div>

    </main>

  )
}