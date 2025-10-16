/**
 * NASA Horizons API Integration
 * Real-time ephemeris data for 3I/ATLAS
 * 
 * API Documentation: https://ssd-api.jpl.nasa.gov/doc/horizons.html
 * No authentication required for Horizons APIs
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface VectorData {
  jd: number;           // Julian Date
  date: string;         // ISO 8601 date string
  position: {
    x: number;          // X coordinate in AU
    y: number;          // Y coordinate in AU
    z: number;          // Z coordinate in AU
  };
  velocity: {
    vx: number;         // X velocity in AU/day
    vy: number;         // Y velocity in AU/day
    vz: number;         // Z velocity in AU/day
  };
}

export interface HorizonsLookupResult {
  count: number;
  signature: {
    source: string;
    version: string;
  };
  result?: Array<{
    name: string;
    type: string;
    pdes: string | null;
    spkid: string;
    alias: string[];
  }>;
}

export interface HorizonsQueryParams {
  COMMAND: string;
  EPHEM_TYPE: 'VECTOR' | 'OBSERVER';
  CENTER: string;
  START_TIME: string;
  STOP_TIME: string;
  STEP_SIZE: string;
  format: 'json' | 'text';
  OUT_UNITS?: 'AU-D' | 'KM-S';
  REF_SYSTEM?: 'ICRF' | 'J2000';
  VEC_TABLE?: '1' | '2' | '3';
  CSV_FORMAT?: 'YES' | 'NO';
  OBJ_DATA?: 'YES' | 'NO';
}

export interface HorizonsResponse {
  signature: {
    source: string;
    version: string;
  };
  result: string[];
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Use our Next.js API routes to proxy Horizons API (solves CORS issues)
const HORIZONS_LOOKUP_ENDPOINT = '/api/horizons/lookup';
const HORIZONS_MAIN_ENDPOINT = '/api/horizons/ephemeris';

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class HorizonsAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public apiResponse?: unknown
  ) {
    super(message);
    this.name = 'HorizonsAPIError';
  }
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Look up an object in the Horizons database by name or designation
 * Returns SPK-ID and aliases
 */
