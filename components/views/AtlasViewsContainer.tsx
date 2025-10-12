// components/views/AtlasViewsContainer.tsx (Corrected)
"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { type ViewType } from "@/lib/view-manager";
import ViewSelector from "./ViewSelector";
import ControlPanel from "./ControlPanel";

const HistoricalFlightView = dynamic(() => import("./HistoricalFlightView"), {
  loading: () => <ViewLoadingFallback />,
  ssr: false,
});
// Other views...

interface AtlasViewsContainerProps {
  atlasData: any[];
  solarSystemData: Record<string, any[]>;
  currentIndex: number;
  isPlaying: boolean;
  speed: number;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onSpeedChange: (speed: number) => void;
  onTrajectoryChange: (trajectory: any) => void;
  onPlayPause: () => void;
  onReset: () => void;
  onIndexChange: (index: number) => void; // Expect this prop
  dailyPosition: any;
  observerMetrics: any;
  currentDate: string;
  className?: string;
}

// ... (ViewState and other parts can remain the same for now)

const AtlasViewsContainer: React.FC<AtlasViewsContainerProps> = ({
  atlasData,
  // ... other props
  currentIndex,
  isPlaying,
  speed,
  currentView,
  onViewChange,
  onSpeedChange,
  onPlayPause,
  onReset,
  onIndexChange, // Receive the handler
  currentDate,
}) => {
  const renderActiveView = () => {
    switch (currentView) {
      case "historical":
        return (
          <HistoricalFlightView
            historicalData={atlasData} // Pass the full dataset here!
            currentIndex={currentIndex}
            isPlaying={isPlaying}
            speed={speed}
            onPlayPause={onPlayPause}
            onReset={onReset}
            onIndexChange={onIndexChange} // Pass the handler down
            onSpeedChange={onSpeedChange}
          />
        );
      // ... other cases for other views
      default:
        return <div className="text-white">Select a view</div>;
    }
  };

  return (
    <div
      className={`w-full h-full bg-black grid grid-cols-[256px_1fr] gap-4 p-4`}
    >
      {/* Left Sidebar - View Selector */}
      <div>
        <ViewSelector activeView={currentView} onViewChange={onViewChange} />
      </div>

      {/* Main 3D View Container */}
      <div className="relative w-full h-full rounded-xl overflow-hidden">
        {renderActiveView()}
      </div>

      {/* Removed the right sidebar for simplicity in this view */}
    </div>
  );
};

// Loading fallback component
const ViewLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-full bg-black">
    <p className="text-white">Loading View...</p>
  </div>
);

export default AtlasViewsContainer;
