'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState, useCallback, memo, useMemo } from 'react';
import { X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';
import Navbar from '../Navbar';

const supabase = createClient();
const CATEGORIAS = ['Todos', 'Libre', 'Master', 'Femenino'];

interface Portero {
  id: number;
  nombre: string;
  posicion: string;
  numero_camisola: number;
  goles_recibidos: number;
  partidos_jugados: number;
  equipos?: { nombre: string };
  categorias?: { nombre: string };
}

// ------------------------------------------------------------
// Hooks: fetch inicial y suscripciones separadas
// ------------------------------------------------------------
function usePorterosFetch() {
  const [allPorteros, setAllPorteros] = useState<Portero[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('jugadores')
        .select(`id, nombre, posicion, numero_camisola, goles_recibidos, partidos_jugados, equipos(nombre), categorias(nombre)`)
        .eq('posicion', 'PORTERO')
        .gt('partidos_jugados', 0);

      if (!error && data) {
        const parsed = data.map((p: any) => ({
          ...p,
          goles_recibidos: p.goles_recibidos ?? 0,
          partidos_jugados: p.partidos_jugados ?? 0,
          equipos: Array.isArray(p.equipos) ? p.equipos[0] : p.equipos,
          categorias: Array.isArray(p.categorias) ? p.categorias[0] : p.categorias,
        })) as Portero[];
        setAllPorteros(parsed);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return { allPorteros, loading };
}

function usePorterosSubscription(
  onInsert: (record: any) => void,
  onUpdate: (record: any) => void,
  onDelete: (oldRecord: any) => void
) {
  useEffect(() => {
    const channel = supabase
      .channel('porteros-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'jugadores', filter: 'posicion=eq.PORTERO' }, (payload) => {
        if (payload.new) onInsert(payload.new);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'jugadores', filter: 'posicion=eq.PORTERO' }, (payload) => {
        if (payload.new) onUpdate(payload.new);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'jugadores', filter: 'posicion=eq.PORTERO' }, (payload) => {
        if (payload.old) onDelete(payload.old);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [onInsert, onUpdate, onDelete]);
}

function usePorterosRealtime() {
  const { allPorteros: initialPorteros, loading } = usePorterosFetch();
  const [allPorteros, setAllPorteros] = useState<Portero[]>([]);

  useEffect(() => {
    if (!loading) setAllPorteros(initialPorteros);
  }, [initialPorteros, loading]);

  const handleInsert = useCallback((newRecord: any) => {
    setAllPorteros((prev) => {
      const newPortero: Portero = {
        id: newRecord.id,
        nombre: newRecord.nombre,
        posicion: newRecord.posicion,
        numero_camisola: newRecord.numero_camisola,
        goles_recibidos: newRecord.goles_recibidos ?? 0,
        partidos_jugados: newRecord.partidos_jugados ?? 0,
        equipos: undefined,
        categorias: undefined,
      };
      if (newPortero.partidos_jugados > 0 && !prev.some(p => p.id === newPortero.id)) {
        return [...prev, newPortero];
      }
      return prev;
    });
  }, []);

  const handleUpdate = useCallback((updatedRecord: any) => {
    setAllPorteros((prev) => {
      const existing = prev.find(p => p.id === updatedRecord.id);
      if (!existing) return prev;
      const updatedPortero: Portero = {
        ...existing,
        goles_recibidos: updatedRecord.goles_recibidos ?? existing.goles_recibidos,
        partidos_jugados: updatedRecord.partidos_jugados ?? existing.partidos_jugados,
      };
      if (updatedPortero.partidos_jugados > 0) {
        return prev.map(p => p.id === updatedPortero.id ? updatedPortero : p);
      } else {
        return prev.filter(p => p.id !== updatedPortero.id);
      }
    });
  }, []);

  const handleDelete = useCallback((oldRecord: any) => {
    setAllPorteros(prev => prev.filter(p => p.id !== oldRecord.id));
  }, []);

  usePorterosSubscription(handleInsert, handleUpdate, handleDelete);

  return { allPorteros, loading };
}

// ------------------------------------------------------------
// Ranking sin mutación (toSorted)
// ------------------------------------------------------------
function usePorterosRanking(allPorteros: Portero[], categoriaActiva: string) {
  return useMemo(() => {
    const filtrados = categoriaActiva === 'Todos'
      ? allPorteros
      : allPorteros.filter(p => p.categorias?.nombre === categoriaActiva);
    return filtrados.toSorted((a, b) => a.goles_recibidos - b.goles_recibidos).slice(0, 5);
  }, [allPorteros, categoriaActiva]);
}

// ------------------------------------------------------------
// Componentes visuales
// ------------------------------------------------------------
const CategoriasTabs = memo(({ activa, onChange }: { activa: string; onChange: (cat: string) => void }) => (
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
// PlayerCard actualizado según tu especificación
// ------------------------------------------------------------
const PlayerCard = memo(({ jugador, onOpenModal, onConfetti }: {
  jugador: Portero;
  onOpenModal: (j: Portero) => void;
  onConfetti: (e: React.MouseEvent) => void;
}) => (
  <motion.div
    layoutId={`portero-${jugador.id}`}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
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
      <span className="font-black text-2xl">{jugador.goles_recibidos}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onConfetti(e); }}
        className="mt-2 text-2xl hover:scale-125 transition-transform"
        aria-label="Festejar"
      >
        🧤
      </button>
    </div>
  </motion.div>
), (prev, next) => prev.jugador.id === next.jugador.id && prev.jugador.goles_recibidos === next.jugador.goles_recibidos);
PlayerCard.displayName = 'PlayerCard';

// ------------------------------------------------------------
// Modal (sin cambios)
// ------------------------------------------------------------
const PlayerModal = memo(({ player, onClose }: { player: Portero | null; onClose: () => void }) => {
  if (!player) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm bg-[#07182E] rounded-2xl overflow-hidden relative border border-white/10 p-6 hover:shadow-[0_0_30px_rgba(0,183,255,0.5)] hover:border-cyan-500/50 cursor-default transform-gpu will-change-transform"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold text-[#34D399] mb-6">{player.nombre}</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-zinc-400">Posición</span>
            <span className="font-medium text-white">{player.posicion}</span>
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
            <span className="text-zinc-400">Goles recibidos</span>
            <span className="font-medium text-white">{player.goles_recibidos}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Juegos totales</span>
            <span className="font-medium text-white">{player.partidos_jugados}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
});
PlayerModal.displayName = 'PlayerModal';

// ------------------------------------------------------------
// Componente principal
// ------------------------------------------------------------
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

export default function PorteroPage() {
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [selectedPlayer, setSelectedPlayer] = useState<Portero | null>(null);

  const { allPorteros, loading } = usePorterosRealtime();
  const porteros = usePorterosRanking(allPorteros, categoriaActiva);

  const dispararConfeti = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    confetti({ particleCount: 45, spread: 70, origin: { y: 0.6 }, ticks: 120 });
  }, []);

  const openModal = useCallback((jugador: Portero) => setSelectedPlayer(jugador), []);
  const closeModal = useCallback(() => setSelectedPlayer(null), []);

  if (loading) {
    return <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center">Cargando...</div>;
  }

  return (
    <LazyMotion features={domAnimation}>
      <main className="min-h-screen bg-[#0B1120] text-white p-4 font-sans pb-28">
        <h1 className="text-[#34D399] font-black tracking-[0.2em] text-[15px] opacity-80 uppercase mb-6 mt-2">
          Portero Menos Vencido
        </h1>
        <CategoriasTabs activa={categoriaActiva} onChange={setCategoriaActiva} />

        {porteros.length > 0 ? (
          <AnimatePresence mode="popLayout">
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
              {porteros.map(p => (
                <motion.div key={p.id} variants={itemVariants}>
                  <PlayerCard jugador={p} onOpenModal={openModal} onConfetti={dispararConfeti} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-zinc-500 font-medium">No hay porteros registrados en esta categoría aún.</p>
          </div>
        )}

        {selectedPlayer && <PlayerModal player={selectedPlayer} onClose={closeModal} />}
        <Navbar />
      </main>
    </LazyMotion>
  );
}