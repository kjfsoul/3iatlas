'use client';

import dynamic from 'next/dynamic';

// Dynamically import BASE 3D tracker (client-side only) - Simple working version
const Atlas3DTracker = dynamic(() => import("./Atlas3DTracker"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-black rounded-xl">
      <div className="animate-pulse text-cyan-400 text-lg">
        Loading Solar System...
      </div>
    </div>
  ),
});

interface Atlas3DTrackerWrapperProps {
  startDate?: string;
  endDate?: string;
  stepSize?: '1h' | '6h' | '12h' | '1d';
  autoPlay?: boolean;
  playbackSpeed?: number;
}

export default function Atlas3DTrackerWrapper(props: Atlas3DTrackerWrapperProps) {
  return <Atlas3DTracker {...props} />;
}
