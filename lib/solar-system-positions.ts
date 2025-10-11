/**
 * Solar System Positions Calculator
 * Calculates positions for all solar system bodies on October 8, 2025
 * Uses astronomy-engine for accurate orbital mechanics
 */

import { generateVectorsAstronomy } from './astronomy-engine-source';
import { VectorData } from './horizons-api';
import {
  Body,
  HelioState,
  AstroTime,
  StateVector,
  Observer
} from 'astronomy-engine';

// Solar system body definitions with display properties
export interface SolarSystemBody {
  id: string;
  name: string;
  type: 'planet' | 'dwarf' | 'moon' | 'asteroid' | 'comet' | 'star';
  color: number;
  size: number;
  parent?: string; // For moons and satellites
}

export const SOLAR_SYSTEM_BODIES: Record<string, SolarSystemBody> = {
  // Sun
  sun: { id: 'sun', name: 'Sun', type: 'star', color: 0xffff00, size: 0.5 },

  // Inner Planets
  mercury: { id: 'mercury', name: 'Mercury', type: 'planet', color: 0x8c7853, size: 0.025 },
  venus: { id: 'venus', name: 'Venus', type: 'planet', color: 0xffc649, size: 0.038 },
  earth: { id: 'earth', name: 'Earth', type: 'planet', color: 0x2266ff, size: 0.04 },
  mars: { id: 'mars', name: 'Mars', type: 'planet', color: 0xff6644, size: 0.034 },

  // Outer Planets
  jupiter: { id: 'jupiter', name: 'Jupiter', type: 'planet', color: 0xd4a574, size: 0.12 },
  saturn: { id: 'saturn', name: 'Saturn', type: 'planet', color: 0xfad5a5, size: 0.10 },
  uranus: { id: 'uranus', name: 'Uranus', type: 'planet', color: 0x4fd0e7, size: 0.07 },
  neptune: { id: 'neptune', name: 'Neptune', type: 'planet', color: 0x4166f5, size: 0.07 },

  // Dwarf Planets
  pluto: { id: 'pluto', name: 'Pluto', type: 'dwarf', color: 0xccaa88, size: 0.02 },

  // Major Moons - Jupiter (Galilean)
  io: { id: 'io', name: 'Io', type: 'moon', parent: 'jupiter', color: 0xffff99, size: 0.015 },
  europa: { id: 'europa', name: 'Europa', type: 'moon', parent: 'jupiter', color: 0xcccccc, size: 0.012 },
  ganymede: { id: 'ganymede', name: 'Ganymede', type: 'moon', parent: 'jupiter', color: 0xaaaaaa, size: 0.025 },
  callisto: { id: 'callisto', name: 'Callisto', type: 'moon', parent: 'jupiter', color: 0x888888, size: 0.024 },

  // Major Moons - Saturn
  titan: { id: 'titan', name: 'Titan', type: 'moon', parent: 'saturn', color: 0xffaa44, size: 0.025 },
  rhea: { id: 'rhea', name: 'Rhea', type: 'moon', parent: 'saturn', color: 0xdddddd, size: 0.008 },
  iapetus: { id: 'iapetus', name: 'Iapetus', type: 'moon', parent: 'saturn', color: 0x999999, size: 0.007 },
  dione: { id: 'dione', name: 'Dione', type: 'moon', parent: 'saturn', color: 0xeeeeee, size: 0.006 },
  tethys: { id: 'tethys', name: 'Tethys', type: 'moon', parent: 'saturn', color: 0xffffff, size: 0.005 },
  enceladus: { id: 'enceladus', name: 'Enceladus', type: 'moon', parent: 'saturn', color: 0xffffff, size: 0.003 },
  mimas: { id: 'mimas', name: 'Mimas', type: 'moon', parent: 'saturn', color: 0xcccccc, size: 0.002 },

  // Major Moons - Others
  moon: { id: 'moon', name: 'Moon', type: 'moon', parent: 'earth', color: 0xcccccc, size: 0.018 },
  phobos: { id: 'phobos', name: 'Phobos', type: 'moon', parent: 'mars', color: 0x888888, size: 0.001 },
  deimos: { id: 'deimos', name: 'Deimos', type: 'moon', parent: 'mars', color: 0x666666, size: 0.001 },
  triton: { id: 'triton', name: 'Triton', type: 'moon', parent: 'neptune', color: 0xdddddd, size: 0.014 },
};

// Asteroid belt configuration
const ASTEROID_BELT_COUNT = 200;
const ASTEROID_BELT_INNER = 2.1; // AU
const ASTEROID_BELT_OUTER = 3.3; // AU

// Star field configuration
const STAR_FIELD_COUNT = 1000;
const STAR_FIELD_RADIUS = 100; // AU

/**
 * Generate positions for all solar system bodies on October 8, 2025
 */
