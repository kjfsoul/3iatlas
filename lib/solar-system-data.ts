/**
 * Solar System Data Integration
 * Fetches real positions for planets, spacecraft, and other objects from NASA Horizons
 * Creates a comprehensive, accurate visualization of the solar system
 */

import { generate3IAtlasVectors } from './atlas-orbital-data';
import { type VectorData } from './horizons-api';

// ============================================================================
// SOLAR SYSTEM OBJECTS (NASA Horizons COMMAND codes)
// ============================================================================

export const SOLAR_SYSTEM_OBJECTS = {
  // Inner Planets
  mercury: { command: '199', name: 'Mercury', color: 0x8c7853, size: 0.025 },
  venus: { command: '299', name: 'Venus', color: 0xffc649, size: 0.038 },
  earth: { command: '399', name: 'Earth', color: 0x2266ff, size: 0.04 },
  mars: { command: '499', name: 'Mars', color: 0xff6644, size: 0.034 },
  
  // Outer Planets
  jupiter: { command: '599', name: 'Jupiter', color: 0xd4a574, size: 0.12 },
  saturn: { command: '699', name: 'Saturn', color: 0xfad5a5, size: 0.10 },
  uranus: { command: '799', name: 'Uranus', color: 0x4fd0e7, size: 0.07 },
  neptune: { command: '899', name: 'Neptune', color: 0x4166f5, size: 0.07 },
  
  // Dwarf Planets
  pluto: { command: '999', name: 'Pluto', color: 0xccaa88, size: 0.02 },
  
  // Spacecraft (famous missions)
  voyager1: { command: '-31', name: 'Voyager 1', color: 0xffff00, size: 0.03 },
  voyager2: { command: '-32', name: 'Voyager 2', color: 0xffff00, size: 0.03 },
  
  // 3I/ATLAS
  atlas: { command: '1004083', name: '3I/ATLAS', color: 0x00ff88, size: 0.06 },
};

export type SolarSystemObjectKey = keyof typeof SOLAR_SYSTEM_OBJECTS;

// ============================================================================
// FETCH MULTIPLE OBJECTS FROM HORIZONS
// ============================================================================

/**
 * Fetch position data for multiple objects at once
 * Returns synchronized timeline for all objects
 */
export async function fetchSolarSystemData(
  objects: SolarSystemObjectKey[],
  startDate: string,
  endDate: string,
  stepSize: string = '6h'
): Promise<Record<string, VectorData[]>> {
  
  const results: Record<string, VectorData[]> = {};
  
  // Fetch each object's data
  for (const objKey of objects) {
    const obj = SOLAR_SYSTEM_OBJECTS[objKey];
    
    try {
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

      const response = await fetch(`/api/horizons/ephemeris?${params.toString()}`);
      
      if (!response.ok) {
        console.warn(`[Solar System] Failed to fetch ${obj.name}: ${response.status}`);
        
        // FALLBACK: Use generated orbital data for 3I/ATLAS
        if (objKey === 'atlas') {
          console.log('[Solar System] 🔄 Using fallback orbital calculations for 3I/ATLAS');
          const stepHours = parseInt(stepSize.replace('h', '')) || 6;
          const fallbackVectors = generate3IAtlasVectors(startDate, endDate, stepHours);
          if (fallbackVectors.length > 0) {
            results[objKey] = fallbackVectors;
            console.log(`[Solar System] ✅ Generated ${fallbackVectors.length} positions for 3I/ATLAS`);
          }
        }
        continue;
      }

      const data = await response.json();
      
      // Minimal logging to reduce console spam
      // console.log(`[Solar System] Raw data for ${obj.name}:`, {
      //   hasResult: !!data.result,
      //   resultType: typeof data.result,
      //   isArray: Array.isArray(data.result),
      //   resultLength: data.result?.length,
      // });
      
      // Parse the result - can be array or string
      if (!data.result) {
        console.warn(`[Solar System] No result data for ${obj.name}`);
        continue;
      }
      
      const vectors = parseHorizonsVectors(data.result);
      results[objKey] = vectors;
      
      console.log(`[Solar System] ✅ Loaded ${obj.name}: ${vectors.length} positions`);
      
    } catch (error) {
      console.error(`[Solar System] Error fetching ${obj.name}:`, error);
      
      // FALLBACK: Use generated orbital data for 3I/ATLAS on any error
      if (objKey === 'atlas') {
        try {
          console.log('[Solar System] 🔄 Using fallback orbital calculations for 3I/ATLAS (error recovery)');
          const stepHours = parseInt(stepSize.replace('h', '')) || 6;
          const fallbackVectors = generate3IAtlasVectors(startDate, endDate, stepHours);
          if (fallbackVectors.length > 0) {
            results[objKey] = fallbackVectors;
            console.log(`[Solar System] ✅ Generated ${fallbackVectors.length} positions for 3I/ATLAS`);
          }
        } catch (fallbackError) {
          console.error('[Solar System] Fallback also failed:', fallbackError);
        }
      }
    }
  }
  
  // FINAL SAFETY NET: If 3I/ATLAS data is missing for ANY reason, generate it
  if (!results['atlas'] || results['atlas'].length === 0) {
    console.warn('[Solar System] ⚠️ 3I/ATLAS data missing! Using fallback calculations as last resort');
    try {
      const stepHours = parseInt(stepSize.replace('h', '')) || 6;
      const fallbackVectors = generate3IAtlasVectors(startDate, endDate, stepHours);
      if (fallbackVectors.length > 0) {
        results['atlas'] = fallbackVectors;
        console.log(`[Solar System] ✅ FALLBACK: Generated ${fallbackVectors.length} positions for 3I/ATLAS`);
      } else {
        console.error('[Solar System] ❌ Fallback returned 0 positions!');
      }
    } catch (error) {
      console.error('[Solar System] ❌ Final fallback failed:', error);
    }
  }
  
  return results;
}

