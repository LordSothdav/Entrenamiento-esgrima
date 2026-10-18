import React from 'react';
import { Smartphone, Shield, Swords, Ruler, CheckCircle2, Zap, Plus } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export const HelpModal: React.FC = () => {
  return (
    <div className="space-y-4 pb-24 text-zinc-200">
      {/* Hero card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-blue-950 via-zinc-950 to-black border border-blue-500/20 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
            <Swords className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">Esgrima Footwork en tu Móvil</h2>
            <p className="text-xs text-zinc-400">Guía completa de uso y entrenamiento</p>
          </div>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed mt-2">
          Esta aplicación está diseñada para que tiradores de florete, espada y sable puedan entrenar la agilidad, coordinación y velocidad de reacción de piernas en cualquier lugar, adaptándose al espacio real de su casa.
        </p>
        <div className="mt-3">
          <PWAInstallButton compact={false} />
        </div>
      </div>

      {/* 1. Android Installation Guide */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-2.5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          Instalar como App en Android
        </h3>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Para disfrutar de la mejor experiencia (pantalla completa, sin barras del navegador y funcionando sin conexión):
        </p>
        <ul className="space-y-1.5 text-xs text-zinc-300 pl-1">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>Presiona el botón verde <strong>"Instalar en Android"</strong> o el menú de tres puntos de Google Chrome y pulsa <strong>"Instalar aplicación"</strong> o <strong>"Añadir a la pantalla de inicio"</strong>.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>Se creará un icono en tu móvil que abre la app a pantalla completa e instantáneamente.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>La app funciona <strong>100% offline</strong>: puedes entrenar sin WiFi ni datos móviles en cualquier pabellón o parque.</span>
          </li>
        </ul>
      </div>

      {/* 2. Plastron Mode */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-2.5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          Modo Plastron (Combinaciones y Fintas)
        </h3>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Diseñado para entrenar la precisión, rapidez de toque y fintas en plastron o muñeco:
        </p>
        <div className="text-xs text-zinc-300 space-y-1.5 bg-black/60 p-3 rounded-xl border border-zinc-850">
          <p>• <strong>Combinaciones rápidas (2 o 3 números):</strong> El árbitro dicta dos o tres números seguidos (ej. "¡Uno, tres!" o "¡Dos, uno, cuatro!") para ejecutar estocadas consecutivas a máxima velocidad.</p>
          <p>• <strong>Fintas y tocado:</strong> Añade órdenes con la palabra finta (ej. "¡Finta al dos!" o "¡Finta al uno, cuatro!") para engañar al rival y rematar en la diana elegida.</p>
          <p>• <strong>Modo Mixto o Específico:</strong> Elige entrenar solo combinaciones, solo fintas, números simples o el modo mixto realista.</p>
          <p>• <strong>Ritmo aleatorio entre dos valores:</strong> Ajusta el intervalo mínimo y máximo de tiempo entre llamadas.</p>
        </div>
      </div>

      {/* 3. Modo Asalto FIE */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-2.5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          Modo Asalto Oficial FIE (3m combate + 1m descanso)
        </h3>
        <p className="text-xs text-zinc-300 leading-relaxed">
          En <strong>Movimientos</strong> puedes activar el <em>Modo Asalto FIE</em>:
        </p>
        <ul className="space-y-1 text-xs text-zinc-300 pl-4 list-disc">
          <li>Temporizador reglamentario de <strong>3 minutos de combate continuo</strong>.</li>
          <li>Aviso oficial del árbitro: <em>"¡Alto! Minuto de descanso"</em> al concluir los 3 minutos.</li>
          <li>Fase de <strong>descanso de 60 segundos</strong> con cuenta atrás y aviso reglamentario a los 10 segundos (<em>"¡A la pista! Prepararse"</em>).</li>
          <li>Configurable en 1, 2 o 3 periodos (formato oficial de eliminación directa FIE).</li>
        </ul>
      </div>

      {/* 4. Custom Actions & Coach */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-2.5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-400" />
          Añadir tus propias acciones y consejos
        </h3>
        <ul className="space-y-1 text-xs text-zinc-300 pl-4 list-disc">
          <li>En la pestaña <strong>Acciones</strong>, pulsa <strong>"+ Añadir Nueva Acción"</strong> para crear cualquier movimiento (ej. "Fondo al brazo", "Flecha") con su distancia y frase de voz.</li>
          <li>Puedes marcar la casilla <em>"El entrenador virtual también la dirá"</em> para que tu entrenador la recuerde durante el asalto.</li>
          <li>En la pestaña <strong>Entrenador</strong>, pulsa <strong>"+ Añadir Frase o Consejo"</strong> para que el entrenador repita tus frases técnicas personalizadas.</li>
        </ul>
      </div>

      {/* 5. Space & Limits Calculation */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-2.5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Ruler className="w-4 h-4 text-blue-400" />
          ¿Cómo calcula el espacio la app?
        </h3>
        <p className="text-xs text-zinc-300 leading-relaxed">
          En la pestaña <strong>Ajustes</strong> puedes indicar cuántos metros libres tienes (por ejemplo: 3m en una habitación, 5m en el salón, o 14m en una pista oficial).
        </p>
        <div className="text-xs text-zinc-300 space-y-1.5 bg-black/60 p-3 rounded-xl border border-zinc-850">
          <p>• Comienzas colocado en el <strong>centro de tu pista</strong> en posición de guardia.</p>
          <p>• El algoritmo inteligente comprueba en cada segundo tu posición exacta: <strong>nunca te pedirá avanzar si estás cerca de la pared delantera</strong>, ni retroceder si estás cerca de la pared trasera.</p>
          <p>• La barra superior te muestra en tiempo real tu posición actual entre los límites.</p>
        </div>
      </div>

      {/* 6. Tips for safe training */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-2">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-yellow-400" />
          Consejos de seguridad
        </h3>
        <ul className="text-xs text-zinc-300 space-y-1 list-disc pl-4">
          <li>Utiliza zapatillas de esgrima o deportivas con buen agarre para evitar resbalar.</li>
          <li>Asegúrate de retirar objetos o alfombras que puedan causar tropiezos.</li>
          <li>Haz 5 minutos de calentamiento articular de tobillos, rodillas y cadera antes de empezar.</li>
        </ul>
      </div>
    </div>
  );
};
