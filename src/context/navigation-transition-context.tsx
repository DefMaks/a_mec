'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface NavigationTransitionContextType {
  isNavigating: boolean;
  pendingPath: string | null;
  progress: number;
  startNavigation: (href: string) => void;
  endNavigation: () => void;
}

const NavigationTransitionContext = createContext<NavigationTransitionContextType>({
  isNavigating: false,
  pendingPath: null,
  progress: 0,
  startNavigation: () => {},
  endNavigation: () => {},
});

export function NavigationTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isNavigating, setIsNavigating] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const finishTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = useCallback(() => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
  }, []);

  const startNavigation = useCallback((href: string) => {
    clearAllTimers();

    let targetPath = href;
    try {
      if (href.startsWith('http://') || href.startsWith('https://')) {
        const u = new URL(href);
        targetPath = u.pathname;
      } else {
        const u = new URL(href, 'http://localhost');
        targetPath = u.pathname;
      }
    } catch {
      targetPath = href;
    }

    setIsNavigating(true);
    setPendingPath(targetPath);
    setProgress(25);

    // Progression fluide & dynamique pour donner un retour immédiat
    let currentProgress = 25;
    progressTimerRef.current = setInterval(() => {
      if (currentProgress < 60) {
        currentProgress += 12;
      } else if (currentProgress < 80) {
        currentProgress += 5;
      } else if (currentProgress < 92) {
        currentProgress += 1.5;
      }
      setProgress(Math.min(currentProgress, 92));
    }, 120);

    // Timeout de sécurité en cas de navigation avortée ou d'erreur
    safetyTimeoutRef.current = setTimeout(() => {
      endNavigation();
    }, 5000);
  }, [clearAllTimers]);

  const endNavigation = useCallback(() => {
    clearAllTimers();
    setProgress(100);

    finishTimerRef.current = setTimeout(() => {
      setIsNavigating(false);
      setPendingPath(null);
      setProgress(0);
    }, 240);
  }, [clearAllTimers]);

  // Détection automatique de la fin du chargement lors de la mutation de l'URL
  useEffect(() => {
    endNavigation();
  }, [pathname, searchParams, endNavigation]);

  // Intercepteur global de clics sur les liens internes
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      // Ignorer les clics spéciaux (bouton du milieu, touches Ctrl / Cmd / Shift, etc.)
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as HTMLElement)?.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Ignorer les cibles externes ou actions JavaScript / mail / tel
      if (
        anchor.getAttribute('target') === '_blank' ||
        anchor.hasAttribute('download') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:')
      ) {
        return;
      }

      try {
        const url = new URL(href, window.location.href);
        // Vérifier qu'il s'agit bien du même domaine / application
        if (url.origin !== window.location.origin) return;

        const currentFull = window.location.pathname + window.location.search;
        const targetFull = url.pathname + url.search;

        // Si l'URL cible est identique à la page courante, ne rien déclencher
        if (currentFull === targetFull) return;

        // Déclencher immédiatement l'effet de transition au clic source
        startNavigation(url.pathname);
      } catch {
        // En cas d'URL invalide, ignorer
      }
    };

    document.addEventListener('click', handleGlobalClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleGlobalClick, { capture: true });
      clearAllTimers();
    };
  }, [startNavigation, clearAllTimers]);

  return (
    <NavigationTransitionContext.Provider
      value={{
        isNavigating,
        pendingPath,
        progress,
        startNavigation,
        endNavigation,
      }}
    >
      {children}
    </NavigationTransitionContext.Provider>
  );
}

export function useNavigationLoading() {
  const context = useContext(NavigationTransitionContext);
  if (!context) {
    throw new Error('useNavigationLoading must be used within NavigationTransitionProvider');
  }
  return context;
}