// ============================================================================
// PARSE HORIZONS VECTOR DATA
// ============================================================================

function parseHorizonsVectors(resultLines: string[] | string): VectorData[] {
  const vectors: VectorData[] = [];
  
  // Handle both array of strings and single string
  let resultText: string;
  if (typeof resultLines === 'string') {
    resultText = resultLines;
  } else if (Array.isArray(resultLines)) {
    resultText = resultLines.join('\n');
  } else {
    console.error('[Parser] Invalid input type:', typeof resultLines);
    return [];
  }
  
  const lines = resultText.split('\n');

  let inDataSection = false;
  let currentJD = 0;
  let currentDate = '';
  let currentPosition: { x: number; y: number; z: number } | null = null;

  for (const line of lines) {
    if (line.includes('$$SOE')) {
      inDataSection = true;
      continue;
    }
    if (line.includes('$$EOE')) {
      break;
    }
    if (!inDataSection) continue;

    // Parse JD and date
    const jdMatch = line.match(/^(\d+\.\d+)\s*=\s*A\.D\.\s*(.+?)\s+TDB/);
    if (jdMatch) {
      currentJD = parseFloat(jdMatch[1]);
      currentDate = jdMatch[2].trim();
      continue;
    }

    // Parse position
    const posMatch = line.match(/^\s*X\s*=\s*([\-\d.E+]+)\s+Y\s*=\s*([\-\d.E+]+)\s+Z\s*=\s*([\-\d.E+]+)/);
    if (posMatch) {
      currentPosition = {
        x: parseFloat(posMatch[1]),
        y: parseFloat(posMatch[2]),
        z: parseFloat(posMatch[3]),
      };
      continue;
    }

    // Parse velocity
    const velMatch = line.match(/^\s*VX\s*=\s*([\-\d.E+]+)\s+VY\s*=\s*([\-\d.E+]+)\s+VZ\s*=\s*([\-\d.E+]+)/);
    if (velMatch && currentPosition) {
      vectors.push({
        jd: currentJD,
        date: convertToISO(currentDate),
        position: currentPosition,
        velocity: {
          vx: parseFloat(velMatch[1]),
          vy: parseFloat(velMatch[2]),
          vz: parseFloat(velMatch[3]),
        },
      });
      currentPosition = null;
    }
  }

  return vectors;
}

function convertToISO(horizonsDate: string): string {
  const months: Record<string, string> = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
  };

  const match = horizonsDate.match(/^(\d{4})-(\w{3})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (!match) return new Date().toISOString();

  const [, year, monthName, day, hours, minutes, seconds] = match;
  const month = months[monthName] || '01';

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
}
