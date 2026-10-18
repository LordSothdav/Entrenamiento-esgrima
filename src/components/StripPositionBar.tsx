import React from 'react';
import { Shield } from 'lucide-react';

interface StripPositionBarProps {
  currentPositionCm: number;
  totalSpaceCm: number;
  lastDistanceDelta?: number;
}

export const StripPositionBar: React.FC<StripPositionBarProps> = ({
  currentPositionCm,
  totalSpaceCm,
  lastDistanceDelta = 0,
}) => {
  const percent = Math.min(100, Math.max(0, (currentPositionCm / totalSpaceCm) * 100));
  const currentMeters = (currentPositionCm / 100).toFixed(2);
  const totalMeters = (totalSpaceCm / 100).toFixed(1);

  // Danger zones near edges
  const isNearBack = percent < 18;
  const isNearFront = percent > 82;

  return (
    <div className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-3 shadow-md">
      <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-zinc-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
          Fondo pista (Atrás 0m)
        </span>
        <span className="text-white font-mono font-bold text-sm bg-black/80 px-2 py-0.5 rounded-lg border border-zinc-800">
          {currentMeters}m / {totalMeters}m
        </span>
        <span className="flex items-center gap-1">
          Avanzado ({totalMeters}m)
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
        </span>
      </div>

      {/* Realistic Piste Strip */}
      <div className="relative h-9 w-full bg-black rounded-xl overflow-hidden border border-zinc-850 shadow-inner flex items-center">
        {/* Strip Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px)] bg-[size:10%_100%] opacity-30 pointer-events-none" />

        {/* Warning zone back */}
        <div className="absolute left-0 top-0 bottom-0 w-[15%] bg-rose-950/30 border-r border-rose-500/30" />

        {/* Center Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-yellow-400/60 -translate-x-1/2 z-10">
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-yellow-400/80 uppercase">
            C
          </span>
        </div>

        {/* Warning zone front */}
        <div className="absolute right-0 top-0 bottom-0 w-[15%] bg-emerald-950/30 border-l border-emerald-500/30" />

        {/* Fencer Position Marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 transition-all duration-500 ease-out flex flex-col items-center"
          style={{ left: `${percent}%` }}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 ${
              isNearBack
                ? 'bg-rose-500 text-white ring-2 ring-rose-400 ring-offset-1 ring-offset-slate-950 animate-pulse'
                : isNearFront
                ? 'bg-emerald-500 text-white ring-2 ring-emerald-400 ring-offset-1 ring-offset-slate-950 animate-pulse'
                : 'bg-blue-500 text-white ring-2 ring-blue-300 ring-offset-1 ring-offset-slate-950'
            }`}
          >
            <Shield className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Status indicator bar note */}
      <div className="flex justify-between items-center text-[11px] mt-1.5 px-0.5">
        <span className={isNearBack ? "text-rose-400 font-semibold" : "text-slate-500"}>
          {isNearBack ? "¡Cuidado! Cerca del límite trasero" : "Margen atrás: " + (currentPositionCm / 100).toFixed(1) + "m"}
        </span>
        {lastDistanceDelta !== 0 && (
          <span
            className={`font-semibold font-mono text-xs ${
              lastDistanceDelta > 0 ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {lastDistanceDelta > 0 ? `+${lastDistanceDelta} cm` : `${lastDistanceDelta} cm`}
          </span>
        )}
        <span className={isNearFront ? "text-emerald-400 font-semibold" : "text-slate-500"}>
          {isNearFront ? "¡Cuidado! Cerca del límite delantero" : "Margen adelante: " + ((totalSpaceCm - currentPositionCm) / 100).toFixed(1) + "m"}
        </span>
      </div>
    </div>
  );
};
