/**
 * Solar System Data Integration
 * Fetches real positions for planets, spacecraft, and other objects from NASA Horizons
 * Creates a comprehensive, accurate visualization of the solar system
 */

import { generate3IAtlasVectors } from "./atlas-orbital-data";
import { type VectorData, parseVectorData } from './horizons-api';
import { getCached3IAtlasVectors } from "./horizons-cache";

// ============================================================================
// SOLAR SYSTEM OBJECTS (NASA Horizons COMMAND codes)
// ============================================================================

export const SOLAR_SYSTEM_OBJECTS = {
  // Inner Planets
  mercury: { command: "199", name: "Mercury", color: 0x8c7853, size: 0.025 },
  venus: { command: "299", name: "Venus", color: 0xffc649, size: 0.038 },
  earth: { command: "399", name: "Earth", color: 0x2266ff, size: 0.04 },
  mars: { command: "499", name: "Mars", color: 0xff6644, size: 0.034 },

  // Outer Planets
  jupiter: { command: "599", name: "Jupiter", color: 0xd4a574, size: 0.12 },
  saturn: { command: "699", name: "Saturn", color: 0xfad5a5, size: 0.1 },
  uranus: { command: "799", name: "Uranus", color: 0x4fd0e7, size: 0.07 },
  neptune: { command: "899", name: "Neptune", color: 0x4166f5, size: 0.07 },

  // Dwarf Planets
  pluto: { command: "999", name: "Pluto", color: 0xccaa88, size: 0.02 },

  // Spacecraft (famous missions)
  voyager1: { command: "-31", name: "Voyager 1", color: 0xffff00, size: 0.03 },
  voyager2: { command: "-32", name: "Voyager 2", color: 0xffff00, size: 0.03 },

  // 3I/ATLAS
  atlas: { command: "1004083", name: "3I/ATLAS", color: 0x00ff88, size: 0.06 },
};

export type SolarSystemObjectKey = keyof typeof SOLAR_SYSTEM_OBJECTS;

// ============================================================================
// FETCH MULTIPLE OBJECTS FROM HORIZONS
// ============================================================================

// Time interpolation engine (from comprehensive prompt)
const interpolatePosition = (dataArray: any[], timestamp: number) => {
  // Find lower and upper indices
  const index = Math.floor(timestamp);
  const t = timestamp - index; // Fraction 0-1

  if (index >= dataArray.length - 1)
    return dataArray[dataArray.length - 1].position_au;

  const p0 = dataArray[index].position_au;
  const p1 = dataArray[index + 1].position_au;

  return {
    x: p0.x + (p1.x - p0.x) * t,
    y: p0.y + (p1.y - p0.y) * t,
    z: p0.z + (p1.z - p0.z) * t,
  };
};

/**
 * Fetch position data for multiple objects at once
 * Returns synchronized timeline for all objects
 */
export async function fetchSolarSystemData(
  objects: SolarSystemObjectKey[],
  startDate: string,
  endDate: string,
  stepSize: string = "6h"
): Promise<Record<string, VectorData[]>> {
  const results: Record<string, VectorData[]> = {};

  try {
    // Load from DATA_CORRECT NASA Horizons data file
    const response = await fetch("/data/SOLAR_SYSTEM_POSITIONS.json");
    if (!response.ok) {
      throw new Error(`Failed to load local data: ${response.status}`);
    }

    const localData = await response.json();
    console.log(
      `[Solar System] ✅ Loaded ${localData.length} data points from local NASA Horizons file`
    );

    // Map NASA object names to our keys (corrected to match actual data format)
    const objectMapping: Record<string, string> = {
      "ATLAS (C/2025 N1)": "atlas",
      "Mercury (199)": "mercury",
      "Venus (299)": "venus",
      "Earth (399)": "earth",
      "Mars (499)": "mars",
      "Jupiter (599)": "jupiter",
      "Saturn (699)": "saturn",
      "Uranus (799)": "uranus",
      "Neptune (899)": "neptune",
    };

    // Group data by object for compatibility with existing code
    const dataByObject: Record<string, any[]> = {};
    localData.forEach((entry: any) => {
      const objectName = entry.object;
      if (!dataByObject[objectName]) {
        dataByObject[objectName] = [];
      }
      dataByObject[objectName].push(entry);
    });

    // Convert to VectorData format
    Object.entries(dataByObject).forEach(([nasaName, entries]) => {
      const ourKey = objectMapping[nasaName];
      if (ourKey && objects.includes(ourKey as SolarSystemObjectKey)) {
        results[ourKey] = entries.map((entry: any) => ({
          date: entry.date,
          position: {
            x: entry.position_au.x,
            y: entry.position_au.y,
            z: entry.position_au.z,
          },
          velocity: {
            vx: entry.velocity_au_per_day.vx,
            vy: entry.velocity_au_per_day.vy,
            vz: entry.velocity_au_per_day.vz,
          },
        }));
        console.log(
          `[Solar System] ✅ Loaded ${results[ourKey].length} positions for ${ourKey}`
        );
      }
    });

    return results;
  } catch (error) {
    console.error("[Solar System] ❌ Failed to load local data:", error);
    // Fallback to original API method if local data fails
    const stepHours = normalizeStepHours(stepSize);
    await Promise.all(
      objects.map((objKey) =>
        loadObjectData({
          objKey,
          startDate,
          endDate,
          stepSize,
          stepHours,
          results,
        })
      )
    );
  }

  return results;
}

