import {
  FootworkAction,
  WorkoutSettings,
  VirtualCoachSettings,
  ReactionSettings,
} from '../types/fencing';

export const DEFAULT_ACTIONS: FootworkAction[] = [
  {
    id: 'marcha',
    name: 'Marcha',
    displayName: 'Marcha',
    category: 'advance',
    distanceCm: 70,
    timeToPerformMs: 1100,
    frequencyWeight: 10,
    isActive: true,
    soundCue: 'advance',
    voiceText: '¡Marcha!',
    description: 'Paso básico hacia adelante manteniendo la posición de guardia.',
  },
  {
    id: 'marcha_marcha_fondo',
    name: 'Marcha, marcha, fondo',
    displayName: 'Marcha, marcha, fondo',
    category: 'combination',
    distanceCm: 260,
    timeToPerformMs: 3200,
    frequencyWeight: 6,
    isActive: true,
    soundCue: 'lunge',
    voiceText: '¡Marcha, marcha, fondo!',
    isLunge: true,
    description: 'Dos marchas previas y extensión completa de fondo.',
  },
  {
    id: 'marcha_salto_fondo',
    name: 'Marcha, salto, fondo',
    displayName: 'Marcha, salto, fondo',
    category: 'combination',
    distanceCm: 275,
    timeToPerformMs: 3000,
    frequencyWeight: 5,
    isActive: true,
    soundCue: 'lunge',
    voiceText: '¡Marcha, salto, fondo!',
    isLunge: true,
    description: 'Marcha, salto explosivo y fondo directo.',
  },
  {
    id: 'marcha_fondo',
    name: 'Marcha, fondo',
    displayName: 'Marcha, fondo',
    category: 'combination',
    distanceCm: 190,
    timeToPerformMs: 2400,
    frequencyWeight: 8,
    isActive: true,
    soundCue: 'lunge',
    voiceText: '¡Marcha, fondo!',
    isLunge: true,
    description: 'Ataque clásico combinando una marcha y fondo.',
  },
  {
    id: 'doble_marcha',
    name: 'Doble marcha',
    displayName: 'Doble marcha',
    category: 'advance',
    distanceCm: 140,
    timeToPerformMs: 1900,
    frequencyWeight: 8,
    isActive: true,
    soundCue: 'double_advance',
    voiceText: '¡Doble marcha!',
    description: 'Dos marchas fluidas y consecutivas hacia adelante.',
  },
  {
    id: 'doble_marcha_romper',
    name: 'Doble marcha, romper',
    displayName: 'Doble marcha, romper',
    category: 'combination',
    distanceCm: 70,
    timeToPerformMs: 2700,
    frequencyWeight: 5,
    isActive: true,
    soundCue: 'retreat',
    voiceText: '¡Doble marcha, romper!',
    description: 'Presión ofensiva con repliegue defensivo inmediato.',
  },
  {
    id: 'doble_romper',
    name: 'Doble romper',
    displayName: 'Doble romper',
    category: 'retreat',
    distanceCm: -140,
    timeToPerformMs: 1900,
    frequencyWeight: 8,
    isActive: true,
    soundCue: 'double_retreat',
    voiceText: '¡Doble romper!',
    description: 'Dos pasos atrás rápidos para romper la distancia del rival.',
  },
  {
    id: 'doble_romper_marcha',
    name: 'Doble romper, marcha',
    displayName: 'Doble romper, marcha',
    category: 'combination',
    distanceCm: -70,
    timeToPerformMs: 2700,
    frequencyWeight: 5,
    isActive: true,
    soundCue: 'advance',
    voiceText: '¡Doble romper, marcha!',
    description: 'Ceder distancia hacia atrás y retomar la iniciativa.',
  },
  {
    id: 'salto_atras',
    name: 'Salto atras',
    displayName: 'Salto atrás',
    category: 'retreat',
    distanceCm: -85,
    timeToPerformMs: 1000,
    frequencyWeight: 6,
    isActive: true,
    soundCue: 'retreat',
    voiceText: '¡Salto atrás!',
    description: 'Salto defensivo rápido impulsado por ambas piernas.',
  },
  {
    id: 'salto_alante',
    name: 'Salto alante',
    displayName: 'Salto alante',
    category: 'advance',
    distanceCm: 85,
    timeToPerformMs: 1000,
    frequencyWeight: 6,
    isActive: true,
    soundCue: 'advance',
    voiceText: '¡Salto alante!',
    description: 'Salto dinámico hacia adelante aterrizando en guardia.',
  },
  {
    id: 'salto_fondo',
    name: 'Salto fondo',
    displayName: 'Salto fondo',
    category: 'combination',
    distanceCm: 205,
    timeToPerformMs: 2400,
    frequencyWeight: 7,
    isActive: true,
    soundCue: 'lunge',
    voiceText: '¡Salto fondo!',
    isLunge: true,
    description: 'Salto hacia adelante terminando en fondo explosivo.',
  },
  {
    id: 'fondo',
    name: 'Fondo',
    displayName: 'Fondo',
    category: 'lunge',
    distanceCm: 120,
    timeToPerformMs: 1400,
    frequencyWeight: 9,
    isActive: true,
    soundCue: 'lunge',
    voiceText: '¡Fondo!',
    isLunge: true,
    description: 'Ataque principal con extensión completa de pierna y brazo.',
  },
  {
    id: 'romper',
    name: 'Romper',
    displayName: 'Romper',
    category: 'retreat',
    distanceCm: -70,
    timeToPerformMs: 1100,
    frequencyWeight: 10,
    isActive: true,
    soundCue: 'retreat',
    voiceText: '¡Romper!',
    description: 'Paso atrás defensivo manteniendo la postura de guardia.',
  },
  {
    id: 'romper_fondo',
    name: 'Romper, fondo',
    displayName: 'Romper, fondo',
    category: 'combination',
    distanceCm: 50,
    timeToPerformMs: 2400,
    frequencyWeight: 6,
    isActive: true,
    soundCue: 'lunge',
    voiceText: '¡Romper, fondo!',
    isLunge: true,
    description: 'Retroceso defensivo seguido de contrataque con fondo.',
  },
  {
    id: 'pequena_marcha',
    name: 'Pequeña marcha',
    displayName: 'Pequeña marcha',
    category: 'advance',
    distanceCm: 35,
    timeToPerformMs: 800,
    frequencyWeight: 7,
    isActive: true,
    soundCue: 'advance',
    voiceText: '¡Pequeña marcha!',
    description: 'Medio paso hacia adelante para afinar la distancia de ataque.',
  },
  {
    id: 'pequeno_romper',
    name: 'Pequeño romper',
    displayName: 'Pequeño romper',
    category: 'retreat',
    distanceCm: -35,
    timeToPerformMs: 800,
    frequencyWeight: 7,
    isActive: true,
    soundCue: 'retreat',
    voiceText: '¡Pequeño romper!',
    description: 'Medio paso atrás sutil para descolocar al adversario.',
  },
  {
    id: 'romper_paso_atras_romper',
    name: 'Romper, paso atrás, romper',
    displayName: 'Romper, paso atrás, romper',
    category: 'retreat',
    distanceCm: -150,
    timeToPerformMs: 3300,
    frequencyWeight: 4,
    isActive: true,
    soundCue: 'retreat',
    voiceText: '¡Romper, paso atrás, romper!',
    description: 'Secuencia defensiva combinada de repliegue táctico.',
  },
  {
    id: 'marcha_paso_adelante_marcha',
    name: 'Marcha, paso adelante, marcha',
    displayName: 'Marcha, paso adelante, marcha',
    category: 'advance',
    distanceCm: 210,
    timeToPerformMs: 3300,
    frequencyWeight: 4,
    isActive: true,
    soundCue: 'advance',
    voiceText: '¡Marcha, paso adelante, marcha!',
    description: 'Avance continuo y encadenado ganando terreno en la pista.',
  },
  {
    id: 'balestra',
    name: 'Balestra',
    displayName: 'Balestra',
    category: 'advance',
    distanceCm: 85,
    timeToPerformMs: 800,
    frequencyWeight: 7,
    isActive: true,
    soundCue: 'advance',
    voiceText: '¡Balestra!',
    description: 'Balestra de esgrima: salto rasante hacia adelante aterrizando en guardia.',
  },
  {
    id: 'doble_fondo',
    name: 'Doble fondo',
    displayName: 'Doble fondo',
    category: 'lunge',
    distanceCm: 170,
    timeToPerformMs: 2800,
    frequencyWeight: 5,
    isActive: true,
    soundCue: 'lunge',
    voiceText: '¡Doble fondo!',
    isLunge: true,
    description: 'Fondo explosivo con redoblamiento hacia adelante.',
  },
  {
    id: 'romper_romper_parada_cuarta_fondo_respuesta',
    name: 'Romper, Romper, Parada de Cuarta, Fondo Respuesta',
    displayName: 'Romper, Romper, Parada de Cuarta, Fondo Respuesta',
    category: 'combination',
    distanceCm: -20,
    timeToPerformMs: 3800,
    frequencyWeight: 5,
    isActive: true,
    soundCue: 'lunge',
    voiceText: '¡Romper, romper, parada de cuarta, fondo respuesta!',
    isLunge: true,
    coachAlsoSpeaks: true,
    description: 'Doble repliegue hacia atrás, parada de cuarta cubriendo línea interna y respuesta fulgurante en fondo.',
  },
  {
    id: 'romper_romper_parada_sexta_fondo_respuesta',
    name: 'Romper, Romper, Parada de Sexta, Fondo Respuesta',
    displayName: 'Romper, Romper, Parada de Sexta, Fondo Respuesta',
    category: 'combination',
    distanceCm: -20,
    timeToPerformMs: 3800,
    frequencyWeight: 5,
    isActive: true,
    soundCue: 'lunge',
    voiceText: '¡Romper, romper, parada de sexta, fondo respuesta!',
    isLunge: true,
    coachAlsoSpeaks: true,
    description: 'Doble repliegue hacia atrás, parada de sexta en línea alta externa y fondo de respuesta directo.',
  },
  {
    id: 'romper_parada_cuarta_marcha_fondo_respuesta',
    name: 'Romper, Parada de Cuarta, Marcha, Fondo Respuesta',
    displayName: 'Romper, Parada de Cuarta, Marcha, Fondo Respuesta',
    category: 'combination',
    distanceCm: 120,
    timeToPerformMs: 3800,
    frequencyWeight: 5,
    isActive: true,
    soundCue: 'lunge',
    voiceText: '¡Romper, parada de cuarta, marcha, fondo respuesta!',
    isLunge: true,
    coachAlsoSpeaks: true,
    description: 'Ruptura con parada de cuarta en retirada, avance ofensivo con marcha y fondo de respuesta.',
  },
  {
    id: 'romper_parada_sexta_marcha_fondo_respuesta',
    name: 'Romper, Parada de Sexta, Marcha, Fondo Respuesta',
    displayName: 'Romper, Parada de Sexta, Marcha, Fondo Respuesta',
    category: 'combination',
    distanceCm: 120,
    timeToPerformMs: 3800,
    frequencyWeight: 5,
    isActive: true,
    soundCue: 'lunge',
    voiceText: '¡Romper, parada de sexta, marcha, fondo respuesta!',
    isLunge: true,
    coachAlsoSpeaks: true,
    description: 'Ruptura con parada de sexta en línea externa, marcha ganando distancia y respuesta contundente en fondo.',
  },
  {
    id: 'romper_parada_octava_marcha_fondo_respuesta',
    name: 'Romper, Parada de Octava, Marcha, Fondo Respuesta',
    displayName: 'Romper, Parada de Octava, Marcha, Fondo Respuesta',
    category: 'combination',
    distanceCm: 120,
    timeToPerformMs: 3800,
    frequencyWeight: 5,
    isActive: true,
    soundCue: 'lunge',
    voiceText: '¡Romper, parada de octava, marcha, fondo respuesta!',
    isLunge: true,
    coachAlsoSpeaks: true,
    description: 'Ruptura con parada baja de octava, marcha hacia adelante y fondo de respuesta en línea baja.',
  },
  {
    id: 'romper_parada_septima_marcha_fondo_respuesta',
    name: 'Romper, Parada de Séptima, Marcha, Fondo Respuesta',
    displayName: 'Romper, Parada de Séptima, Marcha, Fondo Respuesta',
    category: 'combination',
    distanceCm: 120,
    timeToPerformMs: 3800,
    frequencyWeight: 4,
    isActive: true,
    soundCue: 'lunge',
    voiceText: '¡Romper, parada de séptima, marcha, fondo respuesta!',
    isLunge: true,
    coachAlsoSpeaks: true,
    description: 'Ruptura con parada envolvente de séptima en línea baja interna, marcha y fondo de respuesta.',
  },
  {
    id: 'amago_marcha_romper',
    name: 'Amago marcha y romper',
    displayName: 'Amago marcha y romper',
    category: 'combination',
    distanceCm: -35,
    timeToPerformMs: 2200,
    frequencyWeight: 6,
    isActive: true,
    soundCue: 'retreat',
    voiceText: '¡Amago marcha y romper!',
    isLunge: false,
    coachAlsoSpeaks: true,
    description: 'Finta o amago con el pie delantero simulando marcha y rápida ruptura atrás para provocar el ataque rival.',
  },
  {
    id: 'amago_romper_marcha_fondo',
    name: 'Amago romper, marcha y fondo',
    displayName: 'Amago romper, marcha y fondo',
    category: 'combination',
    distanceCm: 155,
    timeToPerformMs: 3500,
    frequencyWeight: 6,
    isActive: true,
    soundCue: 'lunge',
    voiceText: '¡Amago romper, marcha y fondo!',
    isLunge: true,
    coachAlsoSpeaks: true,
    description: 'Amago de repliegue hacia atrás para invitar al rival, seguido de marcha súbita y fondo decisivo.',
  },
];

