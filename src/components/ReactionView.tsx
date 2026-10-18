import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  Square,
  Zap,
  Clock,
  Sliders,
  Hash,
  Layers,
  ArrowRight,
  Target,
  Sparkles,
} from 'lucide-react';
import { ReactionSettings, PlastronCallMode } from '../types/fencing';
import { soundEngine } from '../services/soundEngine';
import { speechEngine } from '../services/speechEngine';

interface ReactionViewProps {
  settings: ReactionSettings;
  onUpdateSettings: (newSettings: ReactionSettings) => void;
  soundEnabled: boolean;
}

type ReactionState = 'idle' | 'countdown' | 'running' | 'paused';

export interface PlastronSignal {
  type: 'single' | 'combination' | 'feint';
  numbers: number[];
  spokenText: string;
  tag: string;
  feintTarget?: number;
  hitTarget?: number;
}

const NUMBER_WORDS: Record<number, string> = {
  1: 'uno',
  2: 'dos',
  3: 'tres',
  4: 'cuatro',
  5: 'cinco',
  6: 'seis',
  7: 'siete',
  8: 'ocho',
  9: 'nueve',
  10: 'diez',
  11: 'once',
  12: 'doce',
};

const getWord = (n: number) => NUMBER_WORDS[n] || String(n);