interface LoadObjectParams {
  objKey: SolarSystemObjectKey;
  startDate: string;
  endDate: string;
  stepSize: string;
  stepHours: number;
  results: Record<string, VectorData[]>;
}

async function loadObjectData({
  objKey,
  startDate,
  endDate,
  stepSize,
  stepHours,
  results,
}: LoadObjectParams): Promise<void> {
  const obj = SOLAR_SYSTEM_OBJECTS[objKey];
  if (!obj) return;

  if (objKey === 'atlas') {
    try {
      const vectors = await getCached3IAtlasVectors(startDate, endDate, stepSize);
      if (vectors.length > 0) {
        results[objKey] = vectors;
        console.log(
          `[Solar System] ✅ Loaded 3I/ATLAS from Horizons with ${vectors.length} positions`
        );
        return;
      }
      console.warn('[Solar System] Horizons returned 0 positions for 3I/ATLAS');
    } catch (error) {
      console.warn('[Solar System] Horizons fetch for 3I/ATLAS failed:', error);
    }

    const fallbackVectors = generate3IAtlasVectors(startDate, endDate, stepHours);
    if (fallbackVectors.length > 0) {
      results[objKey] = fallbackVectors;
      console.log(
        `[Solar System] ✅ Generated ${fallbackVectors.length} positions for 3I/ATLAS (fallback)`
      );
    }
    return;
  }

  const params = new URLSearchParams({
    COMMAND: obj.command,
    EPHEM_TYPE: 'VECTOR',
    CENTER: '@sun',
    START_TIME: startDate,
    STOP_TIME: endDate,
    STEP_SIZE: stepSize,
    format: 'json',
    OUT_UNITS: 'AU-D',
    REF_SYSTEM: 'ICRF',
    VEC_TABLE: '2',
  });

  try {
    const response = await fetch(`/api/horizons/ephemeris?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data.result) {
      throw new Error('Missing result payload');
    }

    const resultLines = Array.isArray(data.result)
      ? data.result
      : typeof data.result === 'string'
      ? data.result.split('\n')
      : [];

    const vectors = parseVectorData(resultLines);
    if (vectors.length === 0) {
      throw new Error('No vector data parsed');
    }

    results[objKey] = vectors;
    console.log(
      `[Solar System] ✅ Loaded ${obj.name}: ${vectors.length} positions`
    );
  } catch (error) {
    console.error(`[Solar System] Error fetching ${obj.name}:`, error);
    const fallbackData = createMinimalFallbackData(
      objKey,
      startDate,
      endDate,
      stepHours
    );
    if (fallbackData.length > 0) {
      results[objKey] = fallbackData;
      console.log(
        `[Solar System] ✅ Generated ${fallbackData.length} positions for ${obj.name}`
      );
    }
  }
}

function normalizeStepHours(stepSize: string): number {
  if (stepSize.endsWith('h')) {
    const value = parseInt(stepSize.slice(0, -1), 10);
    return Number.isFinite(value) && value > 0 ? value : 6;
  }

  if (stepSize.endsWith('d')) {
    const value = parseInt(stepSize.slice(0, -1), 10);
    return Number.isFinite(value) && value > 0 ? value * 24 : 24;
  }

  const numeric = parseInt(stepSize, 10);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 6;
}

// ============================================================================
// FALLBACK DATA GENERATION
// ============================================================================

/**
 * Create minimal fallback data for objects when NASA API fails
 */
function createMinimalFallbackData(
  objectKey: SolarSystemObjectKey,
  startDate: string,
  endDate: string,
  stepHours: number
): VectorData[] {
  const obj = SOLAR_SYSTEM_OBJECTS[objectKey];
  if (!obj) return [];

  // Simple orbital positions based on approximate distances from sun
  const distances: Record<string, number> = {
    mercury: 0.39,
    venus: 0.72,
    earth: 1.0,
    mars: 1.52,
    jupiter: 5.2,
    saturn: 9.5,
    uranus: 19.2,
    neptune: 30.1,
    pluto: 39.5,
    voyager1: 160,
    voyager2: 130,
    atlas: 1.5, // Will be overridden by proper fallback
  };

  const distance = distances[objectKey] || 1.0;
  const hours = Number.isFinite(stepHours) && stepHours > 0 ? stepHours : 6;
  const startTime = new Date(startDate);
  const endTime = new Date(endDate);
  const totalHours =
    (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  const numSteps = Math.ceil(totalHours / hours);

  const vectors: VectorData[] = [];

  for (let i = 0; i < numSteps; i++) {
    const time = new Date(startTime.getTime() + i * hours * 60 * 60 * 1000);
    const dayOfYear = Math.floor(
      (time.getTime() - new Date(time.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Simple circular orbit approximation
    const angle = (dayOfYear / 365.25) * 2 * Math.PI;
    const x = distance * Math.cos(angle);
    const y = distance * Math.sin(angle);
    const z = 0; // Simplified to ecliptic plane

    vectors.push({
      jd: time.getTime() / (1000 * 60 * 60 * 24) + 2440587.5, // Convert to Julian Date
      date: time.toISOString(),
      position: { x, y, z },
      velocity: { vx: 0, vy: 0, vz: 0 }, // Simplified
    });
  }

  return vectors;
}

// ============================================================================
// PARSE HORIZONS VECTOR DATA
// ============================================================================
