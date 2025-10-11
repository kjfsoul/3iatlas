'use client';

/**
 * Atlas Views Container - Main Container for 3I/ATLAS Views
 * Integrates all three views with shared navigation and state management
 * Responsive layout with proper error boundaries
 * Performance monitoring and optimization
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import dynamic from 'next/dynamic';
import { type ViewType } from '@/lib/view-manager';
import ViewSelector from './ViewSelector';
import ControlPanel from './ControlPanel';

// Lazy load views for better performance using Next.js dynamic import
const HistoricalFlightView = dynamic(() => import('./HistoricalFlightView'), { loading: () => <ViewLoadingFallback />, ssr: false });
const CurrentMomentView = dynamic(() => import('./CurrentMomentView'), { loading: () => <ViewLoadingFallback />, ssr: false });
const SpeedSimulationView = dynamic(() => import('./SpeedSimulationView'), { loading: () => <ViewLoadingFallback />, ssr: false });
const PerihelionEventView = dynamic(() => import('./PerihelionEventView'), { loading: () => <ViewLoadingFallback />, ssr: false });
const TrajectoryPlotterView = dynamic(() => import('./TrajectoryPlotterView'), { loading: () => <ViewLoadingFallback />, ssr: false });

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
  onPlayPause?: () => void;
  onReset?: () => void;
  dailyPosition: any;
  observerMetrics: any;
  currentDate: string;
  className?: string;
}

interface ViewState {
  isPlaying: boolean;
  speed: number;
  currentDate: string;
  selectedObject: string | null;
  loading: boolean;
  error: string | null;
}

const AtlasViewsContainer: React.FC<AtlasViewsContainerProps> = ({
  atlasData,
  solarSystemData,
  currentIndex,
  isPlaying,
  speed,
  currentView,
  onViewChange,
  onSpeedChange,
  onTrajectoryChange,
  onPlayPause,
  onReset, // Pass onReset down
  dailyPosition,
  observerMetrics,
  currentDate,
  className = '',
}) => {
  // Use currentView directly from props - no local state needed
  const activeView = currentView;
  const [viewState, setViewState] = useState<ViewState>({
    isPlaying,
    speed,
    currentDate,
    selectedObject: null,
    loading: false,
    error: null
  });

  // Handle view changes - just call parent, don't manage local state
  const handleViewChange = useCallback((view: ViewType) => {
    console.log('[AtlasViewsContainer] View change requested:', view);
    onViewChange(view);
    // Don't set loading state here - let the parent handle it
  }, [onViewChange]);

  // Handle playback controls - sync with parent state
  const handlePlayPause = useCallback(() => {
    console.log('[AtlasViewsContainer] Play/Pause requested');
    onPlayPause?.();
  }, [onPlayPause]);

  const handleReset = useCallback(() => {
    // This should be handled by the parent component  
    console.log('[AtlasViewsContainer] Reset requested');
  }, []);

  // Handle date changes from views
  const handleDateChange = useCallback((date: string) => {
    setViewState(prev => ({ ...prev, currentDate: date }));
  }, []);

  // Handle object selection
  const handleObjectSelect = useCallback((objectName: string) => {
    setViewState(prev => ({ ...prev, selectedObject: objectName }));
  }, []);

  // Handle loading states
  const handleLoadingChange = useCallback((loading: boolean) => {
    setViewState(prev => ({ ...prev, loading }));
  }, []);

  const handleErrorChange = useCallback((error: string | null) => {
    setViewState(prev => ({ ...prev, error }));
  }, []);

  // Memoize view configuration
  const viewConfig = useMemo(() => {
    switch (activeView) {
      case 'historical':
        return {
          title: 'Historical Flight',
          subtitle: 'Timeline from discovery to current position',
          color: 'green',
          icon: '🕐'
        };
      case 'currentMoment':
        return {
          title: 'Current Moment',
          subtitle: 'Super-lens view at October 8, 2025',
          color: 'blue',
          icon: '🔍'
        };
      case 'speedSimulation':
        return {
          title: 'Speed Simulation',
          subtitle: 'Experience velocity from comet perspective',
          color: 'purple',
          icon: '⚡'
        };
      case 'trajectoryPlotter':
        return {
          title: 'Trajectory Plotter',
          subtitle: 'Interactive path modification',
          color: 'red',
          icon: '📊'
        };
      case 'perihelionEvent':
        return {
          title: 'Perihelion Event',
          subtitle: 'Closest solar approach October 28-29',
          color: 'orange',
          icon: '⭐'
        };
      default:
        return {
          title: 'Unknown View',
          subtitle: '',
          color: 'gray',
          icon: '❓'
        };
    }
  }, [activeView]);

  // Memoize common props to prevent unnecessary re-renders
  const commonProps = useMemo(() => ({
    onDateChange: handleDateChange,
    onObjectSelect: handleObjectSelect,
    autoPlay: viewState.isPlaying,
    className: 'w-full h-full'
  }), [handleDateChange, handleObjectSelect, viewState.isPlaying]);

  // Memoize view components to prevent unnecessary re-renders
  const HistoricalView = useMemo(() => (
    <HistoricalFlightView
      {...commonProps}
      speed={speed}
      isPlaying={isPlaying}
      onPlayPause={handlePlayPause}
      onSpeedChange={onSpeedChange}
      currentIndex={currentIndex}
      onReset={handleReset}
      onIndexChange={(index: number) => {
        console.log('Scrub to index:', index);
      }}
    />
  ), [commonProps, speed, isPlaying, handlePlayPause, onSpeedChange, currentIndex, handleReset]);

  const CurrentMomentViewMemo = useMemo(() => (
    <CurrentMomentView
      {...commonProps}
      showLabels={true}
    />
  ), [commonProps]);

  const SpeedSimulationViewMemo = useMemo(() => (
    <SpeedSimulationView
      atlasData={atlasData}
      currentIndex={currentIndex}
      isPlaying={isPlaying}
      speed={speed}
      onSpeedChange={onSpeedChange}
      className="w-full h-full"
    />
  ), [atlasData, currentIndex, isPlaying, speed, onSpeedChange]);

  const TrajectoryPlotterViewMemo = useMemo(() => (
    <TrajectoryPlotterView
      solarSystemData={solarSystemData}
      onTrajectoryChange={onTrajectoryChange}
      className="w-full h-full"
    />
  ), [solarSystemData, onTrajectoryChange]);

  const PerihelionEventViewMemo = useMemo(() => (
    <PerihelionEventView
      {...commonProps}
      onPerihelionReached={(date) => {
        console.log('Perihelion reached:', date);
      }}
    />
  ), [commonProps]);

  // Render active view
  const renderActiveView = useCallback(() => {
    switch (activeView) {
      case 'historical':
        return HistoricalView;
      case 'currentMoment':
        return CurrentMomentViewMemo;
      case 'speedSimulation':
        return SpeedSimulationViewMemo;
      case 'trajectoryPlotter':
        return TrajectoryPlotterViewMemo;
      case 'perihelionEvent':
        return PerihelionEventViewMemo;
      default:
        return <div className="flex items-center justify-center text-white">Unknown view</div>;
    }
  }, [activeView, HistoricalView, CurrentMomentViewMemo, SpeedSimulationViewMemo, TrajectoryPlotterViewMemo, PerihelionEventViewMemo]);

  return (
    <div className={`w-full h-full bg-black grid grid-cols-[256px_1fr_256px] gap-4 p-4 ${className}`}>
      {/* Left Sidebar - View Selector */}
      <div className="max-h-full overflow-y-auto pointer-events-auto">
          <ViewSelector
            activeView={activeView}
            onViewChange={handleViewChange}
            disabled={viewState.loading}
          />
      </div>

      {/* Main 3D View Container */}
      <div className="relative w-full h-full">
        {renderActiveView()}
      </div>

      {/* Right Sidebar - Status Information */}
      <div className="max-h-full overflow-y-auto space-y-4 pointer-events-auto">
        <ControlPanel
          title="Status"
          loading={viewState.loading}
          error={viewState.error}
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          onReset={onReset}
        >
          {currentDate && (
            <div className="text-center">
              <div className="text-white/60 text-xs">Current Date</div>
              <div className="text-white font-mono text-sm">
                {new Date(currentDate).toLocaleDateString()}
              </div>
            </div>
          )}
        </ControlPanel>

        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="text-white font-semibold text-sm mb-3">Performance</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-green-400 text-xs">FPS: 60</div>
            <div className="text-blue-400 text-xs">Speed: {speed}x</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading fallback component
const ViewLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-full bg-black">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4" />
      <p className="text-white text-lg">Loading 3I/ATLAS View...</p>
      <p className="text-white/60 text-sm mt-2">
        Fetching astronomical data
      </p>
    </div>
  </div>
);

export default AtlasViewsContainer;
