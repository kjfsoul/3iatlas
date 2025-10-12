// components/Atlas3DTrackerEnhanced.tsx (Corrected)
"use client";

import { getHistoricalAtlasData } from "@/lib/historical-data-generator"; // Use this for the full historical path
import { type VectorData } from "@/lib/horizons-api";
import { type ViewType } from "@/lib/view-manager";
import { useCallback, useEffect, useState } from "react";
import AtlasViewsContainer from "./views/AtlasViewsContainer";
import ErrorBoundary from "./ErrorBoundary";

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
    const loadData = async () => {
      try {
        setLoading(true);
        // This is the key change: Fetch the complete historical dataset
        const data = getHistoricalAtlasData();
        if (!data || data.length === 0) {
          throw new Error("Failed to load historical data.");
        }
        setAtlasData(data);
        setLoading(false);
      } catch (err) {
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
    const animate = () => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + speed * 0.1; // Simplified speed logic
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

  if (loading)
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mb-4" />
        <p className="text-white text-lg">Loading Historical Trajectory...</p>
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
      <div className={`relative w-full h-full ${className}`}>
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
          // Dummy props for now
          onTrajectoryChange={() => {}}
          dailyPosition={null}
          observerMetrics={null}
          currentDate={atlasData[Math.floor(currentIndex)]?.date || ""}
        />
      </div>
    </ErrorBoundary>
  );
}
