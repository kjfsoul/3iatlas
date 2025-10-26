'use client';

const ALIAS = (process.env.NEXT_PUBLIC_TRACKER_URL || 'https://tracker.3iatlas.mysticarcana.com').trim();
const DEV = (process.env.NEXT_PUBLIC_TRACKER_DEV_URL || 'http://localhost:5173').trim();

type Props = { autoPlay?: boolean; initialSpeed?: number; initialViewMode?: 'true-scale'|'ride-atlas'; };

export default function Atlas3DTrackerIframe(_props: Props) {
  const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const src = isLocal ? DEV : ALIAS;

  // avoid self-embed in case someone points the alias at this app by mistake
  try {
    const here = typeof window !== 'undefined' ? window.location.host : '';
    const there = new URL(src).host;
    if (here === there) {
      return (
        <a href={src} className="text-blue-400 underline" target="_blank" rel="noreferrer">
          Open tracker
        </a>
      );
    }
  } catch {}

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
