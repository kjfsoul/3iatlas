/**
 * Performance Utilities for 3I/ATLAS Application
 * Provides object pooling, memory management, and performance monitoring
 */

import * as THREE from 'three';

// Object Pool for Three.js geometries and materials
class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn?: (obj: T) => void;
  private maxSize: number;

  constructor(createFn: () => T, resetFn?: (obj: T) => void, maxSize = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  release(obj: T) {
    if (this.pool.length < this.maxSize) {
      if (this.resetFn) {
        this.resetFn(obj);
      }
      this.pool.push(obj);
    }
  }

  clear() {
    this.pool.forEach(obj => {
      if (obj instanceof THREE.BufferGeometry) {
        obj.dispose();
      } else if (obj instanceof THREE.Material) {
        obj.dispose();
      }
    });
    this.pool = [];
  }

  getPoolSize() {
    return this.pool.length;
  }
}

// Predefined object pools
const sphereGeometryPool = new ObjectPool(
  () => new THREE.SphereGeometry(1, 32, 32),
  (geometry) => {
    geometry.dispose();
  },
  50
);

const bufferGeometryPool = new ObjectPool(
  () => new THREE.BufferGeometry(),
  (geometry) => {
    geometry.dispose();
  },
  50
);

const lineBasicMaterialPool = new ObjectPool(
  () => new THREE.LineBasicMaterial({ color: 0x00ff88 }),
  (material) => {
    material.dispose();
  },
  20
);

const meshStandardMaterialPool = new ObjectPool(
  () => new THREE.MeshStandardMaterial(),
  (material) => {
    material.dispose();
  },
  30
);

// Performance monitoring utilities
export class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: Map<string, number[]> = new Map();
  private lastCleanup = performance.now();
  private cleanupInterval = 5000; // 5 seconds

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  trackMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 values
    if (values.length > 100) {
      values.shift();
    }

    // Periodic cleanup
    const now = performance.now();
    if (now - this.lastCleanup > this.cleanupInterval) {
      this.cleanup();
      this.lastCleanup = now;
    }
  }

  getAverageMetric(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  cleanup() {
    // Clean up old metrics and force garbage collection if available
    this.metrics.forEach((values, key) => {
      if (values.length > 100) {
        this.metrics.set(key, values.slice(-100));
      }
    });

    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }
  }

  getAllMetrics() {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    this.metrics.forEach((values, name) => {
      if (values.length > 0) {
        result[name] = {
          avg: this.getAverageMetric(name),
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length
        };
      }
    });

    return result;
  }
}

// Memory management utilities
export class MemoryManager {
  private static disposedObjects = new Set<THREE.Object3D>();

  static disposeObject(obj: THREE.Object3D) {
    if (this.disposedObjects.has(obj)) return;
    
    // Dispose geometry
    if (obj instanceof THREE.Mesh && obj.geometry) {
      obj.geometry.dispose();
    }
    
    // Dispose material
    if (obj instanceof THREE.Mesh && obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach(material => material.dispose());
      } else {
        obj.material.dispose();
      }
    }
    
    // Dispose children recursively
    obj.children.forEach(child => this.disposeObject(child));
    
    this.disposedObjects.add(obj);
  }

  static disposeRenderer(renderer: THREE.WebGLRenderer) {
    renderer.dispose();
    renderer.forceContextLoss();
  }

  static getMemoryInfo() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }
}

// Throttling utility for performance-intensive operations
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return ((...args: Parameters<T>) => {
    const currentTime = performance.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = performance.now();
      }, delay - (currentTime - lastExecTime));
    }
  }) as T;
}

// Debouncing utility for input events
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  }) as T;
}

// Export object pools
export {
  sphereGeometryPool,
  bufferGeometryPool,
  lineBasicMaterialPool,
  meshStandardMaterialPool
};

// Performance monitoring hook
export function usePerformanceMonitor() {
  const tracker = PerformanceTracker.getInstance();
  
  return {
    trackMetric: (name: string, value: number) => tracker.trackMetric(name, value),
    getAverage: (name: string) => tracker.getAverageMetric(name),
    getAllMetrics: () => tracker.getAllMetrics(),
    getMemoryInfo: () => MemoryManager.getMemoryInfo()
  };
}
