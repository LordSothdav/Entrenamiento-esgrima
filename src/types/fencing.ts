export type ActionCategory = 'advance' | 'retreat' | 'lunge' | 'combination' | 'custom';

export type ReactionIntervalMode = 'quick' | 'medium' | 'long' | 'custom';

export type AudioMode = 'voice' | 'beep' | 'both' | 'silent';

export interface FootworkAction {
  id: string;
  name: string;
  displayName: string; // Spanish localized title
  category: ActionCategory;
  distanceCm: number; // Distance change in cm (+ forward, - backward)
  timeToPerformMs: number; // Duration to execute
  frequencyWeight: number; // Relative weight for probability (1 - 10)
  isActive: boolean;
  soundCue: string; // Sound identifier
  voiceText: string; // Spanish spoken text
  description?: string;
  isLunge?: boolean;
  isCustom?: boolean; // User created action
  coachAlsoSpeaks?: boolean; // Whether the virtual coach can also call this out
}

export interface WorkoutSettings {
  workoutSpaceMeters: number; // Space available in meters (e.g. 5m)
  reactionMode?: ReactionIntervalMode;
  minDelayMs: number; // Minimum random delay between actions (ms)
  maxDelayMs: number; // Maximum random delay between actions (ms)
  playRecoverSound: boolean;
  variableLungeDuration: boolean;
  lungeHoldTimeMs: number; // Time held in lunge before recover (e.g. 2200ms)
  recoveryTimeMs: number; // Time given to return to guard before next action (e.g. 1800ms)
  multiStepBufferMs: number; // Extra time given to compound / multi-step actions (e.g. 1200ms)
  weaponEquipped: boolean;
  audioMode: AudioMode; // 'voice'
  countdownSeconds: number;
  speechRate: number; // 0.9 - 1.5
  speechPitch: number; // 1.0
  soundVolume: number; // 1.0 (Locked at 100%)
  keepScreenAwake: boolean;
  // Modo Asalto FIE oficial (3 min trabajo + 1 min descanso)
  boutModeEnabled?: boolean;
  boutPeriods?: number; // 1, 2 o 3 periodos (por defecto 3 para eliminación directa)
}

export interface CustomCoachTip {
  id: string;
  text: string;
  enabled: boolean;
}

export interface VirtualCoachSettings {
  enabled: boolean;
  frequencyActions: number; // Every X actions
  stayLow: boolean; // ¡Mantente abajo!
  armPosition: boolean; // ¡Posición del brazo!
  relaxShoulders: boolean; // ¡Relaja los hombros!
  straightBack: boolean; // ¡Espalda recta!
  smallSteps: boolean; // ¡Pasos cortos y controlados!
  guardBalance: boolean; // ¡Equilibrio en la guardia!
  customTips: CustomCoachTip[];
}

export type PlastronCallMode = 'singles' | 'combinations' | 'feints' | 'mixed';

export interface ReactionSettings {
  mode: 'numbers' | 'beeps';
  numbersList: number[]; // e.g. [1, 2, 3, 4]
  customNumbersText: string; // "1, 2, 3, 4"
  intervalMode?: ReactionIntervalMode;
  minDelayMs: number; // Minimum random delay between numbers (ms)
  maxDelayMs: number; // Maximum random delay between numbers (ms)
  audioMode: AudioMode;
  soundVolume: number;
  speechRate: number;
  countdownSeconds: number;
  // Plastron combinaciones y fintas
  plastronMode?: PlastronCallMode; // 'singles' | 'combinations' | 'feints' | 'mixed'
  combinationMaxNumbers?: number; // 2 o 3 números por combinación
}

export interface WorkoutStats {
  totalActions: number;
  totalTimeSeconds: number;
  totalDistanceMeters: number;
  actionsBreakdown: Record<string, number>;
  lungesCount: number;
}
