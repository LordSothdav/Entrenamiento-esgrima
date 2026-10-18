import React, { useState } from 'react';
import { VirtualCoachSettings, CustomCoachTip } from '../types/fencing';
import {
  Award,
  Sparkles,
  Volume2,
  RotateCcw,
  Plus,
  Trash2,
  X,
  MessageSquarePlus,
} from 'lucide-react';
import { speechEngine } from '../services/speechEngine';
import { soundEngine } from '../services/soundEngine';

interface CoachSettingsViewProps {
  coach: VirtualCoachSettings;
  onUpdateCoach: (newCoach: VirtualCoachSettings) => void;
  onRestoreDefaults: () => void;
  soundVolume: number;
}

export const CoachSettingsView: React.FC<CoachSettingsViewProps> = ({
  coach,
  onUpdateCoach,
  onRestoreDefaults,
}) => {
  const [showAddTipModal, setShowAddTipModal] = useState<boolean>(false);
  const [newTipText, setNewTipText] = useState<string>('');

  const update = <K extends keyof VirtualCoachSettings>(key: K, val: VirtualCoachSettings[K]) => {
    onUpdateCoach({ ...coach, [key]: val });
  };

  const testTip = (text: string) => {
    soundEngine.unlockAudio();
    speechEngine.speak(text, 1.15, 1.0, 1.0);
  };

  const handleAddCustomTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTipText.trim()) return;

    const formattedText = newTipText.trim().startsWith('¡')
      ? newTipText.trim()
      : `¡${newTipText.trim()}!`;

    const newTip: CustomCoachTip = {
      id: `tip_${Date.now()}`,
      text: formattedText,
      enabled: true,
    };

    const nextTips = [...(coach.customTips || []), newTip];
    update('customTips', nextTips);
    setNewTipText('');
    setShowAddTipModal(false);
  };

  const handleToggleCustomTip = (id: string) => {
    const nextTips = (coach.customTips || []).map((t) =>
      t.id === id ? { ...t, enabled: !t.enabled } : t
    );
    update('customTips', nextTips);
  };

  const handleDeleteCustomTip = (id: string) => {
    const nextTips = (coach.customTips || []).filter((t) => t.id !== id);
    update('customTips', nextTips);
  };

  const tipsList: { key: keyof VirtualCoachSettings; title: string; cue: string; desc: string }[] = [
    {
      key: 'stayLow',
      title: '¡Mantente abajo! (Stay Low)',
      cue: '¡Mantén las rodillas flexionadas y centro de gravedad bajo!',
      desc: 'Evita elevar la cadera al marchar o romper para mantener el resorte en las piernas.',
    },
    {
      key: 'armPosition',
      title: 'Posición del brazo armado',
      cue: '¡Brazo armado preparado, punta apuntando al objetivo!',
      desc: 'Mantiene la amenaza en la línea de ataque y la empuñadura relajada.',
    },
    {
      key: 'relaxShoulders',
      title: 'Relajar los hombros',
      cue: '¡Relaja los hombros y mantén la fluidez!',
      desc: 'Disminuye la tensión muscular en el cuello para reacciones más explosivas.',
    },
    {
      key: 'straightBack',
      title: 'Espalda recta y erguida',
      cue: '¡Tronco erguido, no te inclines hacia adelante!',
      desc: 'Evita perder el equilibrio y mantener la distancia defensiva.',
    },
    {
      key: 'smallSteps',
      title: 'Pasos precisos y controlados',
      cue: '¡Pasos de esgrima precisos, nunca juntes los talones!',
      desc: 'Garantiza la distancia idónea de 1 pie y medio entre talones.',
    },
    {
      key: 'guardBalance',
      title: 'Equilibrio de peso en guardia',
      cue: '¡Distribuye el peso 50/50 entre ambas piernas en guardia!',
      desc: 'Permite reaccionar igual de rápido hacia adelante o hacia atrás.',
    },
  ];

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-400" />
              Entrenador Virtual
            </h2>
            <p className="text-xs text-zinc-400">Recordatorios técnicos automáticos durante la sesión</p>
          </div>
          <button
            onClick={onRestoreDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-xs text-zinc-300 font-semibold border border-zinc-800 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer
          </button>
        </div>

        {/* Button to add custom coach cue */}
        <button
          onClick={() => setShowAddTipModal(true)}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 active:scale-98 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-yellow-950/40 transition cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4" />
          Añadir Frase o Consejo al Entrenador
        </button>
      </div>

      {/* Main Switch */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Activar Entrenador Virtual</span>
              <span className="text-xs text-zinc-400">Inserta correcciones técnicas por voz y en pantalla</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={coach.enabled}
            onChange={(e) => update('enabled', e.target.checked)}
            className="w-5 h-5 accent-yellow-500 rounded cursor-pointer"
          />
        </label>

        {coach.enabled && (
          <div className="mt-4 pt-3 border-t border-zinc-850 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400 font-semibold">Recordar cada número de acciones:</span>
              <span className="text-yellow-400 font-mono font-bold">Cada {coach.frequencyActions} acciones</span>
            </div>
            <input
              type="range"
              min="2"
              max="15"
              step="1"
              value={coach.frequencyActions}
              onChange={(e) => update('frequencyActions', parseInt(e.target.value))}
              className="w-full accent-yellow-500 bg-zinc-800 rounded-lg cursor-pointer h-2"
            />
          </div>
        )}
      </div>

      {/* Custom Coach Advice Added by User */}
      {coach.customTips && coach.customTips.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-yellow-400 px-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Tus frases personalizadas ({coach.customTips.length})
          </h3>
          {coach.customTips.map((tip) => (
            <div
              key={tip.id}
              className={`p-3.5 rounded-2xl border transition ${
                tip.enabled && coach.enabled
                  ? 'bg-zinc-950 border-zinc-850'
                  : 'bg-black/60 border-zinc-900 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    disabled={!coach.enabled}
                    checked={tip.enabled}
                    onChange={() => handleToggleCustomTip(tip.id)}
                    className="w-5 h-5 accent-yellow-500 rounded cursor-pointer flex-shrink-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">"{tip.text}"</span>
                    <span className="text-[10px] text-yellow-300 font-medium">Frase personalizada</span>
                  </div>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => testTip(tip.text)}
                    title="Escuchar consejo"
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-yellow-400 hover:text-white transition cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCustomTip(tip.id)}
                    title="Eliminar frase"
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Built-in Technical Tips */}
      <div className="space-y-2.5">
        <h3 className="text-xs uppercase font-extrabold tracking-wider text-zinc-400 px-1">
          Consejos técnicos básicos de esgrima
        </h3>
        {tipsList.map((item) => {
          const isChecked = !!coach[item.key];
          return (
            <div
              key={item.key}
              className={`p-3.5 rounded-2xl border transition ${
                isChecked && coach.enabled
                  ? 'bg-zinc-950 border-zinc-850'
                  : 'bg-black/60 border-zinc-900 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <label className="flex items-start gap-3 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    disabled={!coach.enabled}
                    checked={isChecked}
                    onChange={(e) => update(item.key, e.target.checked)}
                    className="w-5 h-5 mt-0.5 accent-yellow-500 rounded cursor-pointer flex-shrink-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">{item.title}</span>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    <span className="inline-block mt-1 text-[11px] text-yellow-300/90 font-medium italic">
                      "{item.cue}"
                    </span>
                  </div>
                </label>
                <button
                  onClick={() => testTip(item.cue)}
                  title="Escuchar consejo"
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-yellow-400 hover:text-white transition flex-shrink-0 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal to Add Custom Coach Tip */}
      {showAddTipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl text-zinc-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-yellow-400" />
                Nuevo Consejo del Entrenador
              </h3>
              <button
                onClick={() => setShowAddTipModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomTip} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Frase que dirá el entrenador por voz:
                </label>
                <textarea
                  required
                  rows={3}
                  value={newTipText}
                  onChange={(e) => setNewTipText(e.target.value)}
                  placeholder="Ej: ¡Extiende el brazo antes de mover las piernas!"
                  className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-500 font-medium"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  El entrenador pronunciará esta frase periódicamente durante tus asaltos.
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTipModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs cursor-pointer border border-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 active:scale-98 text-black font-bold text-xs shadow-lg shadow-yellow-950/50 cursor-pointer"
                >
                  Guardar Consejo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
