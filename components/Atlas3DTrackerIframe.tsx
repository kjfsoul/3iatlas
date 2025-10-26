'use client';

import { useMemo } from 'react';

type Props = { autoPlay?: boolean; initialSpeed?: number; initialViewMode?: 'true-scale'|'ride-atlas'; };

export default function Atlas3DTrackerIframe(_props: Props) {
  const alias = (process.env.NEXT_PUBLIC_TRACKER_ALIAS || 'https://tracker.3iatlas.mysticarcana.com').trim();
  const canonical = (process.env.NEXT_PUBLIC_TRACKER_CANONICAL || '').trim();

  const src = useMemo(() => {
    const dev = 'http://localhost:5173';
    if (typeof window === 'undefined') return process.env.NODE_ENV === 'development' ? dev : alias;
      const here = window.location.hostname;
      const aliasHost = new URL(alias).hostname;
      const canonicalHost = canonical ? new URL(canonical).hostname : "";

      if (process.env.NODE_ENV === "development") return dev;
      // If we're already on the alias host, use the canonical to avoid self-embedding.
      if (canonical && here === aliasHost) return canonical;
      // Otherwise always embed the alias (so we never iframe *.vercel.app).
      return alias;
  }, [alias, canonical]);

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
