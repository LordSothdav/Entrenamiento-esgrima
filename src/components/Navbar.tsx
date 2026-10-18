import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2, Volume2, VolumeX, Swords, HelpCircle } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ soundEnabled, onToggleSound, onOpenHelp }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (e) {
      console.warn('Fullscreen request denied or not supported:', e);
    }
  };

  const handleTestSound = () => {
    onToggleSound();
  };

  return (
    <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-zinc-900 px-4 py-3 pt-safe flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-blue-950">
          <Swords className="w-5 h-5 text-yellow-300 transform -rotate-12" />
        </div>
        <div>
          <h1 className="text-base font-black tracking-tight text-white">
            Esgrima Footwork
          </h1>
          <p className="text-[10px] text-zinc-400 font-medium">Entrenamiento móvil</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <PWAInstallButton compact={true} />
        <button
          onClick={handleTestSound}
          title={soundEnabled ? "Silenciar audio" : "Activar audio"}
          className={`p-2 rounded-xl border transition cursor-pointer ${
            soundEnabled
              ? "bg-zinc-950 border-zinc-800 text-blue-400 hover:bg-zinc-900"
              : "bg-black/80 border-zinc-900 text-zinc-600 hover:text-zinc-400"
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
        <button
          onClick={onOpenHelp}
          title="Ayuda y guía"
          className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
