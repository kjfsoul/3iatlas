'use client';

export type Health = {
  fps?: number;
  nanFrames: number;
  clippedFrames: number;
  fpsDrops: number;
  lastSanitizeFailAt: number;
};

function getHealth(): Health {
  const w = typeof window !== 'undefined' ? (window as any) : {};
  if (!w.__AE_HEALTH__) {
    w.__AE_HEALTH__ = { nanFrames: 0, clippedFrames: 0, fpsDrops: 0, lastSanitizeFailAt: 0 } as Health;
  }
  return w.__AE_HEALTH__ as Health;
}

export function markSanitizeFail(): void {
  const h = getHealth();
  h.lastSanitizeFailAt = Date.now();
}

export function withFrameGuard<T extends (...args: any[]) => void>(renderFn: T): T {
  const guarded = ((...args: any[]) => {
    try {
      const h = getHealth();
      if (Date.now() - (h.lastSanitizeFailAt || 0) < 200) {
        h.clippedFrames++;
        return; // skip this frame
      }
      renderFn(...args);
    } catch {
      const h = getHealth();
      h.nanFrames++;
      // swallow to avoid crashing UI
    }
  }) as T;
  return guarded;
}

// Simple perf governor hooks (opt-in from views)
export function shouldDegrade(fpsHistory: number[]): boolean {
  if (fpsHistory.length < 60) return false;
  const avg = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;
  return avg < 45;
}

export function shouldRestore(fpsHistory: number[]): boolean {
  if (fpsHistory.length < 60) return false;
  const avg = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;
  return avg > 55;
}

export function setFps(fps: number): void {
  const h = getHealth();
  h.fps = fps;
}
