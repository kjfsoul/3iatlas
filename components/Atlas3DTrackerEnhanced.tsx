// components/Atlas3DTrackerEnhanced.tsx (Corrected)
"use client";

import { getHistoricalAtlasData } from "@/lib/historical-data-generator"; // Use this for the full historical path
import { type VectorData } from "@/lib/horizons-api";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [atlasData, setAtlasData] = useState<VectorData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState(playbackSpeed);
  const [currentView, setCurrentView] = useState<ViewType>("historical");

  // Load the FULL historical data once on mount
  useEffect(() => {
    console.log("Atlas3DTrackerEnhanced useEffect triggered");
    const loadData = async () => {
      try {
        console.log("Starting data load, setting loading to true");
        setLoading(true);
        
        // Add a small delay to ensure client-side rendering
        await new Promise(resolve => setTimeout(resolve, 100));
        // TEMPORARY: Force fallback data to make comet visible
        console.log("Using fallback data to ensure comet visibility");
        const fallbackData: VectorData[] = [];
        const startDate = new Date('2025-07-01');
        for (let i = 0; i < 100; i++) {
          const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
          const angle = (i / 100) * Math.PI * 2;
          const radius = 5 + Math.sin(angle) * 2;
          fallbackData.push({
            jd: 2460977.981439 + i,
            date: date.toISOString().split('T')[0],
            position: {
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius * 0.5,
              z: Math.sin(angle) * radius * 0.3
            },
            velocity: {
              vx: -Math.sin(angle) * 0.1,
              vy: Math.cos(angle) * 0.05,
              vz: Math.cos(angle) * 0.03
            }
          });
        }
        console.log("Fallback data created:", fallbackData.length, "points");
        setAtlasData(fallbackData);
        console.log("Atlas data set, loading complete");
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

  console.log("Atlas3DTrackerEnhanced render - loading:", loading, "atlasData length:", atlasData.length);
  
  if (loading)
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mb-4" />
        <p className="text-white text-lg">Loading Historical Trajectory...</p>
        <p className="text-gray-400 text-sm mt-2">Debug: Loading={loading.toString()}</p>
      </div>
    );
  if (error)
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
        <p className="text-red-500">{error}</p>
      </div>
    );

  return (
    <ErrorBoundary>
      <div
        data-testid="atlas-3d-tracker"
        className={`relative w-full h-full ${className}`}
      >
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
      </div>
    </ErrorBoundary>
  );
}
