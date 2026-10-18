import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  Square,
  ArrowRight,
  ArrowLeft,
  Crosshair,
  Shield,
  Zap,
  Sparkles,
  Flame,
  AlertTriangle,
  Clock,
  Coffee,
  RotateCcw,
} from 'lucide-react';
import { FootworkAction, WorkoutSettings, VirtualCoachSettings, WorkoutStats } from '../types/fencing';
import { FootworkEngine } from '../services/footworkGenerator';
import { soundEngine } from '../services/soundEngine';
import { speechEngine } from '../services/speechEngine';
import { StripPositionBar } from './StripPositionBar';

interface WorkoutViewProps {
  actions: FootworkAction[];
  settings: WorkoutSettings;
  coach: VirtualCoachSettings;
  onFinishWorkout: (stats: WorkoutStats) => void;
  onGoToActions: () => void;
  onGoToSettings: () => void;
  soundEnabled: boolean;
  onUpdateSettings?: (newSettings: WorkoutSettings) => void;
}

type WorkoutState = 'idle' | 'countdown' | 'running' | 'paused' | 'holding_lunge' | 'recovering' | 'bout_rest';

export const WorkoutView: React.FC<WorkoutViewProps> = ({
  actions,
  settings,
  coach,
  onFinishWorkout,
  onGoToActions,
  onGoToSettings,
  soundEnabled,
  onUpdateSettings,
}) => {
  const [workoutState, setWorkoutState] = useState<WorkoutState>('idle');
  const [countdown, setCountdown] = useState<number>(settings.countdownSeconds || 3);
  const [currentAction, setCurrentAction] = useState<FootworkAction | null>(null);
  const [lastDistanceDelta, setLastDistanceDelta] = useState<number>(0);
  const [currentPositionCm, setCurrentPositionCm] = useState<number>(Math.round(settings.workoutSpaceMeters * 50));
  const [activeCoachTip, setActiveCoachTip] = useState<string | null>(null);
  const [actionCount, setActionCount] = useState<number>(0);
  const [lungeCount, setLungeCount] = useState<number>(0);
  const [totalDistanceMeters, setTotalDistanceMeters] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [actionHistoryStats, setActionHistoryStats] = useState<Record<string, number>>({});

  // Asalto Mode State (Official 3 min bout + 1 min rest)
  const isBoutMode = settings.boutModeEnabled ?? false;
  const totalBoutPeriods = settings.boutPeriods || 3;
  const [currentPeriod, setCurrentPeriod] = useState<number>(1);
  const [boutPeriodSecondsRemaining, setBoutPeriodSecondsRemaining] = useState<number>(180);
  const [boutRestSecondsRemaining, setBoutRestSecondsRemaining] = useState<number>(60);

  const engineRef = useRef<FootworkEngine | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const actionExecutionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lungeHoldTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const actionIndexRef = useRef<number>(0);

  const clearAllTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (actionExecutionTimerRef.current) clearTimeout(actionExecutionTimerRef.current);
    if (lungeHoldTimerRef.current) clearTimeout(lungeHoldTimerRef.current);
    if (recoverTimerRef.current) clearTimeout(recoverTimerRef.current);
    speechEngine.stop();
  }, []);

  // Initialize engine
  useEffect(() => {
    engineRef.current = new FootworkEngine(settings.workoutSpaceMeters);
    setCurrentPositionCm(engineRef.current.getPositionCm());
  }, [settings.workoutSpaceMeters]);

  // Overall session elapsed timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (
      workoutState === 'running' ||
      workoutState === 'holding_lunge' ||
      workoutState === 'recovering' ||
      workoutState === 'bout_rest'
    ) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [workoutState]);

  // Clean all timers on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // Validation
  const validation = engineRef.current ? engineRef.current.validateActions(actions) : { valid: true };

  // Official FIE referee voice only, 100% volume, no beeps
  const triggerAudio = useCallback(
    (action: FootworkAction, isRecover: boolean = false) => {
      if (!soundEnabled) return;

      if (isRecover) {
        speechEngine.speak('¡A la guardia!', settings.speechRate, 0.92, 1.0);
        return;
      }

      speechEngine.speak(action.voiceText, settings.speechRate, 0.92, 1.0);
    },
    [soundEnabled, settings.speechRate]
  );

  // Speak coach tip
  const triggerCoachTip = useCallback(
    (tip: string) => {
      setActiveCoachTip(tip);
      if (soundEnabled) {
        setTimeout(() => {
          speechEngine.speak(tip, settings.speechRate * 0.95, 0.92, 1.0);
        }, 800);
      }
      setTimeout(() => {
        setActiveCoachTip((prev) => (prev === tip ? null : prev));
      }, 4500);
    },
    [soundEnabled, settings.speechRate]
  );

  // Step scheduling logic with generous time for multi-step actions and lunges
  const scheduleNextStep = useCallback(() => {
    if (!engineRef.current) return;

    actionIndexRef.current += 1;
    const plan = engineRef.current.getNextAction(
      actions,
      settings,
      coach,
      actionIndexRef.current
    );

    if (!plan) return;

    timerRef.current = setTimeout(() => {
      setCurrentAction(plan.action);
      setLastDistanceDelta(plan.action.distanceCm);
      setCurrentPositionCm(plan.newPositionCm);
      setActionCount((prev) => prev + 1);
      setTotalDistanceMeters((prev) => prev + Math.abs(plan.action.distanceCm) / 100);

      // Track action stats
      setActionHistoryStats((prev) => ({
        ...prev,
        [plan.action.displayName]: (prev[plan.action.displayName] || 0) + 1,
      }));

      // Trigger referee voice
      triggerAudio(plan.action);

      // Check coach advice
      if (plan.coachAdvice) {
        triggerCoachTip(plan.coachAdvice);
      }

      // Check if multi-step action
      const isMultiStep =
        plan.action.category === 'combination' ||
        plan.action.displayName.includes(',') ||
        plan.action.displayName.toLowerCase().includes('doble') ||
        plan.action.displayName.toLowerCase().includes('tres') ||
        plan.action.displayName.toLowerCase().includes('paso');

      const extraBuffer = isMultiStep ? (settings.multiStepBufferMs ?? 1200) : 0;
      const baseExecutionTime = Math.max(900, plan.action.timeToPerformMs) + extraBuffer;

      // Check if lunge with recovery phase
      if (plan.action.isLunge) {
        setLungeCount((prev) => prev + 1);

        const approachStepsTime = isMultiStep ? Math.max(1200, baseExecutionTime - 1200) : 500;

        actionExecutionTimerRef.current = setTimeout(() => {
          setWorkoutState('holding_lunge');
          const holdTime = plan.lungeHoldDurationMs || (settings.lungeHoldTimeMs ?? 2200);

          lungeHoldTimerRef.current = setTimeout(() => {
            if (settings.playRecoverSound) {
              triggerAudio(plan.action, true);
            }
            setWorkoutState('recovering');

            const recoverDuration = settings.recoveryTimeMs ?? 1800;
            recoverTimerRef.current = setTimeout(() => {
              setWorkoutState('running');
              scheduleNextStep();
            }, recoverDuration);
          }, holdTime);
        }, approachStepsTime);
      } else {
        setWorkoutState('running');
        actionExecutionTimerRef.current = setTimeout(() => {
          scheduleNextStep();
        }, baseExecutionTime);
      }
    }, plan.delayBeforeActionMs);
  }, [actions, settings, coach, triggerAudio, triggerCoachTip]);

  // Handle bout countdowns (3 min bout & 1 min rest)
  useEffect(() => {
    if (!isBoutMode) return;

    let interval: NodeJS.Timeout | null = null;

    // During active fighting
    if (workoutState === 'running' || workoutState === 'holding_lunge' || workoutState === 'recovering') {
      interval = setInterval(() => {
        setBoutPeriodSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Period expired!
            clearAllTimers();

            if (currentPeriod < totalBoutPeriods) {
              // Rest period begins
              if (soundEnabled) {
                speechEngine.speak('¡Alto! Minuto de descanso.', settings.speechRate, 0.92, 1.0);
              }
              setWorkoutState('bout_rest');
              setBoutRestSecondsRemaining(60);
              return 180;
            } else {
              // Bout completed!
              if (soundEnabled) {
                speechEngine.speak('¡Alto! ¡Asalto terminado!', settings.speechRate, 0.92, 1.0);
              }
              setTimeout(() => {
                handleStop();
              }, 1200);
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    // During 1-minute rest phase
    if (workoutState === 'bout_rest') {
      interval = setInterval(() => {
        setBoutRestSecondsRemaining((prev) => {
          if (prev === 11 && soundEnabled) {
            // 10s warning
            speechEngine.speak('¡A la pista! Prepararse.', settings.speechRate, 0.92, 1.0);
          }

          if (prev <= 1) {
            // Rest ended, resume next period!
            setCurrentPeriod((p) => p + 1);
            setBoutPeriodSecondsRemaining(180);
            if (soundEnabled) {
              speechEngine.speak('¡En guardia!', settings.speechRate, 0.92, 1.0);
            }
            setWorkoutState('running');
            scheduleNextStep();
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    isBoutMode,
    workoutState,
    currentPeriod,
    totalBoutPeriods,
    soundEnabled,
    settings.speechRate,
    clearAllTimers,
    scheduleNextStep,
  ]);

  // Skip rest button
  const handleSkipRest = () => {
    if (workoutState !== 'bout_rest') return;
    setCurrentPeriod((p) => p + 1);
    setBoutPeriodSecondsRemaining(180);
    setBoutRestSecondsRemaining(60);
    if (soundEnabled) {
      speechEngine.speak('¡En guardia!', settings.speechRate, 0.92, 1.0);
    }
    setWorkoutState('running');
    scheduleNextStep();
  };

  // Start workout flow
  const handleStart = () => {
    if (!validation.valid) return;
    soundEngine.unlockAudio();
    setWorkoutState('countdown');
    setCurrentPeriod(1);
    setBoutPeriodSecondsRemaining(180);
    setBoutRestSecondsRemaining(60);

    let count = settings.countdownSeconds || 3;
    setCountdown(count);

    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        if (soundEnabled) {
          speechEngine.speak('¡En guardia!', settings.speechRate, 0.92, 1.0);
        }
        setWorkoutState('running');
        scheduleNextStep();
      }
    }, 1000);
  };

  const handlePause = () => {
    clearAllTimers();
    setWorkoutState('paused');
  };

  const handleResume = () => {
    setWorkoutState('running');
    scheduleNextStep();
  };

  const handleStop = () => {
    clearAllTimers();

    onFinishWorkout({
      totalActions: actionCount,
      totalTimeSeconds: elapsedSeconds,
      totalDistanceMeters: Math.round(totalDistanceMeters * 10) / 10,
      actionsBreakdown: actionHistoryStats,
      lungesCount: lungeCount,
    });

    setWorkoutState('idle');
    setCurrentAction(null);
    setActionCount(0);
    setLungeCount(0);
    setElapsedSeconds(0);
    setTotalDistanceMeters(0);
    setActionHistoryStats({});
    actionIndexRef.current = 0;
    setCurrentPeriod(1);
    setBoutPeriodSecondsRemaining(180);
    setBoutRestSecondsRemaining(60);

    if (engineRef.current) {
      engineRef.current.resetPosition();
      setCurrentPositionCm(engineRef.current.getPositionCm());
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Helper for action styling and icons
  const getActionTheme = (action: FootworkAction | null) => {
    if (!action) {
      return {
        bg: 'from-blue-900/60 to-slate-900',
        border: 'border-blue-500/40',
        text: 'text-blue-400',
        icon: <Shield className="w-16 h-16 text-blue-400" />,
        directionText: 'En Guardia',
      };
    }

    if (action.isLunge || action.category === 'lunge') {
      return {
        bg: 'from-rose-950 via-red-900/70 to-slate-950',
        border: 'border-rose-500 shadow-rose-950/50 shadow-2xl animate-pulse',
        text: 'text-rose-400',
        icon: <Crosshair className="w-20 h-20 text-rose-400 transform scale-110" />,
        directionText: '¡Ataque / Fondo!',
      };
    }

    if (action.category === 'advance' || action.distanceCm > 0) {
      return {
        bg: 'from-emerald-950 via-teal-900/60 to-slate-950',
        border: 'border-emerald-500/80 shadow-emerald-950/40 shadow-xl',
        text: 'text-emerald-400',
        icon: <ArrowRight className="w-20 h-20 text-emerald-400 transform translate-x-1" />,
        directionText: 'Hacia adelante',
      };
    }

    if (action.category === 'retreat' || action.distanceCm < 0) {
      return {
        bg: 'from-amber-950 via-orange-950/70 to-slate-950',
        border: 'border-amber-500/80 shadow-amber-950/40 shadow-xl',
        text: 'text-amber-400',
        icon: <ArrowLeft className="w-20 h-20 text-amber-400 transform -translate-x-1" />,
        directionText: 'Hacia atrás',
      };
    }

    return {
      bg: 'from-indigo-950 via-purple-950/60 to-slate-950',
      border: 'border-purple-500/80 shadow-purple-950/40 shadow-xl',
      text: 'text-purple-400',
      icon: <Zap className="w-20 h-20 text-purple-400" />,
      directionText: 'Combinación',
    };
  };

  const theme = getActionTheme(currentAction);

  return (
    <div className="flex flex-col min-h-[calc(100vh-8.5rem)] justify-between pb-4">
      {/* Top Strip Position Bar */}
      <div className="pt-2">
        <StripPositionBar
          currentPositionCm={currentPositionCm}
          totalSpaceCm={Math.round(settings.workoutSpaceMeters * 100)}
          lastDistanceDelta={lastDistanceDelta}
        />
      </div>

      {/* Validation Warning if invalid actions */}
      {!validation.valid && (
        <div className="my-3 p-4 rounded-2xl bg-rose-950/80 border border-rose-600/80 text-rose-200 text-sm flex items-start gap-3 shadow-lg">
          <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{validation.error}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={onGoToActions}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
              >
                Configurar Acciones
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bout Mode Live Header (When running in Asalto mode) */}
      {isBoutMode &&
        (workoutState === 'running' ||
          workoutState === 'holding_lunge' ||
          workoutState === 'recovering' ||
          workoutState === 'paused') && (
          <div className="my-2 p-3 rounded-2xl bg-gradient-to-r from-blue-950/90 via-zinc-900 to-indigo-950/90 border border-blue-500/50 shadow-lg text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-lg bg-blue-500 text-white shadow-xs">
                Periodo {currentPeriod} / {totalBoutPeriods}
              </span>
              <span className="text-xs text-zinc-300 font-semibold hidden sm:inline">
                Asalto Oficial FIE
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-xl font-black font-mono text-emerald-400 tracking-tight">
                {formatTime(boutPeriodSecondsRemaining)}
              </span>
            </div>
          </div>
        )}

      {/* Coach Tip Live Banner */}
      {activeCoachTip && workoutState !== 'bout_rest' && (
        <div className="my-2 p-3 rounded-2xl bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-purple-900/90 border border-blue-400/50 shadow-lg text-white flex items-center gap-3 animate-bounce">
          <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </div>
          <div className="flex-1 text-xs sm:text-sm font-semibold">
            <span className="text-blue-300 uppercase tracking-wider text-[10px] block font-bold">
              Consejo del Entrenador
            </span>
            {activeCoachTip}
          </div>
        </div>
      )}

      {/* Main Interactive Stage */}
      <div className="flex-1 flex flex-col justify-center items-center my-3 relative">
        {workoutState === 'idle' && (
          <div className="w-full max-w-sm flex flex-col items-center text-center p-6 rounded-3xl bg-zinc-950 border border-zinc-900 shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-950 mb-1">
              <Play className="w-8 h-8 text-black fill-current" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white tracking-tight mb-1">
                Movimientos de pie
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Pista: <strong className="text-zinc-200">{settings.workoutSpaceMeters}m</strong> · Ritmo:{' '}
                <strong className="text-emerald-400">
                  {(settings.minDelayMs / 1000).toFixed(1)}s - {(settings.maxDelayMs / 1000).toFixed(1)}s
                </strong>
              </p>
            </div>

            {/* FIE Bout Mode Selector Toggle */}
            <div className="w-full bg-black/80 border border-zinc-850 rounded-2xl p-3 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  Formato de asalto:
                </span>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    isBoutMode
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {isBoutMode ? 'Modo Asalto FIE' : 'Continuo Libre'}
                </span>
              </div>

              {/* Toggle Buttons: Continuo vs Asalto */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => onUpdateSettings && onUpdateSettings({ ...settings, boutModeEnabled: false })}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    !isBoutMode
                      ? 'bg-zinc-800 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Continuo Libre
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings && onUpdateSettings({ ...settings, boutModeEnabled: true })}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                    isBoutMode
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>Asalto FIE</span>
                  <span className="text-[10px] opacity-80">(3m + 1m)</span>
                </button>
              </div>

              {/* If Bout Mode is active, allow picking number of periods */}
              {isBoutMode && (
                <div className="pt-2 border-t border-zinc-850/80 space-y-1.5">
                  <span className="text-[11px] text-zinc-300 block font-semibold">
                    Número de periodos (3 min por periodo):
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { periods: 1, label: '1 Periodo', sub: '3 min' },
                      { periods: 2, label: '2 Periodos', sub: '6 min' },
                      { periods: 3, label: '3 Periodos', sub: 'Oficial FIE' },
                    ].map((p) => {
                      const isSelected = totalBoutPeriods === p.periods;
                      return (
                        <button
                          key={p.periods}
                          type="button"
                          onClick={() =>
                            onUpdateSettings && onUpdateSettings({ ...settings, boutPeriods: p.periods })
                          }
                          className={`py-1.5 px-1 rounded-xl text-center border transition cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600/30 text-blue-300 border-blue-500 font-bold'
                              : 'bg-black/40 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                          }`}
                        >
                          <div className="text-xs">{p.label}</div>
                          <div className="text-[9px] opacity-75">{p.sub}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleStart}
              disabled={!validation.valid}
              className={`w-full py-4 rounded-2xl font-black text-lg tracking-wide uppercase transition-all duration-200 shadow-xl flex items-center justify-center gap-3 ${
                validation.valid
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 active:scale-98 text-black font-black shadow-emerald-950 cursor-pointer'
                  : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
              }`}
            >
              <Play className="w-6 h-6 fill-current" />
              {isBoutMode ? '¡Comenzar Asalto FIE!' : '¡Comenzar Entrenamiento!'}
            </button>

            <div className="flex items-center justify-center gap-4 text-xs text-zinc-400">
              <button
                onClick={onGoToActions}
                className="hover:text-emerald-400 underline decoration-zinc-700 underline-offset-4 cursor-pointer"
              >
                Ajustar acciones
              </button>
              <span>·</span>
              <button
                onClick={onGoToSettings}
                className="hover:text-emerald-400 underline decoration-zinc-700 underline-offset-4 cursor-pointer"
              >
                Cambiar espacio ({settings.workoutSpaceMeters}m)
              </button>
            </div>
          </div>
        )}

        {workoutState === 'countdown' && (
          <div className="w-full max-w-sm flex flex-col items-center justify-center py-12 rounded-3xl bg-zinc-950 border border-emerald-500/30 shadow-2xl animate-pulse">
            <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase mb-2">
              ¡Ponte en guardia!
            </span>
            <div className="text-8xl font-black text-white font-mono tracking-tighter my-4 drop-shadow-[0_0_35px_rgba(16,185,129,0.6)]">
              {countdown}
            </div>
            <p className="text-sm font-semibold text-zinc-300">
              {isBoutMode ? `Periodo 1 de ${totalBoutPeriods}` : 'Empieza en el centro de tu espacio'}
            </p>
          </div>
        )}

        {/* 1-Minute Official Bout Rest Screen */}
        {workoutState === 'bout_rest' && (
          <div className="w-full max-w-sm flex flex-col items-center text-center p-8 rounded-3xl bg-zinc-950 border-2 border-amber-500/80 shadow-2xl shadow-amber-950/60 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 mb-3 shadow-lg">
              <Coffee className="w-8 h-8" />
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-amber-400 mb-1">
              Descanso oficial entre periodos ({currentPeriod} de {totalBoutPeriods})
            </span>

            <div className="text-7xl font-black font-mono text-white tracking-tighter my-2 drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]">
              {formatTime(boutRestSecondsRemaining)}
            </div>

            <p className="text-xs text-zinc-300 max-w-xs leading-relaxed mb-6">
              Respira hondo, hidrátate y prepara la estrategia para el siguiente periodo. El árbitro avisará a los 10 segundos.
            </p>

            <button
              onClick={handleSkipRest}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-950/60 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Saltar descanso y continuar
            </button>
          </div>
        )}

        {(workoutState === 'running' ||
          workoutState === 'holding_lunge' ||
          workoutState === 'recovering' ||
          workoutState === 'paused') && (
          <div
            onClick={() => (workoutState === 'paused' ? handleResume() : handlePause())}
            className={`w-full rounded-3xl bg-gradient-to-b ${theme.bg} border-2 ${theme.border} p-6 flex flex-col items-center justify-between text-center relative overflow-hidden transition-all duration-300 min-h-[300px] shadow-2xl cursor-pointer select-none`}
            title="Toca para pausar o reanudar"
          >
            {/* Lunge holding badge indicator */}
            {workoutState === 'holding_lunge' && (
              <div className="absolute top-3 bg-rose-500 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider animate-bounce shadow-md">
                ¡Mantén el Fondo!
              </div>
            )}
            {workoutState === 'recovering' && (
              <div className="absolute top-3 bg-blue-500 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider animate-pulse shadow-md">
                ¡Recupera a la Guardia!
              </div>
            )}
            {workoutState === 'paused' && (
              <div className="absolute top-3 bg-amber-500 text-slate-950 font-black text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1.5 animate-pulse">
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pausado — Toca para continuar</span>
              </div>
            )}
            {workoutState === 'running' && (
              <div className="absolute top-3 text-[10px] font-bold uppercase tracking-wider text-slate-400/80 bg-slate-950/60 px-3 py-1 rounded-full border border-slate-800/80 flex items-center gap-1">
                <span>Toca para pausar</span>
              </div>
            )}

            {/* Direction Subtitle */}
            <div className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mt-2">
              {theme.directionText}
            </div>

            {/* Giant Central Icon */}
            <div className="my-3 drop-shadow-md">{theme.icon}</div>

            {/* Action Big Title */}
            <div className="w-full">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none drop-shadow-md">
                {currentAction ? currentAction.displayName : 'En guardia'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium max-w-xs mx-auto">
                {currentAction?.description || 'Mantén la posición base y prepárate'}
              </p>
            </div>

            {/* Distance badge */}
            {currentAction && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-lg bg-black/80 border border-zinc-800 font-mono font-bold text-zinc-200">
                  {currentAction.distanceCm > 0
                    ? `+${currentAction.distanceCm} cm`
                    : `${currentAction.distanceCm} cm`}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-black/80 border border-zinc-800 font-mono text-zinc-400">
                  {currentAction.timeToPerformMs} ms
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Workout Metrics Bar (Visible when active or paused) */}
      {(workoutState === 'running' ||
        workoutState === 'holding_lunge' ||
        workoutState === 'recovering' ||
        workoutState === 'paused' ||
        workoutState === 'bout_rest') && (
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-zinc-400 block font-medium">
              {isBoutMode ? 'Tiempo Total' : 'Tiempo'}
            </span>
            <span className="text-base font-black font-mono text-white tracking-tight">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-zinc-400 block font-medium">Acciones</span>
            <span className="text-base font-black font-mono text-blue-400 tracking-tight">
              {actionCount}
            </span>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-zinc-400 block font-medium">Fondos</span>
            <span className="text-base font-black font-mono text-rose-400 tracking-tight flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              {lungeCount}
            </span>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-zinc-400 block font-medium">Distancia</span>
            <span className="text-base font-black font-mono text-emerald-400 tracking-tight">
              {totalDistanceMeters.toFixed(1)}m
            </span>
          </div>
        </div>
      )}

      {/* Control Buttons (Large touch targets for mobile) */}
      {(workoutState === 'running' ||
        workoutState === 'holding_lunge' ||
        workoutState === 'recovering' ||
        workoutState === 'paused' ||
        workoutState === 'bout_rest') && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          {workoutState === 'paused' ? (
            <button
              onClick={handleResume}
              className="py-4 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-950/50 transition cursor-pointer"
            >
              <Play className="w-6 h-6 fill-current" />
              Reanudar
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="py-4 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black text-base flex items-center justify-center gap-2.5 shadow-xl shadow-amber-950/50 transition cursor-pointer"
            >
              <Pause className="w-6 h-6 fill-current" />
              Pausar
            </button>
          )}

          <button
            onClick={handleStop}
            className="py-4 px-4 rounded-2xl bg-rose-600/90 hover:bg-rose-500 active:scale-98 text-white font-black text-base flex items-center justify-center gap-2.5 shadow-xl shadow-rose-950/50 transition cursor-pointer"
          >
            <Square className="w-6 h-6 fill-current" />
            Finalizar Sesión
          </button>
        </div>
      )}
    </div>
  );
};
