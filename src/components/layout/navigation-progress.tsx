'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Lors d'un changement d'URL, faire clignoter brièvement la barre
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 180);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0F2C59] via-[#D4AF37] to-[#0F2C59] animate-pulse z-50 transition-all duration-300" />
  );
}
