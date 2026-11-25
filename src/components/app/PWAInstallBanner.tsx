import React from 'react';
import { Download, Share, PlusSquare, WifiOff, X } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      className="bg-[#9C7228] text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>
        Mode hors-ligne actif (zone blanche) — Vos relevés et devis restent enregistrés localement.
      </span>
    </div>
  );
};

export const PWAInstallModalAndButton: React.FC = () => {
  const {
    isInstalled,
    canInstallNative,
    isIOS,
    showIOSInstructions,
    setShowIOSInstructions,
    promptInstall,
  } = usePWAInstall();

  if (isInstalled) {
    return null;
  }

  return (
    <>
      {(canInstallNative || isIOS) && (
        <button
          type="button"
          onClick={promptInstall}
          className="inline-flex items-center gap-1.5 px-3 min-h-[36px] rounded bg-[#B5893A] text-white text-xs font-semibold hover:bg-[#9C7228] transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Installer</span>
        </button>
      )}

      {showIOSInstructions && (
        <div
          className="fixed inset-0 z-50 bg-[#091B12]/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-install-title"
          onClick={() => setShowIOSInstructions(false)}
        >
          <div
            className="bg-white text-[#1A211D] rounded-xl max-w-sm w-full p-6 shadow-2xl border border-[#E5DEC9]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 id="ios-install-title" className="font-serif text-2xl font-semibold text-[#0E281B]">
                Installer ReliefApp sur iPhone
              </h3>
              <button
                type="button"
                onClick={() => setShowIOSInstructions(false)}
                aria-label="Fermer"
                className="w-9 h-9 rounded-full bg-[#F3EFE5] border border-[#E5DEC9] inline-flex items-center justify-center text-[#0E281B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-[#3E4A43] mb-4 leading-relaxed">
              Ajoutez l’application directement sur votre écran d’accueil pour l’utiliser en mode
              plein écran et sans connexion sur les restanques :
            </p>
            <ol className="space-y-3 text-sm text-[#1A211D] mb-5">
              <li className="flex items-center gap-3">
                <span className="w-7 h-7 rounded bg-[#F3EFE5] text-[#0E281B] font-mono text-xs font-semibold inline-flex items-center justify-center shrink-0">
                  1
                </span>
                <span>
                  Touchez le bouton <strong>Partager</strong>{' '}
                  <Share className="w-4 h-4 inline text-[#9C7228] mx-0.5" /> en bas de Safari.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-7 h-7 rounded bg-[#F3EFE5] text-[#0E281B] font-mono text-xs font-semibold inline-flex items-center justify-center shrink-0">
                  2
                </span>
                <span>
                  Sélectionnez <strong>Sur l’écran d’accueil</strong>{' '}
                  <PlusSquare className="w-4 h-4 inline text-[#9C7228] mx-0.5" />.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-7 h-7 rounded bg-[#F3EFE5] text-[#0E281B] font-mono text-xs font-semibold inline-flex items-center justify-center shrink-0">
                  3
                </span>
                <span>
                  Validez par <strong>Ajouter</strong> en haut à droite.
                </span>
              </li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIOSInstructions(false)}
              className="w-full min-h-[44px] rounded bg-[#0E281B] text-[#EBD9B3] text-sm font-semibold"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </>
  );
};