export const DEFAULT_SETTINGS: WorkoutSettings = {
  workoutSpaceMeters: 5.0,
  minDelayMs: 1400, // 1.4 seconds min delay
  maxDelayMs: 2800, // 2.8 seconds max delay
  playRecoverSound: true,
  variableLungeDuration: true,
  lungeHoldTimeMs: 2200, // 2.2 seconds holding lunge before recover
  recoveryTimeMs: 1800, // 1.8 seconds to return to en-garde and settle
  multiStepBufferMs: 1200, // 1.2 seconds extra buffer on multi-step drills
  weaponEquipped: false,
  audioMode: 'voice', // Solo voz (sin beeps)
  countdownSeconds: 3,
  speechRate: 1.15, // Official FIE referee tempo
  speechPitch: 1.0, // Official FIE referee voice
  soundVolume: 1.0, // 100% volume locked
  keepScreenAwake: true,
  boutModeEnabled: false,
  boutPeriods: 3,
};

export const DEFAULT_COACH: VirtualCoachSettings = {
  enabled: true,
  frequencyActions: 6,
  stayLow: true,
  armPosition: true,
  relaxShoulders: true,
  straightBack: true,
  smallSteps: true,
  guardBalance: true,
  customTips: [
    {
      id: 'tip-fie-1',
      text: '¡Extiende el brazo armado antes de mover las piernas!',
      enabled: true,
    },
    {
      id: 'tip-fie-2',
      text: '¡Punta en línea amenazando el blanco en todo momento!',
      enabled: true,
    },
    {
      id: 'tip-fie-3',
      text: '¡No levantes los talones, mantén la base firme!',
      enabled: true,
    },
    {
      id: 'tip-fie-4',
      text: '¡Mantén las rodillas flexionadas y centro de gravedad bajo!',
      enabled: true,
    },
  ],
};

