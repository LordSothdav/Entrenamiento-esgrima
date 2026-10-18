import { FootworkAction, WorkoutSettings, VirtualCoachSettings } from '../types/fencing';

export interface NextActionPlan {
  action: FootworkAction;
  delayBeforeActionMs: number;
  newPositionCm: number;
  coachAdvice?: string;
  lungeHoldDurationMs?: number;
}

export const COACH_TIPS = {
  stayLow: '¡Mantén las rodillas flexionadas y centro de gravedad bajo!',
  armPosition: '¡Brazo armado preparado, punta apuntando al objetivo!',
  relaxShoulders: '¡Relaja los hombros y mantén la fluidez!',
  straightBack: '¡Tronco erguido, no te inclines hacia adelante!',
  smallSteps: '¡Pasos de esgrima precisos, nunca juntes los talones!',
  guardBalance: '¡Distribuye el peso 50/50 entre ambas piernas en guardia!',
};

export class FootworkEngine {
  private currentPositionCm: number = 250; // starts in center of 5m
  private totalSpaceCm: number = 500;
  private actionsHistory: FootworkAction[] = [];
  private consecutiveLunges: number = 0;

  constructor(spaceMeters: number) {
    this.setSpace(spaceMeters);
  }

  public setSpace(spaceMeters: number) {
    this.totalSpaceCm = Math.max(150, Math.round(spaceMeters * 100));
    this.currentPositionCm = Math.round(this.totalSpaceCm / 2);
    this.actionsHistory = [];
    this.consecutiveLunges = 0;
  }

  public resetPosition() {
    this.currentPositionCm = Math.round(this.totalSpaceCm / 2);
    this.actionsHistory = [];
    this.consecutiveLunges = 0;
  }

  public getPositionCm(): number {
    return this.currentPositionCm;
  }

  public getTotalSpaceCm(): number {
    return this.totalSpaceCm;
  }

  public validateActions(actions: FootworkAction[]): { valid: boolean; error?: string } {
    const active = actions.filter((a) => a.isActive);
    if (active.length === 0) {
      return { valid: false, error: 'No hay ninguna acción activada. Activa al menos dos acciones.' };
    }
    const hasForward = active.some((a) => a.distanceCm > 0);
    const hasBackward = active.some((a) => a.distanceCm < 0);
    if (!hasForward || !hasBackward) {
      return {
        valid: false,
        error: 'Se requiere al menos una acción hacia adelante y una hacia atrás para entrenar en la pista.',
      };
    }
    return { valid: true };
  }

  public getNextAction(
    actions: FootworkAction[],
    settings: WorkoutSettings,
    coach: VirtualCoachSettings,
    actionIndex: number
  ): NextActionPlan | null {
    const active = actions.filter((a) => a.isActive);
    if (active.length === 0) return null;

    // Safety margin from physical walls (e.g. 20 cm)
    const marginCm = 20;
    const minCm = marginCm;
    const maxCm = this.totalSpaceCm - marginCm;

    // Candidates that fit inside current position
    let candidates = active.filter((a) => {
      // Avoid 2 consecutive pure lunges in standard footwork unless space is huge
      if (a.isLunge && this.consecutiveLunges >= 1) return false;
      const targetPos = this.currentPositionCm + a.distanceCm;
      return targetPos >= minCm && targetPos <= maxCm;
    });

    // If no candidate fits (cornered against wall), force reverse actions
    if (candidates.length === 0) {
      if (this.currentPositionCm > this.totalSpaceCm / 2) {
        // Move backward
        candidates = active.filter((a) => a.distanceCm < 0);
      } else {
        // Move forward
        candidates = active.filter((a) => a.distanceCm > 0);
      }
    }

    // Fallback if still empty
    if (candidates.length === 0) {
      candidates = active;
    }

    // Weighted random selection
    const totalWeight = candidates.reduce((sum, a) => sum + Math.max(1, a.frequencyWeight), 0);
    let randomVal = Math.random() * totalWeight;
    let selected = candidates[0];

    for (const c of candidates) {
      randomVal -= Math.max(1, c.frequencyWeight);
      if (randomVal <= 0) {
        selected = c;
        break;
      }
    }

    // Calculate delay before action: random number between user-selected min and max
    const minDelay = Math.max(300, Math.min(settings.minDelayMs ?? 1500, settings.maxDelayMs ?? 3000));
    const maxDelay = Math.max(minDelay, Math.max(settings.minDelayMs ?? 1500, settings.maxDelayMs ?? 3000));
    const delayMs = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

    // Calculate new position
    const nextPos = Math.max(0, Math.min(this.totalSpaceCm, this.currentPositionCm + selected.distanceCm));
    this.currentPositionCm = nextPos;

    if (selected.isLunge) {
      this.consecutiveLunges++;
    } else {
      this.consecutiveLunges = 0;
    }

    this.actionsHistory.push(selected);

    // Lunge hold duration (comfortable time holding the lunge before recover)
    let lungeHoldDurationMs: number | undefined = undefined;
    if (selected.isLunge) {
      const baseHold = settings.lungeHoldTimeMs || 2200;
      if (settings.variableLungeDuration) {
        // Realistic variation of +/- 400ms around base
        const jitter = Math.floor(Math.random() * 800) - 400;
        lungeHoldDurationMs = Math.max(1200, baseHold + jitter);
      } else {
        lungeHoldDurationMs = baseHold;
      }
    }

    // Virtual coach tip trigger
    let coachAdvice: string | undefined = undefined;
    if (coach.enabled && coach.frequencyActions > 0 && actionIndex > 0 && actionIndex % coach.frequencyActions === 0) {
      const activeTips: string[] = [];
      if (coach.stayLow) activeTips.push(COACH_TIPS.stayLow);
      if (coach.armPosition) activeTips.push(COACH_TIPS.armPosition);
      if (coach.relaxShoulders) activeTips.push(COACH_TIPS.relaxShoulders);
      if (coach.straightBack) activeTips.push(COACH_TIPS.straightBack);
      if (coach.smallSteps) activeTips.push(COACH_TIPS.smallSteps);
      if (coach.guardBalance) activeTips.push(COACH_TIPS.guardBalance);

      // Add user custom tips
      if (Array.isArray(coach.customTips)) {
        coach.customTips.filter((t) => t.enabled).forEach((t) => activeTips.push(t.text));
      }

      // Add actions marked as coachAlsoSpeaks
      actions.filter((a) => a.isActive && a.coachAlsoSpeaks).forEach((a) => {
        activeTips.push(`¡Recuerda: ${a.displayName}!`);
      });

      if (activeTips.length > 0) {
        coachAdvice = activeTips[Math.floor(Math.random() * activeTips.length)];
      }
    }

    return {
      action: selected,
      delayBeforeActionMs: delayMs,
      newPositionCm: this.currentPositionCm,
      coachAdvice,
      lungeHoldDurationMs,
    };
  }
}