export const ReactionView: React.FC<ReactionViewProps> = ({
  settings,
  onUpdateSettings,
  soundEnabled,
}) => {
  const [reactionState, setReactionState] = useState<ReactionState>('idle');
  const [countdown, setCountdown] = useState<number>(3);
  const [currentSignal, setCurrentSignal] = useState<PlastronSignal | null>(null);
  const [reactionsCount, setReactionsCount] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [customInputText, setCustomInputText] = useState<string>(settings.customNumbersText || '1, 2, 3, 4');
  const [showConfig, setShowConfig] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSignalRef = useRef<string | null>(null);

  const plastronMode: PlastronCallMode = settings.plastronMode || 'mixed';
  const combinationMax: number = settings.combinationMaxNumbers || 3;

  // Parse numbers list from text
  const parseNumbers = (text: string): number[] => {
    const parts = text
      .split(/[\s,;]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0 && n <= 99);
    const unique = [...new Set(parts)];
    return unique.length > 0 ? unique : [1, 2, 3, 4];
  };

  // Elapsed timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (reactionState === 'running') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [reactionState]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Sync custom input text if settings update externally
  useEffect(() => {
    if (settings.customNumbersText && settings.customNumbersText !== customInputText) {
      setCustomInputText(settings.customNumbersText);
    }
  }, [settings.customNumbersText]);

  // Generate a random Plastron signal based on configuration
  const generateSignal = useCallback((): PlastronSignal => {
    const list = settings.numbersList && settings.numbersList.length > 0 ? settings.numbersList : [1, 2, 3, 4];

    // Determine type based on mode
    let chosenType: 'single' | 'combination' | 'feint' = 'single';
    if (plastronMode === 'singles') {
      chosenType = 'single';
    } else if (plastronMode === 'combinations') {
      chosenType = 'combination';
    } else if (plastronMode === 'feints') {
      chosenType = 'feint';
    } else {
      // Mixed mode: 40% singles, 35% combinations, 25% feints
      const rand = Math.random();
      if (rand < 0.4) {
        chosenType = 'single';
      } else if (rand < 0.75) {
        chosenType = 'combination';
      } else {
        chosenType = 'feint';
      }
    }

    if (chosenType === 'single') {
      // Pick 1 number avoiding direct repeat
      let num = list[Math.floor(Math.random() * list.length)];
      if (list.length > 1 && String(num) === lastSignalRef.current && Math.random() < 0.7) {
        const others = list.filter((n) => String(n) !== lastSignalRef.current);
        num = others[Math.floor(Math.random() * others.length)];
      }
      const word = getWord(num);
      const capWord = word.charAt(0).toUpperCase() + word.slice(1);
      return {
        type: 'single',
        numbers: [num],
        spokenText: `¡${capWord}!`,
        tag: 'Diana Directa',
      };
    }

    if (chosenType === 'combination') {
      // 2 or 3 numbers for rapid hits
      const count = combinationMax === 2 ? 2 : Math.random() < 0.5 ? 2 : 3;
      const selected: number[] = [];
      for (let i = 0; i < count; i++) {
        // Avoid immediate duplicate consecutive number in sequence
        const available = list.filter((n) => (selected.length === 0 ? true : n !== selected[selected.length - 1]));
        const pool = available.length > 0 ? available : list;
        selected.push(pool[Math.floor(Math.random() * pool.length)]);
      }

      const spokenWords = selected.map((n) => getWord(n)).join(', ');
      const capSpoken = spokenWords.charAt(0).toUpperCase() + spokenWords.slice(1);

      return {
        type: 'combination',
        numbers: selected,
        spokenText: `¡${capSpoken}!`,
        tag: `Combinación Rápida (${count} toques)`,
      };
    }

    // Feint type: Always announces the feint and then the hit target.
    // If the hit is to the same target (e.g. 1 and 1), repeats the number: "¡Finta al uno, uno!"
    // If the hit is to a different target (e.g. 1 and 2): "¡Finta al uno, dos!"
    const feintTarget = list[Math.floor(Math.random() * list.length)];
    let hitTarget = feintTarget;
    // When multiple numbers are configured: ~60% change of target, ~40% feint and hit to same target
    if (list.length > 1 && Math.random() < 0.6) {
      const others = list.filter((n) => n !== feintTarget);
      hitTarget = others[Math.floor(Math.random() * others.length)];
    }

    const feintWord = getWord(feintTarget);
    const hitWord = getWord(hitTarget);
    const isSameTarget = feintTarget === hitTarget;

    return {
      type: 'feint',
      numbers: [feintTarget, hitTarget],
      feintTarget,
      hitTarget,
      spokenText: `¡Finta al ${feintWord}, ${hitWord}!`,
      tag: isSameTarget ? 'Finta y Tocado (Misma Línea)' : 'Finta y Tocado',
    };
  }, [settings.numbersList, plastronMode, combinationMax]);

  // Voice signal with masculine FIE referee cadence
  const triggerReactionSignal = useCallback(
    (signal: PlastronSignal) => {
      if (!soundEnabled) return;
      speechEngine.speak(signal.spokenText, settings.speechRate || 1.15, 0.92, 1.0);
    },
    [soundEnabled, settings.speechRate]
  );

  const scheduleNextReaction = useCallback(() => {
    // Pick random delay between min and max
    const min = Math.max(400, Math.min(settings.minDelayMs || 1200, settings.maxDelayMs || 2500));
    const max = Math.max(min, Math.max(settings.minDelayMs || 1200, settings.maxDelayMs || 2500));
    const delayMs = Math.floor(Math.random() * (max - min + 1)) + min;

    timerRef.current = setTimeout(() => {
      const nextSignal = generateSignal();
      lastSignalRef.current = nextSignal.spokenText;
      setCurrentSignal(nextSignal);
      setReactionsCount((prev) => prev + 1);

      triggerReactionSignal(nextSignal);

      // Continue loop
      scheduleNextReaction();
    }, delayMs);
  }, [settings, generateSignal, triggerReactionSignal]);

  const handleStart = () => {
    soundEngine.unlockAudio();
    setReactionState('countdown');
    let count = 3;
    setCountdown(count);

    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        if (soundEnabled) {
          speechEngine.speak('¡Atento!', settings.speechRate || 1.15, 0.92, 1.0);
        }
        setReactionState('running');
        scheduleNextReaction();
      }
    }, 1000);
  };

  const handlePause = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    speechEngine.stop();
    setReactionState('paused');
  };

  const handleResume = () => {
    setReactionState('running');
    scheduleNextReaction();
  };

  const handleStop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    speechEngine.stop();
    setReactionState('idle');
    setCurrentSignal(null);
    setReactionsCount(0);
    setElapsedSeconds(0);
    lastSignalRef.current = null;
  };

  const handleUpdateNumbersText = (text: string) => {
    setCustomInputText(text);
    const parsed = parseNumbers(text);
    onUpdateSettings({
      ...settings,
      customNumbersText: text,
      numbersList: parsed,
    });
  };

  const handleApplyPreset = (nums: number[]) => {
    const text = nums.join(', ');
    setCustomInputText(text);
    onUpdateSettings({
      ...settings,
      customNumbersText: text,
      numbersList: nums,
    });
  };

  const handleSetPlastronMode = (mode: PlastronCallMode) => {
    onUpdateSettings({
      ...settings,
      plastronMode: mode,
    });
  };

  const handleSetMaxNumbers = (max: number) => {
    onUpdateSettings({
      ...settings,
      combinationMaxNumbers: max,
    });
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const minSec = (settings.minDelayMs / 1000).toFixed(1);
  const maxSec = (settings.maxDelayMs / 1000).toFixed(1);

  return (
    <div className="flex flex-col min-h-[calc(100vh-8.5rem)] justify-between pb-4">
      {/* Top Banner / Description */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-3.5 mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            Entrenamiento de Plastron
          </h2>
          <p className="text-xs text-zinc-400">
            Voz del árbitro FIE · Combinaciones de toques y fintas · Solo voz
          </p>
        </div>
        {reactionState === 'idle' && (
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 border border-zinc-800 transition cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            {showConfig ? 'Ocultar' : 'Ajustar'}
          </button>
        )}
      </div>

      {/* Configuration Drawer (When in idle) */}
      {reactionState === 'idle' && (
        <div className="space-y-3 mb-3">
          {/* Plastron Call Mode Selector */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-yellow-400" />
                Tipo de llamadas al Plastron:
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                {plastronMode === 'mixed' && 'Mixto'}
                {plastronMode === 'combinations' && 'Combinaciones'}
                {plastronMode === 'feints' && 'Fintas'}
                {plastronMode === 'singles' && 'Simples'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                {
                  id: 'mixed' as PlastronCallMode,
                  label: 'Mixto Completo',
                  desc: 'Simples, combos y fintas',
                  icon: <Sparkles className="w-4 h-4 text-amber-400" />,
                },
                {
                  id: 'combinations' as PlastronCallMode,
                  label: 'Combinaciones',
                  desc: '2 o 3 números rápidos',
                  icon: <Layers className="w-4 h-4 text-cyan-400" />,
                },
                {
                  id: 'feints' as PlastronCallMode,
                  label: 'Fintas y Tocado',
                  desc: 'Finta al X + golpe al Y',
                  icon: <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />,
                },
                {
                  id: 'singles' as PlastronCallMode,
                  label: 'Números Simples',
                  desc: 'Un número directo',
                  icon: <Hash className="w-4 h-4 text-emerald-400" />,
                },
              ].map((m) => {
                const isSelected = plastronMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSetPlastronMode(m.id)}
                    className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-yellow-500/15 border-yellow-500 text-white shadow-xs'
                        : 'bg-black/60 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {m.icon}
                      <span className={`text-xs font-bold ${isSelected ? 'text-yellow-300' : 'text-zinc-200'}`}>
                        {m.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 leading-tight">{m.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Combinations Length Toggle (If mode uses combinations) */}
            {(plastronMode === 'combinations' || plastronMode === 'mixed') && (
              <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-xs">
                <span className="text-zinc-300 font-medium">Longitud de combinaciones:</span>
                <div className="flex items-center gap-1 bg-black p-1 rounded-xl border border-zinc-800">
                  <button
                    onClick={() => handleSetMaxNumbers(2)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                      combinationMax === 2 ? 'bg-zinc-800 text-yellow-300' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    2 números
                  </button>
                  <button
                    onClick={() => handleSetMaxNumbers(3)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                      combinationMax === 3 ? 'bg-zinc-800 text-yellow-300' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    2 o 3 números
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Numbers Input Card */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-blue-400" />
                Dianas / Números activos en plastron:
              </label>
              <span className="text-[11px] text-yellow-400 font-mono font-bold bg-yellow-950/60 px-2 py-0.5 rounded-md border border-yellow-800/40">
                {settings.numbersList.length} dianas
              </span>
            </div>

            <input
              type="text"
              value={customInputText}
              onChange={(e) => handleUpdateNumbersText(e.target.value)}
              placeholder="Ej: 1, 2, 3, 4"
              className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-base font-mono font-bold text-white tracking-wider focus:outline-none focus:border-yellow-500"
            />

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              <span className="text-[10px] text-zinc-400 font-bold uppercase mr-1">Rápidos:</span>
              {[
                { label: '1 - 3', nums: [1, 2, 3] },
                { label: '1 - 4', nums: [1, 2, 3, 4] },
                { label: '1 - 5', nums: [1, 2, 3, 4, 5] },
                { label: '1 - 6', nums: [1, 2, 3, 4, 5, 6] },
                { label: '1 - 8', nums: [1, 2, 3, 4, 5, 6, 7, 8] },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => handleApplyPreset(p.nums)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 border border-zinc-800 whitespace-nowrap active:scale-95 transition cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Plastron guide tip */}
            <p className="text-[11px] text-zinc-400 bg-black/60 p-2.5 rounded-xl border border-zinc-850 leading-relaxed">
              💡 <strong>Dianas en Plastron:</strong> Asigna cada número a un blanco de tu plastron o muñeco:<br />
              <span className="text-zinc-300">1 = Pecho alto · 2 = Flanco bajo · 3 = Máscara · 4 = Brazo avanzado</span>
            </p>
          </div>

          {/* Dual Slider for Plastron Rhythm (Min and Max) */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Ritmo y tiempo entre llamadas
                </span>
              </div>
              <span className="text-yellow-400 font-mono font-bold text-xs bg-yellow-950/80 px-2.5 py-1 rounded-lg border border-yellow-800/50">
                {minSec}s – {maxSec}s (Aleatorio)
              </span>
            </div>

            <p className="text-[11px] text-zinc-300">
              Cada llamada u orden se cantará a un intervalo aleatorio entre tu mínimo y máximo:
            </p>

            {/* Slider 1: Min Delay */}
            <div className="space-y-1.5 bg-black/70 p-2.5 rounded-xl border border-zinc-850">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-300 font-semibold">Tiempo MÍNIMO entre órdenes:</span>
                <span className="text-yellow-400 font-mono font-bold text-xs bg-yellow-950/60 px-2 py-0.5 rounded border border-yellow-800/40">
                  {minSec} s ({settings.minDelayMs} ms)
                </span>
              </div>
              <input
                type="range"
                min="400"
                max="3500"
                step="100"
                value={settings.minDelayMs}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const newMin = val;
                  const newMax = Math.max(newMin, settings.maxDelayMs);
                  onUpdateSettings({ ...settings, minDelayMs: newMin, maxDelayMs: newMax });
                }}
                className="w-full accent-yellow-400 bg-zinc-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Slider 2: Max Delay */}
            <div className="space-y-1.5 bg-black/70 p-2.5 rounded-xl border border-zinc-850">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-300 font-semibold">Tiempo MÁXIMO entre órdenes:</span>
                <span className="text-yellow-400 font-mono font-bold text-xs bg-yellow-950/60 px-2 py-0.5 rounded border border-yellow-800/40">
                  {maxSec} s ({settings.maxDelayMs} ms)
                </span>
              </div>
              <input
                type="range"
                min="600"
                max="5500"
                step="100"
                value={settings.maxDelayMs}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const newMax = val;
                  const newMin = Math.min(newMax, settings.minDelayMs);
                  onUpdateSettings({ ...settings, minDelayMs: newMin, maxDelayMs: newMax });
                }}
                className="w-full accent-yellow-400 bg-zinc-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Presets */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[
                { label: 'Rápido', min: 700, max: 1400, desc: '0.7 - 1.4s' },
                { label: 'Medio', min: 1200, max: 2400, desc: '1.2 - 2.4s' },
                { label: 'Pausado', min: 2200, max: 4000, desc: '2.2 - 4.0s' },
                { label: 'Variado', min: 800, max: 3500, desc: '0.8 - 3.5s' },
              ].map((p) => {
                const isSelected = settings.minDelayMs === p.min && settings.maxDelayMs === p.max;
                return (
                  <button
                    key={p.label}
                    onClick={() => onUpdateSettings({ ...settings, minDelayMs: p.min, maxDelayMs: p.max })}
                    className={`py-1.5 px-1 rounded-xl text-center border transition cursor-pointer ${
                      isSelected
                        ? 'bg-yellow-500 text-black font-black border-yellow-400 shadow-xs'
                        : 'bg-black/60 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-xs font-bold">{p.label}</div>
                    <div className="text-[9px] opacity-80">{p.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Action Display Stage */}
      <div className="flex-1 flex flex-col justify-center items-center my-2 relative">
        {reactionState === 'idle' && (
          <div className="w-full max-w-sm flex flex-col items-center text-center p-6 rounded-3xl bg-zinc-950 border border-zinc-900 shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-yellow-950 mb-4">
              <Zap className="w-10 h-10 text-black fill-current" />
            </div>

            <h3 className="text-xl font-black text-white tracking-tight mb-1">
              Entrenamiento de Plastron
            </h3>
            <p className="text-xs text-zinc-400 mb-6 max-w-xs leading-relaxed">
              El árbitro FIE cantará{' '}
              <strong className="text-yellow-400">
                {plastronMode === 'mixed' && 'dianas, combinaciones rápidas y fintas'}
                {plastronMode === 'combinations' && 'combinaciones rápidas de 2 o 3 números'}
                {plastronMode === 'feints' && 'fintas y tocados decisivos'}
                {plastronMode === 'singles' && 'números simples'}
              </strong>{' '}
              entre <strong>{minSec}s</strong> y <strong>{maxSec}s</strong>.
            </p>

            <button
              onClick={handleStart}
              className="w-full py-4 rounded-2xl font-black text-lg tracking-wide uppercase bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 active:scale-98 text-black shadow-xl shadow-yellow-950/60 flex items-center justify-center gap-3 transition cursor-pointer"
            >
              <Play className="w-6 h-6 fill-current" />
              ¡Comenzar Plastron!
            </button>
          </div>
        )}

        {reactionState === 'countdown' && (
          <div className="w-full max-w-sm flex flex-col items-center justify-center py-12 rounded-3xl bg-zinc-950 border border-yellow-500/30 shadow-2xl animate-pulse text-center">
            <span className="text-xs font-bold text-yellow-400 tracking-widest uppercase mb-2">
              ¡Preparado!
            </span>
            <div className="text-8xl font-black text-white font-mono tracking-tighter my-4 drop-shadow-[0_0_35px_rgba(234,179,8,0.6)]">
              {countdown}
            </div>
            <p className="text-sm font-semibold text-zinc-300">
              Atento a la llamada del plastron
            </p>
          </div>
        )}

        {(reactionState === 'running' || reactionState === 'paused') && (
          <div
            onClick={() => (reactionState === 'paused' ? handleResume() : handlePause())}
            className={`w-full rounded-3xl bg-gradient-to-b from-zinc-950 via-black to-zinc-950 border-2 p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-200 min-h-[330px] shadow-2xl cursor-pointer select-none ${
              reactionState === 'paused'
                ? 'border-amber-500/80 shadow-amber-950/60'
                : 'border-yellow-500/60 shadow-yellow-950/40'
            }`}
          >
            {/* Tap to Pause / Resume Hint */}
            <div className="absolute top-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 bg-black/80 px-3 py-1 rounded-full border border-zinc-800">
              {reactionState === 'paused' ? '⏸️ En pausa — Toca para reanudar' : 'Toca la tarjeta para pausar'}
            </div>

            {/* Signal Tag */}
            {currentSignal && (
              <div className="text-xs font-extrabold uppercase tracking-widest text-yellow-400 mb-2 mt-4">
                {currentSignal.tag}
              </div>
            )}

            {/* Stage Visual */}
            <div className="my-auto flex flex-col items-center justify-center w-full">
              {!currentSignal && (
                <div className="text-2xl font-bold text-zinc-400">Escuchando al árbitro...</div>
              )}

              {/* 1. Single target visual */}
              {currentSignal && currentSignal.type === 'single' && (
                <div className="flex flex-col items-center">
                  <div className="text-9xl sm:text-[11rem] font-black font-mono tracking-tighter text-yellow-400 drop-shadow-[0_0_45px_rgba(234,179,8,0.7)] leading-none">
                    {currentSignal.numbers[0]}
                  </div>
                  <span className="text-2xl font-black text-white mt-3 tracking-wide">
                    {currentSignal.spokenText}
                  </span>
                </div>
              )}

              {/* 2. Combination sequence visual (2 or 3 rapid lunges) */}
              {currentSignal && currentSignal.type === 'combination' && (
                <div className="flex flex-col items-center w-full">
                  <div className="flex items-center justify-center gap-2 sm:gap-4 my-2 flex-wrap">
                    {currentSignal.numbers.map((num, idx) => (
                      <React.Fragment key={idx}>
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-zinc-900 border-2 border-yellow-400/80 flex items-center justify-center text-4xl sm:text-5xl font-black font-mono text-yellow-400 shadow-xl shadow-yellow-950/50">
                          {num}
                        </div>
                        {idx < currentSignal.numbers.length - 1 && (
                          <ArrowRight className="w-6 h-6 text-yellow-400/80 animate-pulse" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <span className="text-2xl font-black text-white mt-3 tracking-wide">
                    {currentSignal.spokenText}
                  </span>
                  <span className="text-xs text-yellow-400 font-semibold mt-1 uppercase tracking-wider">
                    Estocadas rápidas consecutivas
                  </span>
                </div>
              )}

              {/* 3. Feint + Strike visual */}
              {currentSignal && currentSignal.type === 'feint' && (
                <div className="flex flex-col items-center w-full">
                  <div className="flex items-center justify-center gap-3 my-2 flex-wrap">
                    {/* Feint badge */}
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider mb-1">
                        1º Finta
                      </span>
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-amber-950/70 border-2 border-dashed border-amber-400 flex items-center justify-center text-3xl sm:text-4xl font-black font-mono text-amber-300 shadow-lg">
                        {currentSignal.feintTarget}
                      </div>
                    </div>

                    <ArrowRight className="w-6 h-6 text-amber-400 animate-pulse mt-4" />

                    {/* Final strike badge */}
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider mb-1">
                        2º Tocado
                      </span>
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-emerald-950/70 border-2 border-emerald-400 flex items-center justify-center text-3xl sm:text-4xl font-black font-mono text-emerald-300 shadow-xl shadow-emerald-950">
                        {currentSignal.hitTarget}
                      </div>
                    </div>
                  </div>

                  <span className="text-2xl font-black text-white mt-3 tracking-wide">
                    {currentSignal.spokenText}
                  </span>
                  <span className="text-xs text-amber-300 font-semibold mt-1 uppercase tracking-wider">
                    {currentSignal.feintTarget === currentSignal.hitTarget
                      ? 'Finta y tocado decisivo en la misma diana'
                      : 'Engaña en el primer blanco y toca en el segundo'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Metrics Row (When running or paused) */}
      {(reactionState === 'running' || reactionState === 'paused') && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-zinc-400 block font-medium">Tiempo</span>
            <span className="text-base font-black font-mono text-white tracking-tight">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-zinc-400 block font-medium">Órdenes / Toques</span>
            <span className="text-base font-black font-mono text-yellow-400 tracking-tight">
              {reactionsCount}
            </span>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-zinc-400 block font-medium">Ritmo Aleatorio</span>
            <span className="text-sm font-black font-mono text-emerald-400 tracking-tight">
              {minSec}s - {maxSec}s
            </span>
          </div>
        </div>
      )}

      {/* Control Buttons: PAUSE & STOP */}
      {(reactionState === 'running' || reactionState === 'paused') && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          {reactionState === 'paused' ? (
            <button
              onClick={handleResume}
              className="py-4 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/50 transition cursor-pointer"
            >
              <Play className="w-6 h-6 fill-current" />
              Reanudar
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="py-4 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-950/50 transition cursor-pointer"
            >
              <Pause className="w-6 h-6 fill-current" />
              Pausar
            </button>
          )}

          <button
            onClick={handleStop}
            className="py-4 px-4 rounded-2xl bg-rose-600/90 hover:bg-rose-500 active:scale-98 text-white font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-rose-950/50 transition cursor-pointer"
          >
            <Square className="w-6 h-6 fill-current" />
            Finalizar
          </button>
        </div>
      )}
    </div>
  );
};
