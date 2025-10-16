"use client";

import { useEffect, useState } from "react";

export default function MinimalTracker() {
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState("Initial");

  useEffect(() => {
    console.log("MinimalTracker useEffect triggered");
    setMounted(true);
    
    const timer = setTimeout(() => {
      console.log("MinimalTracker timer fired");
      setMessage("Hydration Working!");
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Always render the same structure to avoid hydration mismatch
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-blue-900/90 z-10">
      <div className="text-center">
        <p className="text-white text-lg">Minimal Tracker</p>
        <p className="text-white text-sm mt-2">Message: {message}</p>
        <p className="text-white text-sm mt-2">Mounted: {mounted.toString()}</p>
        {!mounted && <p className="text-yellow-400 text-xs mt-1">Hydrating...</p>}
      </div>
    </div>
  );
}
