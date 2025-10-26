'use client';

import { useMemo } from 'react';

type Props = { autoPlay?: boolean; initialSpeed?: number; initialViewMode?: 'true-scale'|'ride-atlas'; };

export default function Atlas3DTrackerIframe(_props: Props) {
  const src = useMemo(() => {
    if (typeof window === 'undefined') {
      return 'https://tracker.3iatlas.mysticarcana.com';
    }
    
    const here = window.location.hostname;
    
    // Development check
    if (process.env.NODE_ENV === 'development' || here.includes('localhost')) {
      return 'http://localhost:5173';
    }
    
    // HARDCODE to prevent ANY recursion
    // Always use the tracker domain, NEVER embed the main site
    return 'https://tracker.3iatlas.mysticarcana.com';
  }, []);

  return (
    <iframe
      src={src}
      title="3I/ATLAS Flight Tracker"
      className="w-full aspect-[16/9] rounded-xl border border-neutral-700 shadow-sm"
      allow="fullscreen; autoplay; xr-spatial-tracking"
      sandbox="allow-scripts allow-same-origin allow-popups"
    />
  );
}
