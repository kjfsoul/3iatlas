'use client';

const PROD = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
const PROD_TRACKER = 'https://tracker.3iatlas.mysticarcana.com';
const DEV_TRACKER = 'http://localhost:5173';

type Props = { autoPlay?: boolean; initialSpeed?: number; initialViewMode?: 'true-scale'|'ride-atlas'; };

export default function Atlas3DTrackerIframe(_props: Props) {
  const src = PROD ? PROD_TRACKER : DEV_TRACKER;

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
