/**
 * Historical Data Generator for 3I/ATLAS
 * Generates comet positions from July 1 - Oct 8, 2025 using astronomy-engine
 * Implements localStorage caching with versioning and re-validation for instant loading
 */

import ATLAS_ORBITAL_ELEMENTS from '../config/orbital-elements/3i-atlas.json';
import { generateVectorsAstronomy, isValidVectorData, sanitizeFrameSequence } from './astronomy-engine-source';
import { VectorData } from './horizons-api';

// Cache configuration
const CACHE_KEY = 'atlas_historical_data';
const CACHE_VERSION = '2.0.0'; // Incremented for new validation
const CACHE_EXPIRY_HOURS = 24; // Cache expires after 24 hours
const MIN_VALIDATION_PERCENTAGE = 95; // Minimum percentage of valid data required

interface CacheMetadata {
  version: string;
  generatedAt: string;
  expiryTime: string;
  dataPoints: number;
  validPoints: number;
  validationPercentage: number;
}

interface CachedData {
  metadata: CacheMetadata;
  data: VectorData[];
}

/**
 * Generate comprehensive historical data for 3I/ATLAS
 * Creates 6-hour intervals from July 1 - Oct 8, 2025
 */
export function generateHistoricalAtlasData(): VectorData[] {
  const startDate = new Date('2025-07-01T00:00:00.000Z');
  const endDate = new Date('2025-10-08T23:59:59.999Z');
  const stepHours = 6; // 6-hour intervals for smooth animation

  console.log(`[Historical Data] Generating 3I/ATLAS positions: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

  const rawVectors = generateVectorsAstronomy(
    startDate,
    endDate,
    stepHours,
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

  console.log(`[Historical Data] Generated ${rawVectors.length} raw data points`);

  // Apply final sanitization and validation
  const sanitizedVectors = sanitizeFrameSequence(rawVectors);
  
  // Validate each vector and count valid ones
  const validVectors = sanitizedVectors.filter(vector => isValidVectorData(vector));
  
  if (validVectors.length !== sanitizedVectors.length) {
    console.warn(`[Historical Data] Filtered out ${sanitizedVectors.length - validVectors.length} invalid vectors`);
  }

  console.log(`[Historical Data] Final valid data points: ${validVectors.length}`);
  return validVectors;
}

/**
 * Validate cached data quality
 */
function validateCachedData(data: VectorData[]): { isValid: boolean; validCount: number; totalCount: number; percentage: number } {
  if (!data || data.length === 0) {
    return { isValid: false, validCount: 0, totalCount: 0, percentage: 0 };
  }

  const validCount = data.filter(vector => isValidVectorData(vector)).length;
  const percentage = (validCount / data.length) * 100;

  return {
    isValid: percentage >= MIN_VALIDATION_PERCENTAGE,
    validCount,
    totalCount: data.length,
    percentage,
  };
}

/**
 * Get cached historical data with re-validation
 */
export function getCachedHistoricalData(): VectorData[] | null {
  if (typeof window === 'undefined') {
    return null; // Server-side, no localStorage
  }

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      console.log('[Historical Data] No cached data found');
      return null;
    }

    const cachedData: CachedData = JSON.parse(cached);

    // Check version compatibility
    if (cachedData.metadata.version !== CACHE_VERSION) {
      console.log(`[Historical Data] Cache version mismatch: ${cachedData.metadata.version} vs ${CACHE_VERSION}`);
      clearHistoricalCache();
      return null;
    }

    // Check expiry
    const now = new Date();
    const expiryTime = new Date(cachedData.metadata.expiryTime);
    if (now > expiryTime) {
      console.log('[Historical Data] Cache expired, regenerating...');
      clearHistoricalCache();
      return null;
    }

    // Re-validate cached data quality
    const validation = validateCachedData(cachedData.data);
    console.log(`[Historical Data] Cache validation: ${validation.validCount}/${validation.totalCount} (${validation.percentage.toFixed(1)}%)`);

    if (!validation.isValid) {
      console.warn(`[Historical Data] Cache quality below threshold (${validation.percentage.toFixed(1)}% < ${MIN_VALIDATION_PERCENTAGE}%), regenerating...`);
      clearHistoricalCache();
      return null;
    }

    console.log(`[Historical Data] Loaded ${cachedData.data.length} cached data points (${validation.percentage.toFixed(1)}% valid)`);
    return cachedData.data;

  } catch (error) {
    console.error('[Historical Data] Cache read error:', error);
    clearHistoricalCache();
    return null;
  }
}

/**
 * Cache historical data with enhanced metadata
 */
export function cacheHistoricalData(data: VectorData[]): void {
  if (typeof window === 'undefined') {
    return; // Server-side, no localStorage
  }

  try {
    const validation = validateCachedData(data);
    const now = new Date();
    const expiryTime = new Date(now.getTime() + (CACHE_EXPIRY_HOURS * 60 * 60 * 1000));

    const cachedData: CachedData = {
      metadata: {
        version: CACHE_VERSION,
        generatedAt: now.toISOString(),
        expiryTime: expiryTime.toISOString(),
        dataPoints: data.length,
        validPoints: validation.validCount,
        validationPercentage: validation.percentage,
      },
      data: data,
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));
    console.log(`[Historical Data] Cached ${data.length} data points (${validation.percentage.toFixed(1)}% valid) until ${expiryTime.toISOString()}`);

  } catch (error) {
    console.error('[Historical Data] Cache write error:', error);
  }
}

/**
 * Clear historical data cache
 */
export function clearHistoricalCache(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('[Historical Data] Cache cleared');
  } catch (error) {
    console.error('[Historical Data] Cache clear error:', error);
  }
}

/**
 * Get historical data - generates if not cached, expired, or invalid
 */
export function getHistoricalAtlasData(): VectorData[] {
  // Try to load from cache first with re-validation
  const cachedData = getCachedHistoricalData();
  if (cachedData && cachedData.length > 0) {
    return cachedData;
  }

  // Generate new data
  console.log('[Historical Data] Generating fresh data...');
  const data = generateHistoricalAtlasData();

  // Cache the generated data
  cacheHistoricalData(data);

  return data;
}

/**
 * Get data for a specific date range within the historical period
 */
export function getHistoricalDataForDateRange(startDate: Date, endDate: Date): VectorData[] {
  const allData = getHistoricalAtlasData();

  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  return allData.filter(vector => {
    const vectorTime = new Date(vector.date).getTime();
    return vectorTime >= startTime && vectorTime <= endTime;
  });
}

/**
 * Get cache statistics with validation info
 */
export function getCacheStats(): { 
  exists: boolean; 
  version?: string; 
  dataPoints?: number; 
  validPoints?: number;
  validationPercentage?: number;
  expiryTime?: string 
} | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      return { exists: false };
    }

    const cachedData: CachedData = JSON.parse(cached);
    return {
      exists: true,
      version: cachedData.metadata.version,
      dataPoints: cachedData.metadata.dataPoints,
      validPoints: cachedData.metadata.validPoints,
      validationPercentage: cachedData.metadata.validationPercentage,
      expiryTime: cachedData.metadata.expiryTime,
    };

  } catch (error) {
    return { exists: false };
  }
}

/**
 * Force regeneration of historical data (ignores cache)
 */
export function regenerateHistoricalData(): VectorData[] {
  console.log('[Historical Data] Forcing regeneration...');
  clearHistoricalCache();
  return getHistoricalAtlasData();
}

/**
 * Validate data quality and return detailed report
 */
export function validateHistoricalDataQuality(data?: VectorData[]): {
  totalPoints: number;
  validPoints: number;
  invalidPoints: number;
  validationPercentage: number;
  issues: string[];
  sampleValidFrame?: VectorData;
  sampleInvalidFrame?: any;
} {
  const dataToValidate = data || getHistoricalAtlasData();
  
  const validPoints = dataToValidate.filter(vector => isValidVectorData(vector));
  const invalidPoints = dataToValidate.length - validPoints.length;
  const validationPercentage = dataToValidate.length > 0 ? (validPoints.length / dataToValidate.length) * 100 : 0;
  
  const issues: string[] = [];
  if (validationPercentage < MIN_VALIDATION_PERCENTAGE) {
    issues.push(`Low validation percentage: ${validationPercentage.toFixed(1)}%`);
  }
  if (invalidPoints > 0) {
    issues.push(`${invalidPoints} invalid data points found`);
  }
  
  // Find sample invalid frame for debugging
  const sampleInvalidFrame = dataToValidate.find(vector => !isValidVectorData(vector));
  
  return {
    totalPoints: dataToValidate.length,
    validPoints: validPoints.length,
    invalidPoints,
    validationPercentage,
    issues,
    sampleValidFrame: validPoints[0],
    sampleInvalidFrame,
  };
}
