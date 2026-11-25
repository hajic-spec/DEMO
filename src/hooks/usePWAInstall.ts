import { useCallback, useEffect, useState } from 'react';

import { isPwaInstallAllowed } from '../utils/accessControl';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const pwaAllowed = isPwaInstallAllowed();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !pwaAllowed) return;

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone);

    const ua = window.navigator.userAgent;
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowIOSInstructions(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [pwaAllowed]);

  const promptInstall = useCallback(async () => {
    if (!pwaAllowed) return;
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      return;
    }
    if (isIOS) {
      setShowIOSInstructions(true);
    }
  }, [deferredPrompt, isIOS, pwaAllowed]);

  const canShowInstall = pwaAllowed && !isInstalled && (Boolean(deferredPrompt) || isIOS);

  return {
    pwaAllowed,
    isInstalled,
    isIOS: pwaAllowed && isIOS,
    canInstallNative: pwaAllowed && Boolean(deferredPrompt),
    canShowInstall,
    showIOSInstructions: pwaAllowed && showIOSInstructions,
    setShowIOSInstructions,
    promptInstall,
  };
}