export const DEFAULT_REACTION: ReactionSettings = {
  mode: 'numbers',
  numbersList: [1, 2, 3, 4],
  customNumbersText: '1, 2, 3, 4',
  minDelayMs: 1200, // 1.2 seconds min
  maxDelayMs: 2500, // 2.5 seconds max
  audioMode: 'voice', // Solo voz (sin beeps)
  soundVolume: 1.0, // 100% volume
  speechRate: 1.2,
  countdownSeconds: 3,
  plastronMode: 'mixed',
  combinationMaxNumbers: 3,
};

const STORAGE_KEYS = {
  ACTIONS: 'ff_footwork_actions_v8',
  SETTINGS: 'ff_workout_settings_v8',
  COACH: 'ff_virtual_coach_v8',
  REACTION: 'ff_reaction_settings_v8',
  UI: 'ff_ui_state_v8',
};

export interface AppUIState {
  soundEnabled: boolean;
  currentTab: string;
}

export const DEFAULT_UI_STATE: AppUIState = {
  soundEnabled: true,
  currentTab: 'workout',
};

// Normalize and migrate old names if found in storage
function migrateAction(a: FootworkAction): FootworkAction {
  let updated = { ...a };

  // 1. Pisoton -> Balestra
  if (
    updated.id === 'pisoton' ||
    updated.name?.toLowerCase().includes('pisoton') ||
    updated.displayName?.toLowerCase().includes('pisoton') ||
    updated.displayName?.toLowerCase().includes('pisotón')
  ) {
    updated.id = 'balestra';
    updated.name = 'Balestra';
    updated.displayName = 'Balestra';
    updated.voiceText = '¡Balestra!';
    updated.description = 'Balestra de esgrima: salto rasante hacia adelante aterrizando en guardia.';
  }

  // 2. avance marcha -> paso adelante
  if (
    updated.name?.toLowerCase().includes('avance marcha') ||
    updated.displayName?.toLowerCase().includes('avance marcha')
  ) {
    updated.id = 'marcha_paso_adelante_marcha';
    updated.name = 'Marcha, paso adelante, marcha';
    updated.displayName = 'Marcha, paso adelante, marcha';
    updated.voiceText = '¡Marcha, paso adelante, marcha!';
  }

  // 3. avance atras -> paso atrás
  if (
    updated.name?.toLowerCase().includes('avance atras') ||
    updated.displayName?.toLowerCase().includes('avance atras') ||
    updated.name?.toLowerCase().includes('avance atrás') ||
    updated.displayName?.toLowerCase().includes('avance atrás')
  ) {
    updated.id = 'romper_paso_atras_romper';
    updated.name = 'Romper, paso atrás, romper';
    updated.displayName = 'Romper, paso atrás, romper';
    updated.voiceText = '¡Romper, paso atrás, romper!';
  }

  return updated;
}

