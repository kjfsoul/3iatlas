'use client';

import { useState, useEffect } from 'react';

interface Atlas3DTrackerIframeProps {
  autoPlay?: boolean;
  initialSpeed?: number;
  initialViewMode?: 'explorer' | 'true-scale' | 'ride-atlas';
}

export default function Atlas3DTrackerIframe({
  autoPlay = true,
  initialSpeed = 2,
  initialViewMode = 'explorer',
}: Atlas3DTrackerIframeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const TRACKER_URL = process.env.NEXT_PUBLIC_TRACKER_URL || 'http://localhost:5173';
  const iframeUrl = `${TRACKER_URL}?autoPlay=${autoPlay}&speed=${initialSpeed}&view=${initialViewMode}`;

  useEffect(() => {
    // Detect mobile devices
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const smallScreen = window.innerWidth < 768;
      setIsMobile(mobile || smallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const checkServer = async () => {
      // Skip server check on mobile
      if (isMobile) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(TRACKER_URL, { mode: 'no-cors' });
        setIsLoading(false);
      } catch (err) {
        setError('Tracker not available. Please view on desktop for the full 3D experience.');
        setIsLoading(false);
      }
    };

    const timer = setTimeout(checkServer, 500);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, [TRACKER_URL, isMobile]);

  // Mobile-friendly placeholder
  if (isMobile) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-black rounded-xl border border-blue-500/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/3iAtlas_Logo.png')] bg-center bg-no-repeat bg-contain opacity-10" />
        <div className="text-center text-white px-6 z-10">
          <div className="text-5xl mb-4">🌌</div>
          <h3 className="text-lg sm:text-xl font-bold mb-2 text-blue-400">Interactive 3D Tracker</h3>
          <p className="text-sm text-gray-300 mb-4 max-w-md">
            The full 3D orbital tracker with interactive controls is available on desktop devices.
          </p>
          <div className="text-xs text-white/60">
            View on a larger screen for the complete experience
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-black rounded-xl border border-red-500/30">
        <div className="text-center text-white px-6">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2 text-red-400">Tracker Not Available</h3>
          <p className="text-sm text-gray-300 mb-4 max-w-md">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-black rounded-xl">
        <div className="text-center text-white">
          <div className="animate-spin text-4xl mb-4">🌌</div>
          <div className="text-lg">Loading Enhanced Solar System...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden bg-black">
      <iframe
        src={iframeUrl}
        className="w-full h-full border-0"
        title="3I/ATLAS Orbital Tracker"
        style={{ width: '100%', height: '100%', border: 'none', borderRadius: 'inherit' }}
        allow="accelerometer; gyroscope"
        loading="lazy"
      />
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded text-xs text-white/70 pointer-events-none">
        3I/ATLAS Tracker
      </div>
    </div>
  );
}

