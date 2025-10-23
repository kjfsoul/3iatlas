'use client';

import { useEffect, useState } from "react";

interface Atlas3DTrackerIframeProps {
  autoPlay?: boolean;
  initialSpeed?: number;
  initialViewMode?: /* 'explorer' | */ 'true-scale' | 'ride-atlas'; // Explorer commented out - no textures
}

export default function Atlas3DTrackerIframe({
  autoPlay = true,
  initialSpeed = 10,
  initialViewMode = 'ride-atlas',
}: Atlas3DTrackerIframeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const TRACKER_URL = process.env.NEXT_PUBLIC_TRACKER_URL || 'https://tracker.3iatlas.mysticarcana.com';
  const iframeUrl = `${TRACKER_URL}?autoPlay=${autoPlay}&speed=${initialSpeed}&view=${initialViewMode}`;

  // Check if we're in production or if tracker URL is localhost
  const isProduction =
    typeof window !== "undefined" &&
    !window.location.hostname.includes("localhost") &&
    !window.location.hostname.includes("127.0.0.1");
  const isLocalhostTracker = TRACKER_URL.includes('localhost') || TRACKER_URL.includes('127.0.0.1');

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
      // Allow mobile devices to access tracker
      // if (isMobile) {
      //   setIsLoading(false);
      //   return;
      // }

      // If in production and tracker is localhost or empty, show error immediately
      if (isProduction && (isLocalhostTracker || !TRACKER_URL || TRACKER_URL === '')) {
        setError('3D Tracker not available in production. Coming soon!');
        setIsLoading(false);
        return;
      }

      // Try to reach the tracker server
      try {
        const response = await fetch(TRACKER_URL, { mode: 'no-cors' });
        setIsLoading(false);
      } catch (err) {
        setError('3D Tracker temporarily unavailable. Please try again later.');
        setIsLoading(false);
      }
    };

    const timer = setTimeout(checkServer, 500);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, [TRACKER_URL, isMobile, isProduction, isLocalhostTracker]);

  // Mobile-friendly placeholder - DISABLED to allow mobile access
  // if (isMobile) {
  //   return (
  //     <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-black rounded-xl border border-blue-500/30 relative overflow-hidden">
  //       <div className="absolute inset-0 bg-[url('/images/3iAtlas_Logo.png')] bg-center bg-no-repeat bg-contain opacity-10" />
  //       <div className="text-center text-white px-6 z-10">
  //         <div className="text-5xl mb-4">🌌</div>
  //         <h3 className="text-lg sm:text-xl font-bold mb-2 text-blue-400">Interactive 3D Tracker</h3>
  //         <p className="text-sm text-gray-300 mb-4 max-w-md">
  //           The full 3D orbital tracker with interactive controls is available on desktop devices.
  //         </p>
  //         <div className="text-xs text-white/60">
  //           View on a larger screen for the complete experience
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  if (error) {
    const isComingSoon = error.includes('Coming soon');
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-black rounded-xl border ${isComingSoon ? 'border-blue-500/30' : 'border-yellow-500/30'} relative overflow-hidden`}>
        {isComingSoon && <div className="absolute inset-0 bg-[url('/images/3iAtlas_Logo.png')] bg-center bg-no-repeat bg-contain opacity-10" />}
        <div className="text-center text-white px-6 z-10">
          <div className="text-5xl mb-4">{isComingSoon ? '🚀' : '⏳'}</div>
          <h3 className={`text-lg sm:text-xl font-bold mb-2 ${isComingSoon ? 'text-blue-400' : 'text-yellow-400'}`}>
            {isComingSoon ? 'Interactive 3D Tracker' : 'Tracker Temporarily Unavailable'}
          </h3>
          <p className="text-sm text-gray-300 mb-2 max-w-md">{error}</p>
          {!isComingSoon && (
            <p className="text-xs text-white/60">Please check back soon or try refreshing the page.</p>
          )}
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
    <div className="w-full h-full relative rounded-xl overflow-auto bg-black">
      <iframe
        src={iframeUrl}
        className="w-full h-full border-0"
        title="3I/ATLAS Orbital Tracker"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: "inherit",
          backgroundColor: "black",
          minHeight: "800px",
        }}
        allow="accelerometer; gyroscope"
        loading="lazy"
      />
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded text-xs text-white/70 pointer-events-none">
        3I/ATLAS Tracker
      </div>
    </div>
  );
}
