'use client';

/**
 * 3I/ATLAS Enhanced 3D Orbital Tracker
 * Complete solar system visualization with real NASA Horizons data
 * All objects move based on actual positions - NO static placeholders
 * Now integrated with 5-View System
 */

import { checkAndUpdateDailyPosition } from "@/lib/daily-updater";
import { type VectorData } from '@/lib/horizons-api';
import { type ObserverMetrics } from "@/lib/observer-metrics";
import {
  fetchSolarSystemData,
  type SolarSystemObjectKey,
} from "@/lib/solar-system-data";
import { type ViewType } from "@/lib/view-manager";
import { useCallback, useEffect, useRef, useState } from "react";
import AtlasViewsContainer from "./views/AtlasViewsContainer";
import ErrorBoundary from "./ErrorBoundary";

interface Props {
  startDate?: string;
  endDate?: string;
  stepSize?: "1h" | "6h" | "12h" | "1d";
  autoPlay?: boolean;
  playbackSpeed?: number;
  className?: string;
  animationKey?: "warning" | "artifact" | "discovery" | null; // NEW: Narrative trigger
}

export default function Atlas3DTrackerEnhanced({
  startDate = "2025-10-01",
  endDate = "2025-10-31",
  stepSize = "6h",
  autoPlay = true,
  playbackSpeed = 2,
  className = "",
  animationKey = null, // NEW: Animation hook for narrative engine
}: Props) {
  // E2E: deterministic mode when ?e2e=1
  const isE2E =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("e2e");
  const containerRef = useRef<HTMLDivElement>(null);

  // 5-View System State
  const [currentView, setCurrentView] = useState<ViewType>("historical");
  // Removed viewManager state - using direct state management instead
  const [dailyPosition, setDailyPosition] = useState<VectorData | null>(null);

  // Removed viewManager subscription - using direct state management instead

  // Daily position update
  useEffect(() => {
    const updateDailyPosition = async () => {
      const position = await checkAndUpdateDailyPosition();
      if (position) {
        setDailyPosition(position);
        // Removed viewManager data setting - using direct state management instead
      }
    };

    updateDailyPosition();
  }, []);

  // Legacy state for compatibility
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [atlasData, setAtlasData] = useState<VectorData[]>([]);
  const [solarSystemData, setSolarSystemData] = useState<
    Record<string, VectorData[]>
  >({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState(5);
  const [currentDate, setCurrentDate] = useState("");
  const [observerMetrics, setObserverMetrics] =
    useState<ObserverMetrics | null>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const objectsToLoad: SolarSystemObjectKey[] = [
          "atlas",
          "earth",
          "mars",
          "jupiter",
          "saturn",
        ];

        const data = await fetchSolarSystemData(
          objectsToLoad,
          startDate,
          endDate,
          stepSize
        );

        setSolarSystemData(data);

        if (data["atlas"] && data["atlas"].length > 0) {
          console.log(
            "[Atlas3DTracker] Loaded atlas data:",
            data["atlas"].length,
            "points"
          );

          // Validate data for NaN values
          const validData = data["atlas"].filter(
            (point: any, index: number) => {
              if (!point.position || !point.velocity) {
                console.warn(
                  `[Atlas3DTracker] Missing position/velocity at index ${index}`
                );
                return false;
              }

              const pos = point.position;
              const vel = point.velocity;

              if (
                isNaN(pos.x) ||
                isNaN(pos.y) ||
                isNaN(pos.z) ||
                isNaN(vel.vx) ||
                isNaN(vel.vy) ||
                isNaN(vel.vz)
              ) {
                console.warn(`[Atlas3DTracker] NaN values at index ${index}:`, {
                  pos,
                  vel,
                });
                return false;
              }

              return true;
            }
          );

          console.log(
            `[Atlas3DTracker] Valid data points: ${validData.length}/${data["atlas"].length}`
          );

          if (validData.length > 0) {
            setAtlasData(validData);
            setCurrentDate(validData[0].date);
          } else {
            console.error("[Atlas3DTracker] No valid data points found!");
            setAtlasData([]);
          }

          if (autoPlay) {
            setIsPlaying(true);
          }
        } else {
          console.log(
            "[Atlas3DTracker] No atlas data found in response:",
            Object.keys(data)
          );
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      }
    };

    loadData();
  }, [startDate, endDate, stepSize, autoPlay]);

  // Animation loop for playback
  useEffect(() => {
    if (!isPlaying || atlasData.length === 0) return;

    let animationId: number;
    let lastTime = performance.now();

    const animate = () => {
      const now = performance.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      setCurrentIndex((prevIndex) => {
        const frameAdvance = deltaTime * speed * 5; // Recalibrated speed
        const nextIndex = prevIndex + frameAdvance;

        if (nextIndex >= atlasData.length) {
          return 0;
        }

        return Math.floor(nextIndex);
      });

      if (isPlaying) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying, speed, atlasData.length]);

  // Update current date when index changes
  useEffect(() => {
    if (atlasData[currentIndex]) {
      setCurrentDate(atlasData[currentIndex].date);
    }
  }, [currentIndex, atlasData]);

  // Handle view changes
  const handleViewChange = useCallback((view: ViewType) => {
    console.log("[Atlas3DTracker] View change:", view);
    setCurrentView(view);
  }, []);

  // Handle speed changes
  const handleSpeedChange = useCallback((newSpeed: number) => {
    console.log("[Atlas3DTracker] Speed change:", newSpeed);
    setSpeed(newSpeed);
    // Keep playing state as is, just change speed
  }, []);

  // Handle trajectory changes from View 5
  const handleTrajectoryChange = useCallback((trajectory: any) => {
    console.log("[Atlas3DTracker] Trajectory change:", trajectory);
    // Handle trajectory changes here if needed
  }, []);

  // Handle play/pause toggle
  const handlePlayPause = useCallback(() => {
    console.log("[Atlas3DTracker] Play/Pause toggle:", !isPlaying);
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleReset = useCallback(() => {
    console.log("[Atlas3DTracker] Resetting animation");
    setCurrentIndex(0);
  }, []);

  return (
    <ErrorBoundary>
      <div className={`relative w-full h-full ${className}`} data-testid="atlas-3d-tracker">
        {/* Data source HUD */}
        <div className="absolute top-2 left-2 z-20 text-xs px-2 py-1 rounded bg-black/60 text-white/80 border border-white/10">
          Data source:{" "}
          {process.env.NEXT_PUBLIC_DATA_SOURCE === "astronomy"
            ? "Astronomy Engine"
            : "NASA Horizons"}
        </div>

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10" data-testid="loading">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mb-4" />
            <p className="text-white text-lg">Loading Solar System Data...</p>
            <p className="text-white/60 text-sm mt-2">
              Fetching from NASA JPL Horizons
            </p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10" data-testid="error">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-white text-lg mb-2">
              Failed to Load Solar System Data
            </p>
            <p className="text-white/60 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <AtlasViewsContainer
            atlasData={atlasData}
            solarSystemData={solarSystemData}
            currentIndex={currentIndex}
            isPlaying={isPlaying}
            speed={speed}
            currentView={currentView}
            onViewChange={handleViewChange}
            onSpeedChange={handleSpeedChange}
            onTrajectoryChange={handleTrajectoryChange}
            onPlayPause={handlePlayPause}
            dailyPosition={dailyPosition}
            observerMetrics={observerMetrics}
            currentDate={currentDate}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
// NOTE: Removed stray debug log block that was left after component end