export function loadSavedActions(): FootworkAction[] {
  if (typeof window === 'undefined') return DEFAULT_ACTIONS;
  try {
    const raw =
      localStorage.getItem(STORAGE_KEYS.ACTIONS) ||
      localStorage.getItem('ff_footwork_actions_v7');
    if (!raw) return DEFAULT_ACTIONS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const migratedList = parsed.map(migrateAction);
      const customActions = migratedList.filter((p: FootworkAction) => p.isCustom);
      const defaults = DEFAULT_ACTIONS.map((def) => {
        const found = migratedList.find((p: FootworkAction) => p.id === def.id);
        return found ? { ...def, ...found } : def;
      });
      return [...defaults, ...customActions];
    }
  } catch (e) {
    console.warn('Failed to load actions from storage:', e);
  }
  return DEFAULT_ACTIONS;
}

export function saveActions(actions: FootworkAction[]) {
  if (typeof window === 'undefined') return;
  try {
    const migrated = actions.map(migrateAction);
    localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(migrated));
  } catch (e) {
    console.error('Failed to save actions:', e);
  }
}

export function loadSavedSettings(): WorkoutSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw =
      localStorage.getItem(STORAGE_KEYS.SETTINGS) ||
      localStorage.getItem('ff_workout_settings_v7');
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      audioMode: 'voice', // Enforce voice only
      soundVolume: 1.0, // Enforce 100% volume
      speechPitch: 1.0, // Official referee pitch
      minDelayMs: typeof parsed.minDelayMs === 'number' ? parsed.minDelayMs : 1400,
      maxDelayMs: typeof parsed.maxDelayMs === 'number' ? parsed.maxDelayMs : 2800,
    };
  } catch (e) {
    console.warn('Failed to load settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: WorkoutSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function loadSavedCoach(): VirtualCoachSettings {
  if (typeof window === 'undefined') return DEFAULT_COACH;
  try {
    const raw =
      localStorage.getItem(STORAGE_KEYS.COACH) ||
      localStorage.getItem('ff_virtual_coach_v7');
    if (!raw) return DEFAULT_COACH;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_COACH,
      ...parsed,
      customTips: Array.isArray(parsed.customTips) ? parsed.customTips : DEFAULT_COACH.customTips,
    };
  } catch (e) {
    console.warn('Failed to load coach:', e);
  }
  return DEFAULT_COACH;
}

