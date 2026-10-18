import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, Zap, Flame, Footprints, X, RotateCcw } from 'lucide-react';
import { WorkoutStats } from '../types/fencing';

interface SummaryModalProps {
  stats: WorkoutStats;
  onClose: () => void;
  onRestart: () => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({ stats, onClose, onRestart }) => {
  useEffect(() => {
    // Fire celebratory confetti on mobile
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'],
    });
  }, []);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  // Estimated calories: ~6 kcal/min for intense fencing footwork
  const caloriesBurned = Math.round((stats.totalTimeSeconds / 60) * 6.5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-sm rounded-3xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl text-zinc-100 flex flex-col items-center text-center relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center text-black shadow-xl shadow-yellow-950/40 mb-3">
          <Trophy className="w-9 h-9 fill-current" />
        </div>

        <h3 className="text-2xl font-black text-white tracking-tight">¡Entrenamiento Completado!</h3>
        <p className="text-xs text-zinc-400 mt-1 mb-5">Excelente sesión de piernas y desplazamientos</p>

        {/* 4 Key Metrics */}
        <div className="grid grid-cols-2 gap-2.5 w-full mb-5">
          <div className="bg-black/70 border border-zinc-850 rounded-2xl p-3 flex flex-col items-center">
            <Clock className="w-4 h-4 text-blue-400 mb-1" />
            <span className="text-lg font-black font-mono text-white">{formatTime(stats.totalTimeSeconds)}</span>
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">Duración</span>
          </div>

          <div className="bg-black/70 border border-zinc-850 rounded-2xl p-3 flex flex-col items-center">
            <Zap className="w-4 h-4 text-yellow-400 mb-1" />
            <span className="text-lg font-black font-mono text-white">{stats.totalActions}</span>
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">Acciones</span>
          </div>

          <div className="bg-black/70 border border-zinc-850 rounded-2xl p-3 flex flex-col items-center">
            <Flame className="w-4 h-4 text-rose-400 mb-1" />
            <span className="text-lg font-black font-mono text-rose-400">{stats.lungesCount}</span>
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">Fondos</span>
          </div>

          <div className="bg-black/70 border border-zinc-850 rounded-2xl p-3 flex flex-col items-center">
            <Footprints className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-lg font-black font-mono text-emerald-400">{stats.totalDistanceMeters}m</span>
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">Distancia</span>
          </div>
        </div>

        {/* Energy estimate */}
        <div className="w-full bg-black/60 border border-zinc-850 rounded-xl p-2.5 mb-4 text-xs text-zinc-300 flex justify-between items-center px-4">
          <span className="text-zinc-400">Gasto calórico estimado:</span>
          <span className="font-mono font-bold text-amber-400">~{caloriesBurned} kcal</span>
        </div>

        {/* Action Breakdown */}
        {Object.keys(stats.actionsBreakdown).length > 0 && (
          <div className="w-full text-left mb-5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block mb-2">
              Desglose de acciones
            </span>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {Object.entries(stats.actionsBreakdown)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([name, count]) => (
                  <div
                    key={name}
                    className="flex justify-between items-center text-xs py-1 px-2.5 rounded-lg bg-black/60 border border-zinc-850"
                  >
                    <span className="text-zinc-300 truncate font-medium">{name}</span>
                    <span className="font-mono font-bold text-blue-400 ml-2">{count}x</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="w-full space-y-2">
          <button
            onClick={onRestart}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 font-bold text-sm text-white shadow-lg shadow-blue-950/50 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Nuevo Entrenamiento
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs transition cursor-pointer border border-zinc-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
