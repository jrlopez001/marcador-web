'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState, useCallback, memo, useMemo } from 'react';
import { X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../Navbar';

// ------------------------------------------------------------
// Cliente Supabase (instancia única fuera del componente)
// ------------------------------------------------------------
const supabase = createClient();

// ------------------------------------------------------------
// Constantes fuera del componente
// ------------------------------------------------------------
const CATEGORIAS = ['Todos', 'Libre', 'Master', 'Femenino'];

// ------------------------------------------------------------
// Tipos
// ------------------------------------------------------------
interface Goleador {
  id: number;
  nombre: string;
  posicion: string;
  numero_camisola: number;
  goles: number;
  partidos_jugados: number;
  equipos?: { nombre: string };
  categorias?: { nombre: string };
}

// ------------------------------------------------------------
// Componente de pestañas de categorías (memoizado)
// ------------------------------------------------------------
const CategoriasTabs = memo(({ 
  activa, 
  onChange 
}: { 
  activa: string; 
  onChange: (cat: string) => void; 
}) => (
  <div className="text-zinc-500 font-bold mb-6 flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
    {CATEGORIAS.map((cat) => (
      <button
        key={cat}
        onClick={() => onChange(cat)}
        className={activa === cat ? 'text-[#34D399] border-b-2 border-[#34D399]' : 'hover:text-[#34D399]/70'}
      >
        {cat}
      </button>
    ))}
  </div>
));
CategoriasTabs.displayName = 'CategoriasTabs';

// ------------------------------------------------------------
// Tarjeta de jugador (memoizada) – NUEVO DISEÑO
// ------------------------------------------------------------
const PlayerCard = memo(({ 
  jugador, 
  onOpenModal, 
  onConfetti 
}: { 
  jugador: Goleador; 
  onOpenModal: (j: Goleador) => void; 
  onConfetti: (e: React.MouseEvent) => void;
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="group p-4 rounded-2xl bg-[#111827] border border-white/5 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer flex justify-between items-center"
      onClick={() => onOpenModal(jugador)}
    >
      {/* Columna Izquierda: Información Principal */}
      <div className="flex-1">
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
          CAMISOLA # <span className="text-[#34D399] text-lg">{jugador.numero_camisola}</span>
        </div>
        <h3 className="text-xl font-bold text-white group-hover:text-[#34D399] transition-colors">{jugador.nombre}</h3>
        <p className="text-sm text-zinc-400">Equipo: {jugador.equipos?.nombre || 'Sin equipo'}</p>
        <div className="text-[10px] font-bold text-[#34D399] uppercase mt-1">
          {jugador.categorias?.nombre || 'Sin categoría'}
        </div>
      </div>
      
      {/* Columna Derecha: Goles y Acción */}
      <div className="flex flex-col items-center border-l border-white/10 pl-4">
        <span className="font-black text-2xl">{jugador.goles}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onConfetti(e); }}
          className="mt-2 text-2xl hover:scale-125 transition-transform"
          aria-label="Festejar"
        >
          ⚽
        </button>
      </div>
    </motion.div>
  );
}, (prev, next) => {
  // Comparación personalizada: solo rerenderizar si cambian datos clave
  return (
    prev.jugador.goles === next.jugador.goles &&
    prev.jugador.partidos_jugados === next.jugador.partidos_jugados &&
    prev.jugador.nombre === next.jugador.nombre &&
    prev.jugador.numero_camisola === next.jugador.numero_camisola &&
    prev.jugador.equipos?.nombre === next.jugador.equipos?.nombre
  );
});
PlayerCard.displayName = 'PlayerCard';