export function saveCoach(coach: VirtualCoachSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.COACH, JSON.stringify(coach));
  } catch (e) {
    console.error('Failed to save coach:', e);
  }
}

export function loadSavedReaction(): ReactionSettings {
  if (typeof window === 'undefined') return DEFAULT_REACTION;
  try {
    const raw =
      localStorage.getItem(STORAGE_KEYS.REACTION) ||
      localStorage.getItem('ff_reaction_settings_v7');
    if (!raw) return DEFAULT_REACTION;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_REACTION,
      ...parsed,
      audioMode: 'voice',
      soundVolume: 1.0,
      minDelayMs: typeof parsed.minDelayMs === 'number' ? parsed.minDelayMs : 1200,
      maxDelayMs: typeof parsed.maxDelayMs === 'number' ? parsed.maxDelayMs : 2500,
    };
  } catch (e) {
    console.warn('Failed to load reaction settings:', e);
  }
  return DEFAULT_REACTION;
}

export function saveReaction(reaction: ReactionSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.REACTION, JSON.stringify(reaction));
  } catch (e) {
    console.error('Failed to save reaction settings:', e);
  }
}

export function loadSavedUIState(): AppUIState {
  if (typeof window === 'undefined') return DEFAULT_UI_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UI);
    if (!raw) return DEFAULT_UI_STATE;
    const parsed = JSON.parse(raw);
    return {
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : DEFAULT_UI_STATE.soundEnabled,
      currentTab: typeof parsed.currentTab === 'string' ? parsed.currentTab : DEFAULT_UI_STATE.currentTab,
    };
  } catch (e) {
    console.warn('Failed to load UI state:', e);
  }
  return DEFAULT_UI_STATE;
}

export function saveUIState(ui: AppUIState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.UI, JSON.stringify(ui));
  } catch (e) {
    console.error('Failed to save UI state:', e);
  }
}

export function restoreAllDefaults(): {
  actions: FootworkAction[];
  settings: WorkoutSettings;
  coach: VirtualCoachSettings;
  reaction: ReactionSettings;
  ui: AppUIState;
} {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.ACTIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.COACH);
    localStorage.removeItem(STORAGE_KEYS.REACTION);
    localStorage.removeItem(STORAGE_KEYS.UI);
    localStorage.removeItem('ff_footwork_actions_v7');
    localStorage.removeItem('ff_workout_settings_v7');
    localStorage.removeItem('ff_virtual_coach_v7');
    localStorage.removeItem('ff_reaction_settings_v7');
  }
  return {
    actions: DEFAULT_ACTIONS,
    settings: DEFAULT_SETTINGS,
    coach: DEFAULT_COACH,
    reaction: DEFAULT_REACTION,
    ui: DEFAULT_UI_STATE,
  };
}
