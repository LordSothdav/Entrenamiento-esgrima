import { useState, useEffect } from 'react';
import {
  FootworkAction,
  WorkoutSettings,
  VirtualCoachSettings,
  WorkoutStats,
  ReactionSettings,
} from './types/fencing';
import {
  loadSavedActions,
  saveActions,
  loadSavedSettings,
  saveSettings,
  loadSavedCoach,
  saveCoach,
  loadSavedReaction,
  saveReaction,
  loadSavedUIState,
  saveUIState,
  restoreAllDefaults,
} from './services/storage';
import { soundEngine } from './services/soundEngine';
import { useWakeLock } from './hooks/useWakeLock';
import { Navbar } from './components/Navbar';
import { BottomNav, NavTab } from './components/BottomNav';
import { WorkoutView } from './components/WorkoutView';
import { ReactionView } from './components/ReactionView';
import { ActionsEditorView } from './components/ActionsEditorView';
import { SettingsView } from './components/SettingsView';
import { CoachSettingsView } from './components/CoachSettingsView';
import { HelpModal } from './components/HelpModal';
import { SummaryModal } from './components/SummaryModal';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [actions, setActions] = useState<FootworkAction[]>(loadSavedActions);
  const [settings, setSettings] = useState<WorkoutSettings>(loadSavedSettings);
  const [coach, setCoach] = useState<VirtualCoachSettings>(loadSavedCoach);
  const [reactionSettings, setReactionSettings] = useState<ReactionSettings>(loadSavedReaction);

  // Saved UI preferences
  const initialUI = loadSavedUIState();
  const [currentTab, setCurrentTab] = useState<NavTab>((initialUI.currentTab as NavTab) || 'workout');
  const [completedStats, setCompletedStats] = useState<WorkoutStats | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(initialUI.soundEnabled);
  const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(false);

  // Keep screen awake during workout if setting is active
  useWakeLock(settings.keepScreenAwake);

  // Sync volume with sound engine
  useEffect(() => {
    soundEngine.setVolume(settings.soundVolume);
  }, [settings.soundVolume]);

  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      saveUIState({ soundEnabled: next, currentTab });
      return next;
    });
  };

  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    saveUIState({ soundEnabled, currentTab: tab });
  };

  const handleUpdateAction = (updated: FootworkAction) => {
    const next = actions.map((a) => (a.id === updated.id ? updated : a));
    setActions(next);
    saveActions(next);
  };

  const handleAddAction = (newAction: FootworkAction) => {
    const next = [...actions, newAction];
    setActions(next);
    saveActions(next);
  };

  const handleDeleteAction = (actionId: string) => {
    const next = actions.filter((a) => a.id !== actionId);
    setActions(next);
    saveActions(next);
  };

  const handleUpdateSettings = (newSettings: WorkoutSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleUpdateCoach = (newCoach: VirtualCoachSettings) => {
    setCoach(newCoach);
    saveCoach(newCoach);
  };

  const handleUpdateReaction = (newReaction: ReactionSettings) => {
    setReactionSettings(newReaction);
    saveReaction(newReaction);
  };

  const handleRestoreAll = () => {
    if (confirm('¿Deseas restablecer todas las acciones, tiempos y ajustes a los valores iniciales?')) {
      const restored = restoreAllDefaults();
      setActions(restored.actions);
      setSettings(restored.settings);
      setCoach(restored.coach);
      setReactionSettings(restored.reaction);
      setSoundEnabled(restored.ui.soundEnabled);
      setCurrentTab(restored.ui.currentTab as NavTab);
    }
  };

  const handleFinishWorkout = (stats: WorkoutStats) => {
    setCompletedStats(stats);
    setIsWorkoutActive(false);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Offline Status Toast */}
      <OfflineIndicator />

      {/* Main Mobile App Container with sleek midnight dark borders */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col min-h-screen relative shadow-2xl bg-black border-x border-zinc-900">
        {/* Mobile Header Bar */}
        <Navbar
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onOpenHelp={() => handleSelectTab('help')}
        />

        {/* Dynamic Tab Body */}
        <main className="flex-1 px-3.5 pt-2">
          {currentTab === 'workout' && (
            <WorkoutView
              actions={actions}
              settings={settings}
              coach={coach}
              soundEnabled={soundEnabled}
              onUpdateSettings={handleUpdateSettings}
              onFinishWorkout={handleFinishWorkout}
              onGoToActions={() => handleSelectTab('actions')}
              onGoToSettings={() => handleSelectTab('settings')}
            />
          )}

          {currentTab === 'reaction' && (
            <ReactionView
              settings={reactionSettings}
              onUpdateSettings={handleUpdateReaction}
              soundEnabled={soundEnabled}
            />
          )}

          {currentTab === 'actions' && (
            <ActionsEditorView
              actions={actions}
              onUpdateAction={handleUpdateAction}
              onAddAction={handleAddAction}
              onDeleteAction={handleDeleteAction}
              onRestoreDefaults={handleRestoreAll}
              soundVolume={settings.soundVolume}
            />
          )}

          {currentTab === 'coach' && (
            <CoachSettingsView
              coach={coach}
              onUpdateCoach={handleUpdateCoach}
              onRestoreDefaults={handleRestoreAll}
              soundVolume={settings.soundVolume}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onRestoreDefaults={handleRestoreAll}
            />
          )}

          {currentTab === 'help' && <HelpModal />}
        </main>

        {/* Android Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          isWorkoutRunning={isWorkoutActive}
        />
      </div>

      {/* Workout Summary Modal */}
      {completedStats && (
        <SummaryModal
          stats={completedStats}
          onClose={() => setCompletedStats(null)}
          onRestart={() => {
            setCompletedStats(null);
            handleSelectTab('workout');
          }}
        />
      )}
    </div>
  );
}