export function generateSolarSystemPositions(): Record<string, VectorData> {
  const targetDate = new Date('2025-10-08T12:00:00.000Z');
  const astroTime = new AstroTime(targetDate);

  console.log(`[Solar System] Generating positions for ${targetDate.toISOString().split('T')[0]}`);

  const positions: Record<string, VectorData> = {};

  // Generate planet and dwarf planet positions
  const planetBodies = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

  for (const bodyName of planetBodies) {
    try {
      const body = getBodyFromString(bodyName);
      if (body) {
        const stateVector = HelioState(body, astroTime);
        if (isValidStateVector(stateVector)) {
          positions[bodyName] = {
            jd: astroTime.ut + 2451545.0, // Convert to Julian Date
            date: targetDate.toISOString(),
            position: {
              x: stateVector.x,
              y: stateVector.y,
              z: stateVector.z,
            },
            velocity: {
              vx: stateVector.vx,
              vy: stateVector.vy,
              vz: stateVector.vz,
            },
          };
        }
      }
    } catch (error) {
      console.warn(`[Solar System] Failed to generate position for ${bodyName}:`, error);
    }
  }

  // Generate major moon positions (relative to their parent planets)
  const moonPositions = generateMoonPositions(targetDate);
  Object.assign(positions, moonPositions);

  // Generate asteroid belt positions
  const asteroidPositions = generateAsteroidBeltPositions(targetDate);
  Object.assign(positions, asteroidPositions);

  // Generate star field positions
  const starPositions = generateStarFieldPositions();
  Object.assign(positions, starPositions);

  console.log(`[Solar System] Generated positions for ${Object.keys(positions).length} bodies`);
  return positions;
}

/**
 * Generate positions for major moons relative to their parent planets
 */
function generateMoonPositions(date: Date): Record<string, VectorData> {
  const positions: Record<string, VectorData> = {};
  const astroTime = new AstroTime(date);

  // Jupiter's Galilean moons
  const jupiterMoons = [
    { name: 'io', semiMajorAxis: 0.00282, period: 1.769 },
    { name: 'europa', semiMajorAxis: 0.00448, period: 3.551 },
    { name: 'ganymede', semiMajorAxis: 0.00715, period: 7.155 },
    { name: 'callisto', semiMajorAxis: 0.01258, period: 16.689 },
  ];

  // Get Jupiter's position first
  const jupiterBody = getBodyFromString('jupiter');
  if (jupiterBody) {
    const jupiterState = HelioState(jupiterBody, astroTime);

    for (const moon of jupiterMoons) {
      const angle = (2 * Math.PI * (date.getTime() / (moon.period * 24 * 60 * 60 * 1000))) % (2 * Math.PI);
      const distance = moon.semiMajorAxis; // Scale for visualization

      positions[moon.name] = {
        jd: astroTime.ut + 2451545.0,
        date: date.toISOString(),
        position: {
          x: jupiterState.x + distance * Math.cos(angle),
          y: jupiterState.y + distance * Math.sin(angle),
          z: jupiterState.z,
        },
        velocity: {
          vx: jupiterState.vx,
          vy: jupiterState.vy,
          vz: jupiterState.vz,
        },
      };
    }
  }

  // Saturn's major moons
  const saturnBody = getBodyFromString('saturn');
  if (saturnBody) {
    const saturnState = HelioState(saturnBody, astroTime);

    const saturnMoons = [
      { name: 'titan', semiMajorAxis: 0.00817, period: 15.945 },
      { name: 'rhea', semiMajorAxis: 0.00352, period: 4.518 },
      { name: 'iapetus', semiMajorAxis: 0.02378, period: 79.331 },
      { name: 'dione', semiMajorAxis: 0.00252, period: 2.737 },
      { name: 'tethys', semiMajorAxis: 0.00197, period: 1.888 },
      { name: 'enceladus', semiMajorAxis: 0.00160, period: 1.370 },
      { name: 'mimas', semiMajorAxis: 0.00124, period: 0.942 },
    ];

    for (const moon of saturnMoons) {
      const angle = (2 * Math.PI * (date.getTime() / (moon.period * 24 * 60 * 60 * 1000))) % (2 * Math.PI);
      const distance = moon.semiMajorAxis;

      positions[moon.name] = {
        jd: astroTime.ut + 2451545.0,
        date: date.toISOString(),
        position: {
          x: saturnState.x + distance * Math.cos(angle),
          y: saturnState.y + distance * Math.sin(angle),
          z: saturnState.z,
        },
        velocity: {
          vx: saturnState.vx,
          vy: saturnState.vy,
          vz: saturnState.vz,
        },
      };
    }
  }

  // Earth's Moon
  const earthBody = getBodyFromString('earth');
  if (earthBody) {
    const earthState = HelioState(earthBody, astroTime);
    const moonAngle = (2 * Math.PI * (date.getTime() / (27.3 * 24 * 60 * 60 * 1000))) % (2 * Math.PI);
    const moonDistance = 0.00257; // Moon's distance from Earth in AU

    positions['moon'] = {
      jd: astroTime.ut + 2451545.0,
      date: date.toISOString(),
      position: {
        x: earthState.x + moonDistance * Math.cos(moonAngle),
        y: earthState.y + moonDistance * Math.sin(moonAngle),
        z: earthState.z,
      },
      velocity: {
        vx: earthState.vx,
        vy: earthState.vy,
        vz: earthState.vz,
      },
    };
  }

  // Mars' moons
  const marsBody = getBodyFromString('mars');
  if (marsBody) {
    const marsState = HelioState(marsBody, astroTime);

    positions['phobos'] = {
      jd: astroTime.ut + 2451545.0,
      date: date.toISOString(),
      position: {
        x: marsState.x + 0.000063, // Very close to Mars
        y: marsState.y,
        z: marsState.z,
      },
      velocity: {
        vx: marsState.vx,
        vy: marsState.vy,
        vz: marsState.vz,
      },
    };

    positions['deimos'] = {
      jd: astroTime.ut + 2451545.0,
      date: date.toISOString(),
      position: {
        x: marsState.x + 0.000156,
        y: marsState.y,
        z: marsState.z,
      },
      velocity: {
        vx: marsState.vx,
        vy: marsState.vy,
        vz: marsState.vz,
      },
    };
  }

  return positions;
}

