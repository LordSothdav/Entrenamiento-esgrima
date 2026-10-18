import React from 'react';
import { Play, Sliders, Settings, Award, Zap } from 'lucide-react';

export type NavTab = 'workout' | 'reaction' | 'actions' | 'coach' | 'settings' | 'help';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isWorkoutRunning: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  isWorkoutRunning,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'workout',
      label: 'Movimientos',
      icon: <Play className={`w-5 h-5 text-emerald-400 fill-emerald-400 ${isWorkoutRunning ? 'animate-pulse' : ''}`} />,
      color: 'text-emerald-400',
    },
    {
      id: 'reaction',
      label: 'Plastron',
      icon: <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />,
      color: 'text-yellow-400',
    },
    {
      id: 'actions',
      label: 'Acciones',
      icon: <Sliders className="w-5 h-5 text-cyan-400 fill-cyan-400" />,
      color: 'text-cyan-400',
    },
    {
      id: 'coach',
      label: 'Entrenador',
      icon: <Award className="w-5 h-5 text-purple-400 fill-purple-400" />,
      color: 'text-purple-400',
    },
    {
      id: 'settings',
      label: 'Ajustes',
      icon: <Settings className="w-5 h-5 text-rose-400 fill-rose-400" />,
      color: 'text-rose-400',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-lg border-t border-zinc-900 px-3 py-1.5 pb-safe">
      <div className="w-full max-w-lg mx-auto grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-150 cursor-pointer ${
                isActive
                  ? `${tab.color} font-bold bg-zinc-900/90 border border-zinc-800/90 shadow-xs`
                  : 'text-zinc-500 hover:text-zinc-300 font-medium'
              }`}
            >
              <div className={`p-1 rounded-lg transition-transform ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]' : 'opacity-90'}`}>
                {tab.icon}
              </div>
              <span className="text-[9px] sm:text-[10px] tracking-tight leading-tight text-center px-0.5 line-clamp-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
