import React from 'react';
import { WorkoutSettings } from '../types/fencing';
import {
  Settings,
  Ruler,
  Clock,
  Volume2,
  Swords,
  RotateCcw,
  Smartphone,
  Eye,
  Shield,
} from 'lucide-react';
import { speechEngine } from '../services/speechEngine';
import { soundEngine } from '../services/soundEngine';

interface SettingsViewProps {
  settings: WorkoutSettings;
  onUpdateSettings: (newSettings: WorkoutSettings) => void;
  onRestoreDefaults: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onRestoreDefaults,
}) => {
  const update = <K extends keyof WorkoutSettings>(key: K, val: WorkoutSettings[K]) => {
    onUpdateSettings({ ...settings, [key]: val });
  };

  const handleSpacePreset = (meters: number) => {
    update('workoutSpaceMeters', meters);
  };

  const testVoice = () => {
    soundEngine.unlockAudio();
    speechEngine.testRefereeVoice(settings.speechRate);
  };

  const minDelaySec = (settings.minDelayMs / 1000).toFixed(1);
  const maxDelaySec = (settings.maxDelayMs / 1000).toFixed(1);

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center bg-zinc-950 p-3.5 rounded-2xl border border-zinc-900">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-rose-400 fill-rose-400" />
            Ajustes de Movimientos de pie
          </h2>
          <p className="text-xs text-zinc-400">Pista, Modo Asalto FIE, ritmo aleatorio y voz de árbitro</p>
        </div>
        <button
          onClick={onRestoreDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-xs text-zinc-300 font-semibold border border-zinc-800 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restablecer
        </button>
      </div>

      {/* Modo Asalto Oficial FIE */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white">Modo Asalto Oficial FIE</span>
          </div>
          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
              settings.boutModeEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {settings.boutModeEnabled ? 'Activo (3m + 1m)' : 'Libre'}
          </span>
        </div>

        <label className="flex items-center justify-between p-3 rounded-xl bg-black/60 border border-zinc-850 cursor-pointer">
          <div>
            <span className="text-xs font-bold text-zinc-200 block">Formato reglamentario de asalto</span>
            <span className="text-[11px] text-zinc-400">
              3 minutos de combate continuo + 1 minuto de descanso entre periodos
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.boutModeEnabled ?? false}
            onChange={(e) => update('boutModeEnabled', e.target.checked)}
            className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
          />
        </label>

        {settings.boutModeEnabled && (
          <div className="pt-2 border-t border-zinc-850 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-300 font-semibold">Número de periodos:</span>
              <span className="text-emerald-400 font-mono font-bold">
                {settings.boutPeriods || 3} periodos ({((settings.boutPeriods || 3) * 3)} min)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { periods: 1, label: '1 Periodo', desc: '3 min (Poule)' },
                { periods: 2, label: '2 Periodos', desc: '6 min' },
                { periods: 3, label: '3 Periodos', desc: '9 min (Oficial FIE)' },
              ].map((p) => (
                <button
                  key={p.periods}
                  type="button"
                  onClick={() => update('boutPeriods', p.periods)}
                  className={`py-2 px-1 rounded-xl text-center border transition cursor-pointer ${
                    (settings.boutPeriods || 3) === p.periods
                      ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500 font-bold shadow-xs'
                      : 'bg-black/40 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  <div className="text-xs">{p.label}</div>
                  <div className="text-[9px] opacity-80">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 1. Workout Space */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white">Espacio de entrenamiento</span>
          </div>
          <span className="text-emerald-400 font-mono font-bold text-base bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-800/50">
            {settings.workoutSpaceMeters.toFixed(1)} metros
          </span>
        </div>

        <input
          type="range"
          min="2.0"
          max="14.0"
          step="0.5"
          value={settings.workoutSpaceMeters}
          onChange={(e) => update('workoutSpaceMeters', parseFloat(e.target.value))}
          className="w-full accent-emerald-500 bg-zinc-800 rounded-lg cursor-pointer h-2.5"
        />

        {/* Presets */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {[
            { label: '3m Habitación', val: 3 },
            { label: '5m Salón', val: 5 },
            { label: '8m Garaje/Sala', val: 8 },
            { label: '14m Pista FIE', val: 14 },
          ].map((p) => (
            <button
              key={p.val}
              onClick={() => handleSpacePreset(p.val)}
              className={`py-1.5 px-1 rounded-xl text-[10px] font-bold text-center border transition cursor-pointer ${
                Math.abs(settings.workoutSpaceMeters - p.val) < 0.1
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                  : 'bg-black/60 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Rhythm and Time Between Actions (Dual Slider: Min and Max) */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-white">Ritmo y tiempo entre acciones</span>
          </div>
          <span className="text-blue-400 font-mono font-bold text-xs bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-800/50">
            {minDelaySec}s – {maxDelaySec}s (Aleatorio)
          </span>
        </div>

        <p className="text-[11px] text-zinc-300 leading-relaxed">
          En cada orden, el tiempo de pausa será un <strong>número aleatorio</strong> comprendido entre el valor mínimo y máximo que fijes en los deslizadores:
        </p>

        {/* Slider 1: Min Delay */}
        <div className="space-y-1.5 bg-black/70 p-3 rounded-xl border border-zinc-850">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-300 font-semibold">Tiempo MÍNIMO entre órdenes:</span>
            <span className="text-blue-400 font-mono font-bold text-sm bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
              {minDelaySec} s ({settings.minDelayMs} ms)
            </span>
          </div>
          <input
            type="range"
            min="400"
            max="4000"
            step="100"
            value={settings.minDelayMs}
            onChange={(e) => {
              const val = Number(e.target.value);
              const newMin = val;
              const newMax = Math.max(newMin, settings.maxDelayMs);
              onUpdateSettings({ ...settings, minDelayMs: newMin, maxDelayMs: newMax });
            }}
            className="w-full accent-blue-500 bg-zinc-800 rounded-lg cursor-pointer h-2.5"
          />
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>0.4s (Muy rápido)</span>
            <span>2.0s</span>
            <span>4.0s (Pausado)</span>
          </div>
        </div>

        {/* Slider 2: Max Delay */}
        <div className="space-y-1.5 bg-black/70 p-3 rounded-xl border border-zinc-850">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-300 font-semibold">Tiempo MÁXIMO entre órdenes:</span>
            <span className="text-blue-400 font-mono font-bold text-sm bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
              {maxDelaySec} s ({settings.maxDelayMs} ms)
            </span>
          </div>
          <input
            type="range"
            min="600"
            max="6000"
            step="100"
            value={settings.maxDelayMs}
            onChange={(e) => {
              const val = Number(e.target.value);
              const newMax = val;
              const newMin = Math.min(newMax, settings.minDelayMs);
              onUpdateSettings({ ...settings, minDelayMs: newMin, maxDelayMs: newMax });
            }}
            className="w-full accent-blue-500 bg-zinc-800 rounded-lg cursor-pointer h-2.5"
          />
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>0.6s</span>
            <span>3.0s</span>
            <span>6.0s (Largo)</span>
          </div>
        </div>

        {/* Presets */}
        <div className="space-y-1 pt-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
            Ajustes rápidos de ritmo:
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: 'Rápido', min: 800, max: 1500, desc: '0.8 - 1.5s' },
              { label: 'Medio', min: 1400, max: 2800, desc: '1.4 - 2.8s' },
              { label: 'Pausado', min: 2500, max: 4500, desc: '2.5 - 4.5s' },
              { label: 'Variado', min: 900, max: 4000, desc: '0.9 - 4.0s' },
            ].map((p) => {
              const isSelected = settings.minDelayMs === p.min && settings.maxDelayMs === p.max;
              return (
                <button
                  key={p.label}
                  onClick={() => onUpdateSettings({ ...settings, minDelayMs: p.min, maxDelayMs: p.max })}
                  className={`py-2 px-1 rounded-xl text-center border transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
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

      {/* 3. Fencing Drill Modifiers */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Swords className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-bold text-white">Comportamiento del Asalto</span>
        </div>

        {/* Weapon Equipped */}
        <label className="flex items-center justify-between p-2.5 rounded-xl bg-black/60 border border-zinc-850 cursor-pointer">
          <div>
            <span className="text-xs font-bold text-zinc-200 block">Arma equipada</span>
            <span className="text-[11px] text-zinc-400">Tirador con espada, florete o sable en mano</span>
          </div>
          <input
            type="checkbox"
            checked={settings.weaponEquipped}
            onChange={(e) => update('weaponEquipped', e.target.checked)}
            className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
          />
        </label>

        {/* Play Recover Sound */}
        <label className="flex items-center justify-between p-2.5 rounded-xl bg-black/60 border border-zinc-850 cursor-pointer">
          <div>
            <span className="text-xs font-bold text-zinc-200 block">Orden de volver a la guardia</span>
            <span className="text-[11px] text-zinc-400">El árbitro dice "¡A la guardia!" tras un fondo</span>
          </div>
          <input
            type="checkbox"
            checked={settings.playRecoverSound}
            onChange={(e) => update('playRecoverSound', e.target.checked)}
            className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
          />
        </label>

        {/* Variable Lunge Duration */}
        <label className="flex items-center justify-between p-2.5 rounded-xl bg-black/60 border border-zinc-850 cursor-pointer">
          <div>
            <span className="text-xs font-bold text-zinc-200 block">Duración variable del fondo</span>
            <span className="text-[11px] text-zinc-400">Añade pequeñas variaciones realistas al tiempo que sostienes el fondo</span>
          </div>
          <input
            type="checkbox"
            checked={settings.variableLungeDuration}
            onChange={(e) => update('variableLungeDuration', e.target.checked)}
            className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
          />
        </label>

        {/* Lunge Hold Time Slider */}
        <div className="pt-2 border-t border-zinc-850">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-300 font-semibold">Tiempo aguantando el fondo:</span>
            <span className="text-rose-400 font-mono font-bold">
              {((settings.lungeHoldTimeMs ?? 2200) / 1000).toFixed(1)} segundos
            </span>
          </div>
          <input
            type="range"
            min="1000"
            max="4500"
            step="100"
            value={settings.lungeHoldTimeMs ?? 2200}
            onChange={(e) => update('lungeHoldTimeMs', Number(e.target.value))}
            className="w-full accent-rose-500 bg-zinc-800 rounded-lg cursor-pointer h-2"
          />
          <p className="text-[10px] text-zinc-400 mt-0.5">
            Tiempo para asentar el fondo antes de la orden "¡A la guardia!".
          </p>
        </div>

        {/* Recovery Settle Time Slider */}
        <div className="pt-2 border-t border-zinc-850">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-300 font-semibold">Tiempo para volver a la guardia:</span>
            <span className="text-blue-400 font-mono font-bold">
              {((settings.recoveryTimeMs ?? 1800) / 1000).toFixed(1)} segundos
            </span>
          </div>
          <input
            type="range"
            min="800"
            max="3500"
            step="100"
            value={settings.recoveryTimeMs ?? 1800}
            onChange={(e) => update('recoveryTimeMs', Number(e.target.value))}
            className="w-full accent-blue-500 bg-zinc-800 rounded-lg cursor-pointer h-2"
          />
          <p className="text-[10px] text-zinc-400 mt-0.5">
            Margen de respiro tras "¡A la guardia!" para recuperar el equilibrio antes de la siguiente orden.
          </p>
        </div>

        {/* Multi-step Extra Buffer Slider */}
        <div className="pt-2 border-t border-zinc-850">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-300 font-semibold">Tiempo extra en acciones compuestas:</span>
            <span className="text-emerald-400 font-mono font-bold">
              +{((settings.multiStepBufferMs ?? 1200) / 1000).toFixed(1)} segundos
            </span>
          </div>
          <input
            type="range"
            min="400"
            max="3000"
            step="100"
            value={settings.multiStepBufferMs ?? 1200}
            onChange={(e) => update('multiStepBufferMs', Number(e.target.value))}
            className="w-full accent-emerald-500 bg-zinc-800 rounded-lg cursor-pointer h-2"
          />
          <p className="text-[10px] text-zinc-400 mt-0.5">
            Tiempo adicional para series de varios pasos (ej: "Marcha, marcha, fondo", "Marcha, paso adelante, marcha").
          </p>
        </div>
      </div>

      {/* 4. Audio & Voice Settings - Official FIE Referee Only, 100% Volume, Voice Only */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-white">Voz del Árbitro Oficial FIE</span>
          </div>
          <button
            onClick={testVoice}
            className="text-xs px-3 py-1.5 rounded-xl bg-blue-950/80 text-blue-300 border border-blue-800/60 hover:bg-blue-900 font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Probar voz
          </button>
        </div>

        <div className="bg-gradient-to-r from-blue-950/80 via-black to-zinc-950 border border-blue-600/30 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-blue-300 flex items-center gap-1.5 uppercase tracking-wide">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              Árbitro Oficial FIE Masculino (Español)
            </span>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40">
              Volumen 100% · Solo Voz
            </span>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed">
            Locución oficial de arbitraje de esgrima en español (voz masculina FIE, dicción clara, alta autoridad). Solo voz clara de las acciones, sin beeps ni interferencias acústicas.
          </p>
        </div>

        {/* Speech Rate Slider */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-300 font-semibold">Velocidad de locución de las órdenes:</span>
            <span className="text-blue-400 font-mono font-bold text-xs bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
              {settings.speechRate.toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            min="0.9"
            max="1.5"
            step="0.05"
            value={settings.speechRate}
            onChange={(e) => update('speechRate', parseFloat(e.target.value))}
            className="w-full accent-blue-500 bg-zinc-800 rounded-lg cursor-pointer h-2"
          />
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>Más pausada</span>
            <span className="text-zinc-400 font-semibold">1.15x (Oficial FIE)</span>
            <span>Más rápida</span>
          </div>
        </div>
      </div>

      {/* 5. Mobile & Android Options (Cleaned: no haptic vibration) */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Smartphone className="w-4 h-4 text-teal-400" />
          <span className="text-sm font-bold text-white">Comodidad Móvil y Android</span>
        </div>

        {/* Screen Awake */}
        <label className="flex items-center justify-between p-3 rounded-xl bg-black/60 border border-zinc-850 cursor-pointer">
          <div className="flex items-center gap-2.5">
            <Eye className="w-4 h-4 text-teal-400" />
            <div>
              <span className="text-xs font-bold text-zinc-200 block">Mantener pantalla siempre encendida</span>
              <span className="text-[11px] text-zinc-400">Evita que el móvil se bloquee durante la sesión</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.keepScreenAwake}
            onChange={(e) => update('keepScreenAwake', e.target.checked)}
            className="w-5 h-5 accent-teal-500 rounded cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
};
