'use client';

import dynamic from 'next/dynamic';

const Atlas3DTrackerIframe = dynamic(
  () => import('./Atlas3DTrackerIframe'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-black rounded-xl">
        <div className="text-center text-white">
          <div className="animate-spin text-4xl mb-4">🌌</div>
          <div className="text-lg">Loading Enhanced Solar System...</div>
        </div>
      </div>
    ),
  }
);

interface Atlas3DTrackerWrapperProps {
  autoPlay?: boolean;
  initialSpeed?: number;
  initialViewMode?: /* 'explorer' | */ 'true-scale' | 'ride-atlas'; // Explorer commented out - no textures
}

export default function Atlas3DTrackerWrapper(props: Atlas3DTrackerWrapperProps) {
  return <Atlas3DTrackerIframe {...props} />;
}
