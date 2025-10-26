'use client';

const TRACKER_URL = 'https://tracker.3iatlas.mysticarcana.com';

type Props = { autoPlay?: boolean; initialSpeed?: number; initialViewMode?: 'true-scale'|'ride-atlas'; };

export default function Atlas3DTrackerIframe(_props: Props) {
  return (
    <iframe
      src={TRACKER_URL}
      title="3I/ATLAS Flight Tracker"
      className="w-full aspect-[16/9] rounded-xl border border-neutral-700 shadow-sm"
      allow="fullscreen; autoplay; xr-spatial-tracking"
      sandbox="allow-scripts allow-same-origin allow-popups"
    />
  );
}