/**
 * Generate representative asteroid belt positions
 */
function generateAsteroidBeltPositions(date: Date): Record<string, VectorData> {
  const positions: Record<string, VectorData> = {};
  const astroTime = new AstroTime(date);

  for (let i = 0; i < ASTEROID_BELT_COUNT; i++) {
    const asteroidId = `asteroid_${i}`;

    // Random distance within asteroid belt
    const distance = ASTEROID_BELT_INNER + (Math.random() * (ASTEROID_BELT_OUTER - ASTEROID_BELT_INNER));

    // Random angle
    const angle = Math.random() * 2 * Math.PI;

    // Slight inclination variation
    const inclination = (Math.random() - 0.5) * 0.2; // ±0.1 radians

    positions[asteroidId] = {
      jd: astroTime.ut + 2451545.0,
      date: date.toISOString(),
      position: {
        x: distance * Math.cos(angle),
        y: distance * Math.sin(angle) * Math.cos(inclination),
        z: distance * Math.sin(angle) * Math.sin(inclination),
      },
      velocity: {
        vx: 0, // Simplified - would need proper orbital mechanics
        vy: 0,
        vz: 0,
      },
    };
  }

  return positions;
}

/**
 * Generate background star field positions
 */
function generateStarFieldPositions(): Record<string, VectorData> {
  const positions: Record<string, VectorData> = {};
  const date = new Date('2025-10-08T12:00:00.000Z');

  for (let i = 0; i < STAR_FIELD_COUNT; i++) {
    const starId = `star_${i}`;

    // Random spherical distribution
    const radius = 50 + (Math.random() * STAR_FIELD_RADIUS);
    const theta = Math.random() * 2 * Math.PI; // Azimuth
    const phi = Math.acos(2 * Math.random() - 1); // Inclination

    positions[starId] = {
      jd: 2451545.0, // J2000 epoch
      date: date.toISOString(),
      position: {
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
      },
      velocity: {
        vx: 0, // Stars are essentially fixed
        vy: 0,
        vz: 0,
      },
    };
  }

  return positions;
}

/**
 * Get body enum from string name
 */
function getBodyFromString(bodyName: string): Body | null {
  const bodyMap: Record<string, Body> = {
    mercury: Body.Mercury,
    venus: Body.Venus,
    earth: Body.Earth,
    mars: Body.Mars,
    jupiter: Body.Jupiter,
    saturn: Body.Saturn,
    uranus: Body.Uranus,
    neptune: Body.Neptune,
    pluto: Body.Pluto,
  };

  return bodyMap[bodyName] || null;
}

/**
 * Validate state vector contains no NaN values
 */
function isValidStateVector(state: StateVector): boolean {
  return isFinite(state.x) && isFinite(state.y) && isFinite(state.z) &&
         isFinite(state.vx) && isFinite(state.vy) && isFinite(state.vz);
}

/**
 * Get all solar system bodies organized by type
 */
export function getSolarSystemBodiesByType(): Record<string, SolarSystemBody[]> {
  const bodiesByType: Record<string, SolarSystemBody[]> = {};

  Object.values(SOLAR_SYSTEM_BODIES).forEach(body => {
    if (!bodiesByType[body.type]) {
      bodiesByType[body.type] = [];
    }
    bodiesByType[body.type].push(body);
  });

  return bodiesByType;
}

/**
 * Get positions for a specific type of solar system body
 */
export function getPositionsByType(
  allPositions: Record<string, VectorData>,
  type: string
): Record<string, VectorData> {
  const positions: Record<string, VectorData> = {};

  Object.entries(allPositions).forEach(([id, position]) => {
    const body = SOLAR_SYSTEM_BODIES[id];
    if (body && body.type === type) {
      positions[id] = position;
    }
  });

  return positions;
}
