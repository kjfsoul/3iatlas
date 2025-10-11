/**
 * Daily Position Updater for 3I/ATLAS
 * Updates comet position once per day using astronomy-engine
 * Caches position with date stamp to prevent multiple updates
 */

import ATLAS_ORBITAL_ELEMENTS from '../config/orbital-elements/3i-atlas.json';
import { generateVectorsAstronomy } from './astronomy-engine-source';
import { VectorData } from './horizons-api';

const DAILY_UPDATE_KEY = 'atlas_daily_position';
const LAST_UPDATE_KEY = 'atlas_last_update_date';

interface DailyPosition {
  date: string;
  position: VectorData;
  timestamp: number;
}

/**
 * Check if daily update is needed and update if necessary
 */
export async function checkAndUpdateDailyPosition(): Promise<VectorData | null> {
  const today = new Date().toISOString().split('T')[0];
  const lastUpdate = localStorage.getItem(LAST_UPDATE_KEY);
  
  // If already updated today, return cached position
  if (lastUpdate === today) {
    const cached = getCachedDailyPosition();
    if (cached) {
      console.log('[Daily Updater] Using cached position for', today);
      return cached;
    }
  }

  console.log('[Daily Updater] Updating position for', today);
  
  try {
    // Generate current position using astronomy-engine
    const currentDate = new Date();
    const vectors = generateVectorsAstronomy(
      currentDate,
      currentDate,
      1, // 1 hour step
      '3I/ATLAS',
      {
        EC: ATLAS_ORBITAL_ELEMENTS.EC,
        QR: ATLAS_ORBITAL_ELEMENTS.QR,
        TP: ATLAS_ORBITAL_ELEMENTS.TP_JulianDay,
        OM: ATLAS_ORBITAL_ELEMENTS.OM,
        W: ATLAS_ORBITAL_ELEMENTS.W,
        IN: ATLAS_ORBITAL_ELEMENTS.IN,
      }
    );

    if (vectors.length > 0) {
      const currentPosition = vectors[0];
      
      // Cache the position
      const dailyPosition: DailyPosition = {
        date: today,
        position: currentPosition,
        timestamp: Date.now()
      };
      
      localStorage.setItem(DAILY_UPDATE_KEY, JSON.stringify(dailyPosition));
      localStorage.setItem(LAST_UPDATE_KEY, today);
      
      console.log('[Daily Updater] Position updated successfully for', today);
      return currentPosition;
    }
  } catch (error) {
    console.error('[Daily Updater] Failed to update position:', error);
    
    // Return cached position if available
    const cached = getCachedDailyPosition();
    if (cached) {
      console.log('[Daily Updater] Using fallback cached position');
      return cached;
    }
  }

  return null;
}

/**
 * Get cached daily position
 */
export function getCachedDailyPosition(): VectorData | null {
  try {
    const cached = localStorage.getItem(DAILY_UPDATE_KEY);
    if (cached) {
      const dailyPosition: DailyPosition = JSON.parse(cached);
      return dailyPosition.position;
    }
  } catch (error) {
    console.error('[Daily Updater] Failed to parse cached position:', error);
  }
  return null;
}

/**
 * Force update daily position (for manual refresh)
 */
export async function forceUpdateDailyPosition(): Promise<VectorData | null> {
  // Clear cache to force update
  localStorage.removeItem(DAILY_UPDATE_KEY);
  localStorage.removeItem(LAST_UPDATE_KEY);
  
  return checkAndUpdateDailyPosition();
}

/**
 * Get last update date
 */
export function getLastUpdateDate(): string | null {
  return localStorage.getItem(LAST_UPDATE_KEY);
}

/**
 * Check if position is stale (older than 1 day)
 */
export function isPositionStale(): boolean {
  const lastUpdate = getLastUpdateDate();
  if (!lastUpdate) return true;
  
  const today = new Date().toISOString().split('T')[0];
  return lastUpdate !== today;
}