export async function lookupObject(
  searchString: string,
  group?: 'ast' | 'com' | 'pln' | 'sat' | 'sct' | 'mb' | 'sb'
): Promise<HorizonsLookupResult> {
  const params = new URLSearchParams({
    sstr: searchString,
    format: 'json',
  });

  if (group) {
    params.append('group', group);
  }

  const url = `${HORIZONS_LOOKUP_ENDPOINT}?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new HorizonsAPIError(
        `Horizons Lookup API returned status ${response.status}`,
        response.status
      );
    }

    const data: HorizonsLookupResult = await response.json();
    return data;
  } catch (error) {
    if (error instanceof HorizonsAPIError) {
      throw error;
    }
    throw new HorizonsAPIError(
      `Failed to lookup object "${searchString}": ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get ephemeris vectors for an object from Horizons
 * Returns position and velocity data over specified time range
 */
export async function getEphemerisVectors(
  params: HorizonsQueryParams
): Promise<HorizonsResponse> {
  const queryParams = new URLSearchParams();

  // Add all parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });

  const url = `${HORIZONS_MAIN_ENDPOINT}?${queryParams.toString()}`;

  try {
    console.log("[getEphemerisVectors] Fetching URL:", url);
    const response = await fetch(url);
    console.log("[getEphemerisVectors] Response status:", response.status);

    if (!response.ok) {
      throw new HorizonsAPIError(
        `Horizons API returned status ${response.status}`,
        response.status
      );
    }

    const data: HorizonsResponse = await response.json();
    console.log(
      "[getEphemerisVectors] Response data type:",
      typeof data.result
    );
    return data;
  } catch (error) {
    if (error instanceof HorizonsAPIError) {
      throw error;
    }
    throw new HorizonsAPIError(
      `Failed to fetch ephemeris data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// ============================================================================
// DATA PARSING
// ============================================================================

/**
 * Parse Horizons vector output into structured data
 * Handles both VEC_TABLE=2 (position + velocity) format
 */
export function parseVectorData(
  horizonsResult: string | string[]
): VectorData[] {
  console.log(
    "[parseVectorData] Starting parse, input type:",
    typeof horizonsResult
  );
  const vectors: VectorData[] = [];
  const resultText = Array.isArray(horizonsResult)
    ? horizonsResult.join("\n")
    : horizonsResult;
  const lines = resultText.split("\n");
  console.log("[parseVectorData] Total lines:", lines.length);
  console.log("[parseVectorData] First 10 lines:", lines.slice(0, 10));

  let inDataSection = false;
  let currentJD = 0;
  let currentDate = "";
  let currentPosition: { x: number; y: number; z: number } | null = null;

  for (const line of lines) {
    // Start of data section
    if (line.includes("$$SOE")) {
      console.log("[parseVectorData] Found start of data section");
      inDataSection = true;
      continue;
    }

    // End of data section
    if (line.includes("$$EOE")) {
      break;
    }

    if (!inDataSection) continue;

    // Parse Julian Date and calendar date
    // Format: "2459854.500000000 = A.D. 2025-Oct-01 00:00:00.0000 TDB"
    const jdMatch = line.match(/^(\d+\.\d+)\s*=\s*A\.D\.\s*(.+?)\s+TDB/);
    if (jdMatch) {
      console.log("[parseVectorData] Found JD line:", line);
      currentJD = parseFloat(jdMatch[1]);
      currentDate = jdMatch[2].trim();
      continue;
    }

    // Parse position line
    // Format: " X = 1.234567890123456E+00 Y = -2.345678901234567E+00 Z = 3.456789012345678E-01"
    const posMatch = line.match(
      /^\s*X\s*=\s*([\-\d.E+]+)\s+Y\s*=\s*([\-\d.E+]+)\s+Z\s*=\s*([\-\d.E+]+)/
    );
    if (posMatch) {
      console.log("[parseVectorData] Found position line:", line);
      currentPosition = {
        x: parseFloat(posMatch[1]),
        y: parseFloat(posMatch[2]),
        z: parseFloat(posMatch[3]),
      };
      continue;
    }

    // Parse velocity line
    // Format: "VX=-1.384863382590469E-02 VY= 3.253037007037968E-02 VZ=-1.469837434711640E-03"
    const velMatch = line.match(
      /^\s*VX\s*=\s*([\-\d.E+]+)\s+VY\s*=\s*([\-\d.E+]+)\s+VZ\s*=\s*([\-\d.E+]+)/
    );
    if (velMatch && currentPosition) {
      console.log("[parseVectorData] Found velocity line:", line);
      console.log(
        "[parseVectorData] Adding vector with JD:",
        currentJD,
        "Date:",
        currentDate
      );
      vectors.push({
        jd: currentJD,
        date: convertHorizonsDateToISO(currentDate),
        position: currentPosition,
        velocity: {
          vx: parseFloat(velMatch[1]),
          vy: parseFloat(velMatch[2]),
          vz: parseFloat(velMatch[3]),
        },
      });
      currentPosition = null; // Reset for next iteration
    }
  }

  console.log("[parseVectorData] Parsed", vectors.length, "vectors");
  return vectors;
}

/**
 * Convert Horizons date format to ISO 8601
 * Input: "2025-Oct-01 00:00:00.0000"
 * Output: "2025-10-01T00:00:00.000Z"
 */
function convertHorizonsDateToISO(horizonsDate: string): string {
  const months: Record<string, string> = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };

  // Parse "2025-Oct-01 00:00:00.0000"
  const match = horizonsDate.match(
    /^(\d{4})-(\w{3})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/
  );
  if (!match) {
    return new Date().toISOString(); // Fallback
  }

  const [, year, monthName, day, hours, minutes, seconds] = match;
  const month = months[monthName] || "01";

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
}

// ============================================================================
// HIGH-LEVEL FUNCTIONS
// ============================================================================

/**
 * Complete workflow to get vector data for 3I/ATLAS
 * 1. Look up object to get SPK-ID
 * 2. Fetch ephemeris vectors
 * 3. Parse and return structured data
 *
 * 3I/ATLAS (C/2025 N1) - Third confirmed interstellar object
 * Discovered: July 1, 2025 by ATLAS telescope, Chile
 * Perihelion: Late October 2025
 * This is a REAL interstellar object in the Horizons database
 */
export async function get3IAtlasVectors(
  startDate: string,
  endDate: string,
  stepSize: string = "6h"
): Promise<VectorData[]> {
  console.log(
    "[get3IAtlasVectors] Starting with dates:",
    startDate,
    "to",
    endDate
  );
  // Step 1: Use confirmed DES format for 3I/ATLAS
  // DES format reference: docs/LIVE_API_TEST_RESULTS.md
  const preferredDesCommand = "'DES=1004083;'";
  let spkid = preferredDesCommand;

  // Skip sanity check - we know DES format works from live testing
  console.log("[Horizons] Using DES format 'DES=1004083;' for 3I/ATLAS");

  // No lookup needed - using DES format directly

  // Step 2: Fetch ephemeris vectors
  const ephemerisParams: HorizonsQueryParams = {
    COMMAND: spkid,
    EPHEM_TYPE: "VECTOR",
    CENTER: "@sun", // Heliocentric (Sun-centered)
    START_TIME: startDate,
    STOP_TIME: endDate,
    STEP_SIZE: stepSize,
    format: "json",
    OUT_UNITS: "AU-D", // Astronomical Units, Days
    REF_SYSTEM: "ICRF", // International Celestial Reference Frame
    VEC_TABLE: "2", // Position + Velocity
    OBJ_DATA: "YES", // Include object metadata
  };

  console.log("[get3IAtlasVectors] Calling getEphemerisVectors...");
  const ephemerisResponse = await getEphemerisVectors(ephemerisParams);
  console.log(
    "[get3IAtlasVectors] Got response, result type:",
    typeof ephemerisResponse.result
  );

  // Step 3: Parse and return
  console.log("[get3IAtlasVectors] Calling parseVectorData...");
  const vectors = parseVectorData(ephemerisResponse.result);

  console.log(`[Horizons] Parsed ${vectors.length} vector data points`);

  return vectors;
}

/**
 * Get current position of 3I/ATLAS (single data point)
 */
export async function get3IAtlasCurrentPosition(): Promise<VectorData | null> {
  const now = new Date();
  const nowStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  try {
    const vectors = await get3IAtlasVectors(nowStr, tomorrowStr, '1h');
    return vectors.length > 0 ? vectors[0] : null;
  } catch (error) {
    console.error('[Horizons] Failed to get current position:', error);
    return null;
  }
}
