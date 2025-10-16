// components/Atlas3DTrackerEnhanced.tsx (Corrected)
"use client";

import { type VectorData } from "@/lib/horizons-api";
import { getCached3IAtlasVectors } from "@/lib/horizons-cache"; // Use NASA API with corrected DES format
import { type ViewType } from "@/lib/view-manager";
import { useCallback, useEffect, useState } from "react";
import ErrorBoundary from "./ErrorBoundary";
import AtlasViewsContainer from "./views/AtlasViewsContainer";

interface Props {
  // We can remove the date props as this component now controls the historical range
  autoPlay?: boolean;
  playbackSpeed?: number;
  className?: string;
}

export default function Atlas3DTrackerEnhanced({
  autoPlay = true,
  playbackSpeed = 5, // Default speed
  className = "",
}: Props) {
  console.log("Atlas3DTrackerEnhanced component mounted");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [atlasData, setAtlasData] = useState<VectorData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState(playbackSpeed);
  const [currentView, setCurrentView] = useState<ViewType>("historical");

  // Test if component is actually rendering
  console.log(
    "Atlas3DTrackerEnhanced render - mounted:",
    mounted,
    "loading:",
    loading,
    "atlasData length:",
    atlasData.length
  );

  // Load the FULL historical data once on mount
  useEffect(() => {
    console.log("Atlas3DTrackerEnhanced useEffect triggered");
    setMounted(true);

    const loadData = async () => {
      try {
        console.log("Starting data load...");
        setLoading(true);

        // Load real NASA Horizons data
        console.log("Loading NASA Horizons data...");
        // Temporarily bypass cache to test direct API calls
        const vectors = await getCached3IAtlasVectors(
          "2025-07-01",
          "2025-07-02", // Shorter range for testing
          "6h"
        );

        console.log("NASA data loaded:", vectors.length, "points");
        setAtlasData(vectors);
        setLoading(false);
      } catch (err) {
        console.error("Data loading error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Animation loop for playback
  useEffect(() => {
    if (!isPlaying || atlasData.length === 0) return;
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;

      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + speed * deltaTime * 2.0; // Increased speed multiplier
        return nextIndex >= atlasData.length - 1 ? 0 : nextIndex;
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, speed, atlasData.length]);

  const handleIndexChange = useCallback((index: number) => {
    setIsPlaying(false); // Pause when user manually scrubs
    setCurrentIndex(index);
  }, []);

  const handlePlayPause = useCallback(() => setIsPlaying((p) => !p), []);
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
  }, []);
  const handleSpeedChange = useCallback(
    (newSpeed: number) => setSpeed(newSpeed),
    []
  );
  const handleViewChange = useCallback(
    (view: ViewType) => setCurrentView(view),
    []
  );

  // Always render the same structure to avoid hydration mismatch
  return (
    <ErrorBoundary>
      <div
        data-testid="atlas-3d-tracker"
        className={`relative w-full h-full ${className}`}
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mb-4" />
            <p className="text-white text-lg">
              Loading Historical Trajectory...
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Debug: Loading={loading.toString()}
            </p>
            {!mounted && (
              <p className="text-yellow-400 text-xs mt-1">Hydrating...</p>
            )}
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/90 z-10">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && atlasData.length > 0 && (
          <AtlasViewsContainer
            // Pass the single source of truth down to all children
            atlasData={atlasData}
            solarSystemData={{}} // We can load this later for other views
            currentIndex={currentIndex}
            isPlaying={isPlaying}
            speed={speed}
            currentView={currentView}
            onViewChange={handleViewChange}
            onSpeedChange={handleSpeedChange}
            onPlayPause={handlePlayPause}
            onReset={handleReset}
            onIndexChange={handleIndexChange} // Pass down the index change handler
            // Default props for initialization
            onTrajectoryChange={() => {}}
            dailyPosition={null}
            observerMetrics={null}
            currentDate={atlasData[Math.floor(currentIndex)]?.date || ""}
          />
        )}

        {!loading && !error && atlasData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-orange-900/90 z-10">
            <p className="text-white text-lg">No trajectory data available.</p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
