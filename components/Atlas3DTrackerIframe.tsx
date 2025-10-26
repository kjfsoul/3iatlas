'use client';

const PROD_TRACKER = 'https://tracker.3iatlas.mysticarcana.com';
const DEV_TRACKER = 'http://localhost:5173';

type Props = { autoPlay?: boolean; initialSpeed?: number; initialViewMode?: 'true-scale'|'ride-atlas'; };

export default function Atlas3DTrackerIframe(_props: Props) {
  // ALWAYS use production tracker - it works both locally and in production
  // The tracker is deployed separately and loads the actual app
  const src = PROD_TRACKER;

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