// ------------------------------------------------------------
// Modal de detalles (memoizado) – sin cambios
// ------------------------------------------------------------
const PlayerModal = memo(({ 
  isOpen, 
  player, 
  onClose 
}: { 
  isOpen: boolean; 
  player: Goleador | null; 
  onClose: () => void;
}) => {
  if (!isOpen || !player) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-[#07182E] rounded-2xl overflow-hidden relative transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,183,255,0.5)] border border-white/10 will-change-transform transform-gpu"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white z-20">
          <X size={20} />
        </button>
        <div className="p-6 relative z-10">
          <h2 className="text-2xl font-bold text-[#34D399] mb-6 pr-6">{player.nombre}</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-zinc-400">Posición</span>
              <span className="font-medium text-white">{player.posicion || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-zinc-400">Número de camisola</span>
              <span className="font-medium text-white">{player.numero_camisola}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-zinc-400">Categoría</span>
              <span className="font-medium text-white">{player.categorias?.nombre || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-zinc-400">Equipo</span>
              <span className="font-medium text-white">{player.equipos?.nombre || 'Sin equipo'}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-zinc-400">Goles totales</span>
              <span className="font-medium text-white">{player.goles}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Juegos totales</span>
              <span className="font-medium text-white">{player.partidos_jugados}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
PlayerModal.displayName = 'PlayerModal';

// ------------------------------------------------------------
// Componente principal
// ------------------------------------------------------------
export default function GoleadorPage() {
  const [goleadores, setGoleadores] = useState<Goleador[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Goleador | null>(null);

  // Funciones estabilizadas con useCallback
  const dispararConfeti = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    confetti({
      particleCount: 45,
      spread: 70,
      origin: { y: 0.6 },
      ticks: 120
    });
  }, []);

  const openModal = useCallback((jugador: Goleador) => {
    setSelectedPlayer(jugador);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPlayer(null);
  }, []);

  // Fetch optimizado: sin limit, filtro en cliente
  const fetchGoleadores = useCallback(async (categoria: string) => {
    const { data, error } = await supabase
      .from('jugadores')
      .select(`
        id,
        nombre,
        posicion,
        numero_camisola,
        goles,
        partidos_jugados,
        equipos(nombre),
        categorias(nombre)
      `)
      .gt('goles', 0)
      .neq('posicion', 'PORTERO')
      .order('goles', { ascending: false });

    if (error) {
      console.error('Error cargando goleadores:', error);
      return;
    }

    const jugadores: Goleador[] = (data || []).map((j: any) => ({
      id: j.id,
      nombre: j.nombre,
      posicion: j.posicion,
      numero_camisola: j.numero_camisola,
      goles: j.goles ?? 0,
      partidos_jugados: j.partidos_jugados ?? 0,
      equipos: Array.isArray(j.equipos) ? j.equipos[0] : j.equipos,
      categorias: Array.isArray(j.categorias) ? j.categorias[0] : j.categorias,
    }));

    // Filtro por categoría en cliente
    const filtrados =
      categoria === 'Todos'
        ? jugadores
        : jugadores.filter(
            (j) => j.categorias?.nombre === categoria
          );

    setGoleadores(filtrados.slice(0, 5));
  }, []);

  // Carga inicial y cambio de categoría
  useEffect(() => {
    fetchGoleadores(categoriaActiva);
  }, [categoriaActiva, fetchGoleadores]);

  // Realtime: escucha INSERT y UPDATE, con setTimeout para evitar asincronía dentro del setter
  useEffect(() => {
    const channel = supabase
      .channel('realtime:jugadores')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jugadores' },
        (payload) => {
          const { eventType, new: updated } = payload;
          if (eventType !== 'INSERT' && eventType !== 'UPDATE') return;

          const jugadorActualizado = updated as Partial<Goleador>;

          setGoleadores((prev) => {
            const existe = prev.some((j) => j.id === jugadorActualizado.id);

            if (!existe) {
              // Evita llamada asíncrona directa dentro del setter
              setTimeout(() => {
                fetchGoleadores(categoriaActiva);
              }, 0);
              return prev;
            }

            // Actualización incremental del jugador existente
            const nuevos = prev.map((j) =>
              j.id === jugadorActualizado.id
                ? {
                    ...j,
                    goles: jugadorActualizado.goles ?? j.goles,
                    partidos_jugados: jugadorActualizado.partidos_jugados ?? j.partidos_jugados,
                  }
                : j
            );
            return [...nuevos].sort((a, b) => b.goles - a.goles).slice(0, 5);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [categoriaActiva, fetchGoleadores]);

  // Memorización de la lista de cards con AnimatePresence para animaciones de salida
  const renderedPlayers = useMemo(() => {
    return goleadores.map((jugador) => (
      <PlayerCard
        key={jugador.id}
        jugador={jugador}
        onOpenModal={openModal}
        onConfetti={dispararConfeti}
      />
    ));
  }, [goleadores, openModal, dispararConfeti]);

  return (
    <main className="min-h-screen bg-[#0B1120] text-white p-4 font-sans pb-28">
      <div className="flex justify-between items-center mb-6 mt-2">
        <h1 className="text-[#34D399] font-black tracking-[0.2em] text-[15px] opacity-80 uppercase">
          Top 5 Goleadores
        </h1>
      </div>

      <CategoriasTabs
        activa={categoriaActiva}
        onChange={setCategoriaActiva}
      />

      {goleadores.length > 0 ? (
        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {renderedPlayers}
          </div>
        </AnimatePresence>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-zinc-500 font-medium">
            No hay goleadores registrados en esta categoría aún.
          </p>
        </div>
      )}

      <PlayerModal
        isOpen={isModalOpen}
        player={selectedPlayer}
        onClose={closeModal}
      />

      <Navbar />
    </main>
  );
}