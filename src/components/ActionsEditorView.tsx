import React, { useState } from 'react';
import {
  FootworkAction,
  ActionCategory,
} from '../types/fencing';
import { soundEngine } from '../services/soundEngine';
import { speechEngine } from '../services/speechEngine';
import {
  Volume2,
  Check,
  X,
  RotateCcw,
  Sliders,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Crosshair,
  Zap,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface ActionsEditorViewProps {
  actions: FootworkAction[];
  onUpdateAction: (updated: FootworkAction) => void;
  onAddAction: (newAction: FootworkAction) => void;
  onDeleteAction: (actionId: string) => void;
  onRestoreDefaults: () => void;
  soundVolume: number;
}

export const ActionsEditorView: React.FC<ActionsEditorViewProps> = ({
  actions,
  onUpdateAction,
  onAddAction,
  onDeleteAction,
  onRestoreDefaults,
  soundVolume,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedActionId, setExpandedActionId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New action form state
  const [newDisplayName, setNewDisplayName] = useState<string>('');
  const [newVoiceText, setNewVoiceText] = useState<string>('');
  const [newCategory, setNewCategory] = useState<ActionCategory>('advance');
  const [newDistanceCm, setNewDistanceCm] = useState<number>(70);
  const [newTimeToPerformMs, setNewTimeToPerformMs] = useState<number>(900);
  const [newFrequencyWeight, setNewFrequencyWeight] = useState<number>(6);
  const [newSoundCue, setNewSoundCue] = useState<string>('advance');
  const [newCoachAlsoSpeaks, setNewCoachAlsoSpeaks] = useState<boolean>(true);

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Todas' },
    { id: 'advance', label: 'Avance' },
    { id: 'retreat', label: 'Romper' },
    { id: 'lunge', label: 'Fondos' },
    { id: 'combination', label: 'Series' },
    { id: 'custom', label: 'Personalizadas' },
  ];

  const filteredActions = actions.filter((a) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'advance') return a.category === 'advance';
    if (selectedCategory === 'retreat') return a.category === 'retreat';
    if (selectedCategory === 'lunge') return a.category === 'lunge' || a.isLunge;
    if (selectedCategory === 'combination') return a.category === 'combination';
    if (selectedCategory === 'custom') return a.category === 'custom' || a.isCustom;
    return true;
  });

  const activeCount = actions.filter((a) => a.isActive).length;

  const testActionAudio = (action: FootworkAction, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.unlockAudio();
    speechEngine.speak(action.voiceText, 1.15, 1.0, 1.0);
  };

  const handleSaveNewAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisplayName.trim()) return;

    const actionId = `custom_${Date.now()}`;
    const voice = newVoiceText.trim()
      ? newVoiceText.trim().startsWith('¡')
        ? newVoiceText.trim()
        : `¡${newVoiceText.trim()}!`
      : `¡${newDisplayName.trim()}!`;

    const created: FootworkAction = {
      id: actionId,
      name: newDisplayName.trim(),
      displayName: newDisplayName.trim(),
      voiceText: voice,
      category: newCategory,
      distanceCm: Number(newDistanceCm),
      timeToPerformMs: Number(newTimeToPerformMs),
      frequencyWeight: Number(newFrequencyWeight),
      isActive: true,
      soundCue: newSoundCue,
      isCustom: true,
      coachAlsoSpeaks: newCoachAlsoSpeaks,
      isLunge: newCategory === 'lunge',
      description: 'Acción personalizada creada por el usuario.',
    };

    onAddAction(created);
    setShowAddModal(false);
    // Reset form
    setNewDisplayName('');
    setNewVoiceText('');
    setNewDistanceCm(70);
    setNewTimeToPerformMs(900);
  };

  const getCategoryIcon = (category: ActionCategory) => {
    switch (category) {
      case 'advance':
        return <ArrowRight className="w-4 h-4 text-emerald-400" />;
      case 'retreat':
        return <ArrowLeft className="w-4 h-4 text-amber-400" />;
      case 'lunge':
        return <Crosshair className="w-4 h-4 text-rose-400" />;
      case 'combination':
        return <Zap className="w-4 h-4 text-purple-400" />;
      case 'custom':
        return <Sliders className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header and buttons */}
      <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              Configurar Acciones
            </h2>
            <p className="text-xs text-zinc-400">
              {activeCount} de {actions.length} acciones activadas
            </p>
          </div>
          <button
            onClick={onRestoreDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-xs text-zinc-300 font-semibold border border-zinc-800 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer
          </button>
        </div>

        {/* Big Add Action Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-950/40 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Añadir Nueva Acción Personalizada
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === c.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40'
                : 'bg-zinc-950 text-zinc-400 border border-zinc-850 hover:text-zinc-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Actions List */}
      <div className="space-y-2.5">
        {filteredActions.map((action) => {
          const isExpanded = expandedActionId === action.id;

          return (
            <div
              key={action.id}
              className={`rounded-2xl border transition-all ${
                action.isActive
                  ? 'bg-zinc-950 border-zinc-850'
                  : 'bg-black/60 border-zinc-900 opacity-60'
              }`}
            >
              {/* Card Summary Header */}
              <div
                onClick={() => setExpandedActionId(isExpanded ? null : action.id)}
                className="p-3.5 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Active Toggle Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateAction({ ...action, isActive: !action.isActive });
                    }}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition cursor-pointer ${
                      action.isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-zinc-900 border border-zinc-800 text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-black/60 border border-zinc-800">
                      {getCategoryIcon(action.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-bold block ${action.isActive ? 'text-white' : 'text-zinc-500 line-through'}`}>
                          {action.displayName}
                        </span>
                        {action.coachAlsoSpeaks && (
                          <span
                            title="El entrenador virtual también dice esta acción"
                            className="px-1.5 py-0.2 rounded-md bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-[9px] font-bold flex items-center gap-0.5"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            Entrenador
                          </span>
                        )}
                        {action.isCustom && (
                          <span className="px-1.5 py-0.2 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-bold">
                            Propia
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                        <span className={action.distanceCm > 0 ? 'text-emerald-400 font-semibold' : action.distanceCm < 0 ? 'text-amber-400 font-semibold' : 'text-zinc-400'}>
                          {action.distanceCm > 0 ? `+${action.distanceCm} cm` : `${action.distanceCm} cm`}
                        </span>
                        <span>·</span>
                        <span>{action.timeToPerformMs} ms</span>
                        <span>·</span>
                        <span className="text-blue-400">Freq {action.frequencyWeight}x</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => testActionAudio(action, e)}
                    title="Probar sonido y voz"
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 text-blue-400" />
                  </button>

                  {action.isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`¿Eliminar la acción "${action.displayName}"?`)) {
                          onDeleteAction(action.id);
                        }
                      }}
                      title="Eliminar acción"
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <div className="text-zinc-500 p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded Fine-tuning Panel */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-zinc-850 space-y-3.5 bg-black/80 rounded-b-2xl">
                  {/* Name override */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1">
                      Nombre mostrado / Orden por voz
                    </label>
                    <input
                      type="text"
                      value={action.displayName}
                      onChange={(e) => onUpdateAction({ ...action, displayName: e.target.value, voiceText: `¡${e.target.value}!` })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>

                  {/* Coach toggle option for this action */}
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-zinc-850 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <div>
                        <span className="text-xs font-bold text-white block">El Entrenador Virtual también la dice</span>
                        <span className="text-[10px] text-zinc-400">La recordará como consejo técnico durante el asalto</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!action.coachAlsoSpeaks}
                      onChange={(e) => onUpdateAction({ ...action, coachAlsoSpeaks: e.target.checked })}
                      className="w-5 h-5 accent-yellow-500 rounded cursor-pointer"
                    />
                  </label>

                  {/* Frequency Slider */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400 font-semibold">Frecuencia / Probabilidad</span>
                      <span className="text-blue-400 font-mono font-bold">{action.frequencyWeight} (1=Raro, 10=Frecuente)</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={action.frequencyWeight}
                      onChange={(e) => onUpdateAction({ ...action, frequencyWeight: Number(e.target.value) })}
                      className="w-full accent-blue-600 bg-zinc-800 rounded-lg cursor-pointer h-2"
                    />
                  </div>

                  {/* Distance Slider */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400 font-semibold">Distancia recorrida en pista</span>
                      <span className="text-emerald-400 font-mono font-bold">{action.distanceCm} cm</span>
                    </div>
                    <input
                      type="range"
                      min="-300"
                      max="300"
                      step="5"
                      value={action.distanceCm}
                      onChange={(e) => onUpdateAction({ ...action, distanceCm: Number(e.target.value) })}
                      className="w-full accent-emerald-600 bg-zinc-800 rounded-lg cursor-pointer h-2"
                    />
                  </div>

                  {/* Time to perform slider */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400 font-semibold">Tiempo de ejecución</span>
                      <span className="text-indigo-400 font-mono font-bold">{action.timeToPerformMs} ms</span>
                    </div>
                    <input
                      type="range"
                      min="400"
                      max="3000"
                      step="50"
                      value={action.timeToPerformMs}
                      onChange={(e) => onUpdateAction({ ...action, timeToPerformMs: Number(e.target.value) })}
                      className="w-full accent-indigo-600 bg-zinc-800 rounded-lg cursor-pointer h-2"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add New Action Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl text-zinc-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                Añadir Nueva Acción
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewAction} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-zinc-300 block mb-1">
                  Nombre de la acción (Ej: "Fondo al brazo", "Flecha")
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Fondo al brazo"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">
                  Frase que dice la voz en español
                </label>
                <input
                  type="text"
                  placeholder="Ej: ¡Fondo al brazo!"
                  value={newVoiceText}
                  onChange={(e) => setNewVoiceText(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              {/* Category */}
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Categoría</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'advance', label: 'Avance' },
                    { id: 'retreat', label: 'Romper' },
                    { id: 'lunge', label: 'Fondo' },
                    { id: 'combination', label: 'Serie' },
                    { id: 'custom', label: 'Personalizada' },
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setNewCategory(cat.id as ActionCategory)}
                      className={`py-1.5 px-1 rounded-lg text-center border font-semibold cursor-pointer ${
                        newCategory === cat.id
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-black/60 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Distance Slider */}
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-zinc-400">Distancia (+ avance, - atrás)</span>
                  <span className="text-emerald-400 font-mono">{newDistanceCm} cm</span>
                </div>
                <input
                  type="range"
                  min="-250"
                  max="250"
                  step="10"
                  value={newDistanceCm}
                  onChange={(e) => setNewDistanceCm(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-zinc-800 rounded-lg cursor-pointer h-2"
                />
              </div>

              {/* Duration Slider */}
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-zinc-400">Tiempo de ejecución</span>
                  <span className="text-indigo-400 font-mono">{newTimeToPerformMs} ms</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="2500"
                  step="50"
                  value={newTimeToPerformMs}
                  onChange={(e) => setNewTimeToPerformMs(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-zinc-800 rounded-lg cursor-pointer h-2"
                />
              </div>

              {/* Coach checkbox */}
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-black/60 border border-zinc-850 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="font-bold text-white">El entrenador virtual también la dirá</span>
                </div>
                <input
                  type="checkbox"
                  checked={newCoachAlsoSpeaks}
                  onChange={(e) => setNewCoachAlsoSpeaks(e.target.checked)}
                  className="w-5 h-5 accent-yellow-500 rounded cursor-pointer"
                />
              </label>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold cursor-pointer border border-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold shadow-lg shadow-blue-950/50 cursor-pointer"
                >
                  Guardar Acción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
