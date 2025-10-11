import {
  AngleBetween,
  EquatorFromVector,
  Vector,
  Body,
  HelioState, // Used to get Sun's position for phase angle/elongation
  AstroTime,
  RAD2DEG, // Import RAD2DEG
} from 'astronomy-engine';
import { VectorData } from './horizons-api';

export interface ObserverMetrics {
  raDeg: number;
  decDeg: number;
  elongDeg: number;
  phaseDeg: number;
}

// Extend the Vector class to include a dot product method
declare module 'astronomy-engine' {
  interface Vector {
    dot(other: Vector): number;
  }
}

Vector.prototype.dot = function(other: Vector): number {
    return this.x * other.x + this.y * other.y + this.z * other.z;
};


export function computeObserverMetrics(
  atlasVec: VectorData,
  earthVec: VectorData,
): ObserverMetrics {
  // Validate input vectors for NaN values
  if (!isValidVectorData(atlasVec) || !isValidVectorData(earthVec)) {
    console.warn('[ObserverMetrics] Invalid input vectors detected');
    return {
      raDeg: 0,
      decDeg: 0,
      elongDeg: 0,
      phaseDeg: 0,
    };
  }

  const atlasAstroTime = new AstroTime(new Date(atlasVec.date));
  const earthAstroTime = new AstroTime(new Date(earthVec.date));

  // 1. Convert input VectorData to astronomy-engine's Vector objects
  // These vectors are heliocentric J2000 from the origin.
  const atlasHelioVector = new Vector(
    atlasVec.position.x,
    atlasVec.position.y,
    atlasVec.position.z,
    atlasAstroTime
  );

  const earthHelioVector = new Vector(
    earthVec.position.x,
    earthVec.position.y,
    earthVec.position.z,
    earthAstroTime
  );

  // 2. Compute geocentric vector of 3I/ATLAS relative to Earth
  // This is (Atlas_Heliocentric - Earth_Heliocentric)
  const atlasGeocentricVector = new Vector(
    atlasHelioVector.x - earthHelioVector.x,
    atlasHelioVector.y - earthHelioVector.y,
    atlasHelioVector.z - earthHelioVector.z,
    atlasAstroTime // Time should match the observed object's time
  );

  // 3. Compute RA/Dec (J2000)
  // EquatorFromVector takes a Vector (geocentric, J2000) and returns EquatorialCoordinates
  const equatorialCoords = EquatorFromVector(atlasGeocentricVector);
  let raDeg = equatorialCoords.ra * 15; // Convert sidereal hours to degrees

  // Normalize RA to [0, 360) degrees with high precision
  raDeg = ((raDeg % 360) + 360) % 360;

  const decDeg = equatorialCoords.dec;

  // 4. Compute Solar Elongation
  // This is the angle between the Sun and 3I/ATLAS as seen from Earth.
  // Sun's heliocentric position is (0,0,0). So, from Earth, Sun is (-Earth_HelioVector).
  // Target is (Atlas_Geocentric_Vector).
  const earthToSunVector = new Vector(
    -earthHelioVector.x,
    -earthHelioVector.y,
    -earthHelioVector.z,
    earthAstroTime
  );

  // Enhanced numerical stability for elongation calculation
  const atlasGeoLength = atlasGeocentricVector.Length();
  const sunLength = earthToSunVector.Length();

  if (atlasGeoLength === 0 || sunLength === 0) {
    console.warn('[ObserverMetrics] Zero-length vector detected in elongation calculation');
    return { raDeg: Number(raDeg.toFixed(2)), decDeg: Number(decDeg.toFixed(2)), elongDeg: 0, phaseDeg: 0 };
  }

  let elongCos = atlasGeocentricVector.dot(earthToSunVector) / (atlasGeoLength * sunLength);
  // Robust clamping to acos domain with tolerance for floating-point errors
  elongCos = Math.max(-1.0 + 1e-10, Math.min(1.0 - 1e-10, elongCos));
  const elongDeg = Math.acos(elongCos) * RAD2DEG;

  // 5. Compute Phase Angle
  // The phase angle is the angle between the Sun and the Earth as seen from 3I/ATLAS.
  // Vector from Atlas to Sun: (-atlasHelioVector)
  // Vector from Atlas to Earth: (earthHelioVector - atlasHelioVector)
  const atlasToSunVector = new Vector(
    -atlasHelioVector.x,
    -atlasHelioVector.y,
    -atlasHelioVector.z,
    atlasAstroTime
  );
  const atlasToEarthVector = new Vector(
    earthHelioVector.x - atlasHelioVector.x,
    earthHelioVector.y - atlasHelioVector.y,
    earthHelioVector.z - atlasHelioVector.z,
    atlasAstroTime
  );

  const atlasToSunLength = atlasToSunVector.Length();
  const atlasToEarthLength = atlasToEarthVector.Length();

  if (atlasToSunLength === 0 || atlasToEarthLength === 0) {
    console.warn('[ObserverMetrics] Zero-length vector detected in phase calculation');
    return { raDeg: Number(raDeg.toFixed(2)), decDeg: Number(decDeg.toFixed(2)), elongDeg: Number(elongDeg.toFixed(2)), phaseDeg: 0 };
  }

  let phaseCos = atlasToSunVector.dot(atlasToEarthVector) / (atlasToSunLength * atlasToEarthLength);
  // Robust clamping to acos domain with tolerance for floating-point errors
  phaseCos = Math.max(-1.0 + 1e-10, Math.min(1.0 - 1e-10, phaseCos));
  const phaseDeg = Math.acos(phaseCos) * RAD2DEG;

  return {
    raDeg: Number(raDeg.toFixed(2)),
    decDeg: Number(decDeg.toFixed(2)),
    elongDeg: Number(elongDeg.toFixed(2)),
    phaseDeg: Number(phaseDeg.toFixed(2)),
  };
}

/**
 * Validates that VectorData contains no NaN or infinite values
 */
function isValidVectorData(vector: VectorData): boolean {
  return (
    isFinite(vector.position.x) && isFinite(vector.position.y) && isFinite(vector.position.z) &&
    isFinite(vector.velocity.vx) && isFinite(vector.velocity.vy) && isFinite(vector.velocity.vz) &&
    isFinite(vector.jd) &&
    vector.position.x !== 0 && vector.position.y !== 0 && vector.position.z !== 0 // Avoid zero vectors
  );
}
