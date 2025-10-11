'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePerformanceMonitor, throttle } from '@/lib/performance-utils';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  frameDrops: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  className?: string;
}

/**
 * Performance Monitor for 3I/ATLAS Application
 * Tracks FPS, memory usage, and rendering performance
 */
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = true,
  onMetricsUpdate,
  className = '',
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    renderTime: 0,
    frameDrops: 0,
  });

  const { trackMetric, getMemoryInfo } = usePerformanceMonitor();
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationIdRef = useRef<number | undefined>(undefined);
  const frameTimeHistoryRef = useRef<number[]>([]);
  const frameDropsRef = useRef(0);
  const metricsRef = useRef<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    renderTime: 0,
    frameDrops: 0,
  });
  const onMetricsUpdateRef = useRef(onMetricsUpdate);

  // Throttled metrics update to prevent excessive re-renders
  const throttledMetricsUpdate = useRef(
    throttle((newMetrics: PerformanceMetrics) => {
      setMetrics(newMetrics);
      if (onMetricsUpdateRef.current) {
        onMetricsUpdateRef.current(newMetrics);
      }
    }, 500)
  );

  // Update ref when callback changes
  useEffect(() => {
    onMetricsUpdateRef.current = onMetricsUpdate;
  }, [onMetricsUpdate]);

  useEffect(() => {
    if (!enabled) return;

    let frameCount = 0;
    let lastMetricsUpdate = performance.now();
    const METRICS_UPDATE_INTERVAL = 500; // Update metrics every 500ms

    const measurePerformance = () => {
      const now = performance.now();
      const deltaTime = now - lastTimeRef.current;
      
      frameCountRef.current++;
      frameTimeHistoryRef.current.push(deltaTime);
      
      // Keep only last 60 frames for FPS calculation
      if (frameTimeHistoryRef.current.length > 60) {
        frameTimeHistoryRef.current.shift();
      }

      // Only update metrics at intervals to prevent excessive re-renders
      if (now - lastMetricsUpdate >= METRICS_UPDATE_INTERVAL) {
        // Calculate FPS
        const avgFrameTime = frameTimeHistoryRef.current.reduce((a, b) => a + b, 0) / frameTimeHistoryRef.current.length;
        const fps = avgFrameTime > 0 ? Math.round(1000 / avgFrameTime) : 0;

        // Detect frame drops (frames taking longer than 20ms)
        if (deltaTime > 20) {
          frameDropsRef.current++;
        }

        // Get memory usage (if available)
        let memoryUsage = 0;
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
        }

        const newMetrics: PerformanceMetrics = {
          fps,
          memoryUsage,
          renderTime: Math.round(deltaTime * 100) / 100,
          frameDrops: frameDropsRef.current,
        };

        // Update metrics ref to trigger re-render
        metricsRef.current = newMetrics;
        
        // Track metrics for performance analysis
        trackMetric('fps', fps);
        trackMetric('renderTime', deltaTime);
        trackMetric('frameDrops', frameDropsRef.current);
        
        // Use throttled update to prevent excessive re-renders
        throttledMetricsUpdate.current(newMetrics);

        lastMetricsUpdate = now;
      }

      lastTimeRef.current = now;
      animationIdRef.current = requestAnimationFrame(measurePerformance);
    };

    animationIdRef.current = requestAnimationFrame(measurePerformance);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [enabled]); // Removed onMetricsUpdate to prevent infinite loop

  if (!enabled) return null;

  const getPerformanceColor = (fps: number) => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMemoryColor = (memory: number) => {
    if (memory < 50) return 'text-green-400';
    if (memory < 100) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className={`bg-black/80 text-white p-3 rounded-lg text-xs font-mono ${className}`}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <span className="text-gray-400">FPS:</span>
          <span className={getPerformanceColor(metrics.fps)}>{metrics.fps}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-gray-400">MEM:</span>
          <span className={getMemoryColor(metrics.memoryUsage)}>{metrics.memoryUsage}MB</span>
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-gray-400">FRAME:</span>
          <span className="text-blue-400">{metrics.renderTime}ms</span>
        </div>
        
        {metrics.frameDrops > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-gray-400">DROPS:</span>
            <span className="text-red-400">{metrics.frameDrops}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Hook for accessing performance metrics in components
 */
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    renderTime: 0,
    frameDrops: 0,
  });

  const handleMetricsUpdate = (newMetrics: PerformanceMetrics) => {
    setMetrics(newMetrics);
  };

  return { metrics, handleMetricsUpdate };
};

export default PerformanceMonitor;
