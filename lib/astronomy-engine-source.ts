import {
  AstroTime,
  Body,
  DEG2RAD,
  HelioState,
  MassProduct,
  RotateState,
  Rotation_ECL_EQJ,
  StateVector
} from 'astronomy-engine';

import { VectorData } from './horizons-api';

const J2000_JD_OFFSET = 2451545.0;
const SUN_GM = MassProduct(Body.Sun);

// Numerical stability constants
const MIN_DISTANCE = 1e-6; // Minimum distance clamp in AU
const MAX_DISTANCE = 1000; // Maximum distance clamp in AU
const MIN_VELOCITY = 1e-8; // Minimum velocity clamp in AU/day
const MAX_VELOCITY = 50; // Maximum velocity clamp in AU/day

interface OrbitalElementsInput {
  EC: number;
  QR: number;
  TP: number;
  OM: number;
  W: number;
  IN: number;
}

/**
 * Strict type predicate for validating VectorData
 */
export function isValidVectorData(vector: any): vector is VectorData {
  if (!vector || typeof vector !== 'object') return false;
  
  if (typeof vector.jd !== 'number' || !isFinite(vector.jd)) return false;
  if (typeof vector.date !== 'string') return false;
  
  if (!vector.position || typeof vector.position !== 'object') return false;
  if (typeof vector.position.x !== 'number' || !isFinite(vector.position.x)) return false;
  if (typeof vector.position.y !== 'number' || !isFinite(vector.position.y)) return false;
  if (typeof vector.position.z !== 'number' || !isFinite(vector.position.z)) return false;
  
  if (!vector.velocity || typeof vector.velocity !== 'object') return false;
  if (typeof vector.velocity.vx !== 'number' || !isFinite(vector.velocity.vx)) return false;
  if (typeof vector.velocity.vy !== 'number' || !isFinite(vector.velocity.vy)) return false;
  if (typeof vector.velocity.vz !== 'number' || !isFinite(vector.velocity.vz)) return false;
  
  return true;
}

/**
 * Validate and sanitize a single vector frame
 */
export function validateVectorFrame(frame: any): VectorData | null {
  if (!isValidVectorData(frame)) return null;
  
  // Clamp position values
  const position = {
    x: Math.max(-MAX_DISTANCE, Math.min(MAX_DISTANCE, frame.position.x)),
    y: Math.max(-MAX_DISTANCE, Math.min(MAX_DISTANCE, frame.position.y)),
    z: Math.max(-MAX_DISTANCE, Math.min(MAX_DISTANCE, frame.position.z)),
  };
  
  // Clamp velocity values
  const velocity = {
    vx: Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, frame.velocity.vx)),
    vy: Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, frame.velocity.vy)),
    vz: Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, frame.velocity.vz)),
  };
  
  // Ensure minimum velocity magnitude to prevent zero vectors
  const velocityMagnitude = Math.sqrt(velocity.vx ** 2 + velocity.vy ** 2 + velocity.vz ** 2);
  if (velocityMagnitude < MIN_VELOCITY) {
    const scale = MIN_VELOCITY / velocityMagnitude;
    velocity.vx *= scale;
    velocity.vy *= scale;
    velocity.vz *= scale;
  }
  
  return {
    jd: frame.jd,
    date: frame.date,
    position,
    velocity,
  };
}

/**
 * Sanitize a sequence of vector frames
 */
export function sanitizeFrameSequence(frames: any[]): VectorData[] {
  const sanitized: VectorData[] = [];
  let lastGoodFrame: VectorData | null = null;
  
  for (let i = 0; i < frames.length; i++) {
    const sanitizedFrame = validateVectorFrame(frames[i]);
    
    if (sanitizedFrame) {
      sanitized.push(sanitizedFrame);
      lastGoodFrame = sanitizedFrame;
    } else if (lastGoodFrame && i < frames.length - 1) {
      // Generate fallback frame by interpolating between last good and next good
      const nextFrame = validateVectorFrame(frames[i + 1]);
      if (nextFrame) {
        const fallbackFrame: VectorData = {
          jd: frames[i].jd || lastGoodFrame.jd + 0.0417, // Assume 6h step
          date: frames[i].date || new Date(Date.now() + i * 6 * 60 * 60 * 1000).toISOString(),
          position: {
            x: (lastGoodFrame.position.x + nextFrame.position.x) / 2,
            y: (lastGoodFrame.position.y + nextFrame.position.y) / 2,
            z: (lastGoodFrame.position.z + nextFrame.position.z) / 2,
          },
          velocity: {
            vx: (lastGoodFrame.velocity.vx + nextFrame.velocity.vx) / 2,
            vy: (lastGoodFrame.velocity.vy + nextFrame.velocity.vy) / 2,
            vz: (lastGoodFrame.velocity.vz + nextFrame.velocity.vz) / 2,
          },
        };
        sanitized.push(fallbackFrame);
        lastGoodFrame = fallbackFrame;
      }
    }
  }
  
  return sanitized;
}

/**
 * Clamp distance to prevent singularities
 */
function clampDistance(distance: number): number {
  return Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, distance));
}

/**
 * Clamp velocity to prevent extreme values
 */
function clampVelocity(velocity: number): number {
  return Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, velocity));
}

function solveKeplerHyperbolic(M_h: number, e: number): number {
  let E_h = M_h;
  if (M_h > Math.PI) E_h = M_h - 2 * Math.PI;
  if (M_h < -Math.PI) E_h = M_h + 2 * Math.PI;
  if (e > 1.2 && Math.abs(M_h) > 0.5) {
      E_h = Math.log(M_h / e + Math.sqrt(Math.pow(M_h/e, 2) + 1));
  } else {
      E_h = M_h / (e - 1);
  }

  let deltaE_h = Infinity;
  let iterations = 0;
  const maxIterations = 20;
  const tolerance = 1e-12;

  do {
    const f = e * Math.sinh(E_h) - E_h - M_h;
    const f_prime = e * Math.cosh(E_h) - 1;
    if (Math.abs(f_prime) < 1e-15) {
      E_h += 0.01;
      deltaE_h = Infinity;
      continue;
    }
    deltaE_h = f / f_prime;
    E_h -= deltaE_h;
    iterations++;
  } while (Math.abs(deltaE_h) > tolerance && iterations < maxIterations);

  return E_h;
}

function calculateHyperbolicStateVector(elements: OrbitalElementsInput, time: AstroTime): StateVector {
  const e = elements.EC;
  const q = elements.QR;
  const T = new AstroTime(elements.TP);
  const M_tp = elements.OM * DEG2RAD;
  const w_ap = elements.W * DEG2RAD;
  const i_inc = elements.IN * DEG2RAD;

  // Validate orbital elements
  if (!isFinite(e) || !isFinite(q) || e <= 1 || q <= 0) {
    console.warn('[AE] Invalid orbital elements:', { e, q });
    return new StateVector(0, 0, 0, 0, 0, 0, time);
  }

  const dt = (time.ut - T.ut) * (365.25 / 365.24219);
  const a = q / (e - 1);
  
  if (!isFinite(a) || Math.abs(a) > MAX_DISTANCE) {
    console.warn('[AE] Invalid semi-major axis:', { a, q, e });
    return new StateVector(0, 0, 0, 0, 0, 0, time);
  }

  const n_h = Math.sqrt(SUN_GM / Math.pow(Math.abs(a), 3));
  if (!isFinite(n_h)) {
    console.warn('[AE] Invalid mean motion:', { SUN_GM, a, n_h });
    return new StateVector(0, 0, 0, 0, 0, 0, time);
  }

  const M_h = n_h * dt;
  const E_h = solveKeplerHyperbolic(M_h, e);
  if (!isFinite(E_h)) {
    console.warn('[AE] Invalid eccentric anomaly:', { M_h, e, E_h });
    return new StateVector(0, 0, 0, 0, 0, 0, time);
  }

  const nu = 2 * Math.atan2(Math.sqrt(e + 1) * Math.sinh(E_h / 2), Math.sqrt(e - 1) * Math.cosh(E_h / 2));
  const r_mag = Math.abs(a) * (e * Math.cosh(E_h) - 1);
  
  if (!isFinite(r_mag) || r_mag <= 0) {
    console.warn('[AE] Invalid radius:', { r_mag, a, e, E_h });
    return new StateVector(0, 0, 0, 0, 0, 0, time);
  }

  const Xp = r_mag * Math.cos(nu);
  const Yp = r_mag * Math.sin(nu);

  const p = Math.abs(a) * (e * e - 1);
  const h_angular = Math.sqrt(SUN_GM * p);

  const vx_p_perifocal = -(h_angular / r_mag) * Math.sin(nu);
  const vy_p_perifocal = (h_angular / r_mag) * (e + Math.cos(nu));

  const C1 = Math.cos(w_ap);
  const S1 = Math.sin(w_ap);
  const C2 = Math.cos(i_inc);
  const S2 = Math.sin(i_inc);
  const C3 = Math.cos(M_tp);
  const S3 = Math.sin(M_tp);

  const P_x_ecl = (C1*C3 - S1*S3*C2) * Xp + (-S1*C3 - C1*S3*C2) * Yp;
  const P_y_ecl = (C1*S3 + S1*C3*C2) * Xp + (-S1*S3 + C1*C3*C2) * Yp;
  const P_z_ecl = (S1*S2) * Xp + (C1*S2) * Yp;

  const V_x_ecl = (C1*C3 - S1*S3*C2) * vx_p_perifocal + (-S1*C3 - C1*S3*C2) * vy_p_perifocal;
  const V_y_ecl = (C1*S3 + S1*C3*C2) * vx_p_perifocal + (-S1*S3 + C1*C3*C2) * vy_p_perifocal;
  const V_z_ecl = (S1*S2) * vx_p_perifocal + (C1*S2) * vy_p_perifocal;

  // Clamp final position and velocity values
  const clampedPosition = {
    x: clampDistance(P_x_ecl),
    y: clampDistance(P_y_ecl),
    z: clampDistance(P_z_ecl),
  };

  const clampedVelocity = {
    x: clampVelocity(V_x_ecl),
    y: clampVelocity(V_y_ecl),
    z: clampVelocity(V_z_ecl),
  };

  const eclipticState = new StateVector(
    clampedPosition.x,
    clampedPosition.y,
    clampedPosition.z,
    clampedVelocity.x,
    clampedVelocity.y,
    clampedVelocity.z,
    time
  );
  
  const equatorialState = RotateState(Rotation_ECL_EQJ(), eclipticState);

  return equatorialState;
}

export function generateVectorsAstronomy(
  start: Date,
  end: Date,
  stepHours: number,
  objectKey: string,
  elements?: OrbitalElementsInput
): VectorData[] {
  const vectors: VectorData[] = [];
  let current = new Date(start);
  let consecutiveFailures = 0;
  const maxConsecutiveFailures = 5;

  const supportedCadences = [0.5, 1, 2];
  const effectiveStepHours = supportedCadences.includes(stepHours)
    ? stepHours
    : supportedCadences.reduce((prev, curr) =>
        Math.abs(curr - stepHours) < Math.abs(prev - stepHours) ? curr : prev
      );

  const endTime = new Date(end.getTime() + (effectiveStepHours * 60 * 60 * 1000));

  console.log(`[AE] Generating ${objectKey} vectors: ${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}, step: ${effectiveStepHours}h`);

  while (current.getTime() < endTime.getTime()) {
    const astroTime = new AstroTime(current);
    let resultStateVector: StateVector;

    if (objectKey === '3I/ATLAS' && elements) {
      resultStateVector = calculateHyperbolicStateVector(elements, astroTime);
    } else {
      let body: Body;
      switch (objectKey) {
        case 'mercury': body = Body.Mercury; break;
        case 'venus': body = Body.Venus; break;
        case 'earth': body = Body.Earth; break;
        case 'mars': body = Body.Mars; break;
        case 'jupiter': body = Body.Jupiter; break;
        case 'saturn': body = Body.Saturn; break;
        case 'uranus': body = Body.Uranus; break;
        case 'neptune': body = Body.Neptune; break;
        case 'pluto': body = Body.Pluto; break;
        default:
          console.warn(`Unknown body: ${objectKey}`);
          current.setHours(current.getHours() + effectiveStepHours);
          continue;
      }
      resultStateVector = HelioState(body, astroTime);
    }

    // Per-sample validation with fallback
    if (isValidStateVector(resultStateVector)) {
      const vectorData: VectorData = {
        jd: astroTime.ut + J2000_JD_OFFSET,
        date: current.toISOString(),
        position: {
          x: clampDistance(resultStateVector.x),
          y: clampDistance(resultStateVector.y),
          z: clampDistance(resultStateVector.z),
        },
        velocity: {
          vx: clampVelocity(resultStateVector.vx),
          vy: clampVelocity(resultStateVector.vy),
          vz: clampVelocity(resultStateVector.vz),
        },
      };
      
      vectors.push(vectorData);
      consecutiveFailures = 0; // Reset failure counter
    } else {
      consecutiveFailures++;
      console.warn(`[AE] Invalid state vector at ${current.toISOString()}, failures: ${consecutiveFailures}`);
      
      // If too many consecutive failures, stop generation
      if (consecutiveFailures >= maxConsecutiveFailures) {
        console.error(`[AE] Too many consecutive failures (${consecutiveFailures}), stopping generation`);
        break;
      }
      
      current.setHours(current.getHours() + effectiveStepHours);
      continue;
    }

    current.setHours(current.getHours() + effectiveStepHours);
  }

  // Final sanitization pass
  const sanitizedVectors = sanitizeFrameSequence(vectors);
  
  console.log(`[AE] Generated ${sanitizedVectors.length} sanitized vectors for ${objectKey}`);
  return sanitizedVectors;
}

/**
 * Validates that a StateVector contains no NaN values
 */
function isValidStateVector(state: StateVector): boolean {
  return isFinite(state.x) && isFinite(state.y) && isFinite(state.z) &&
         isFinite(state.vx) && isFinite(state.vy) && isFinite(state.vz) &&
         Math.abs(state.x) <= MAX_DISTANCE && Math.abs(state.y) <= MAX_DISTANCE && Math.abs(state.z) <= MAX_DISTANCE &&
         Math.abs(state.vx) <= MAX_VELOCITY && Math.abs(state.vy) <= MAX_VELOCITY && Math.abs(state.vz) <= MAX_VELOCITY;
}

export function findNearestFrameByDate(vectors: VectorData[], isoString: string): number {
  if (!vectors || vectors.length === 0) return 0;

  const targetTime = new Date(isoString).getTime();

  if (targetTime <= new Date(vectors[0].date).getTime()) return 0;
  if (targetTime >= new Date(vectors[vectors.length - 1].date).getTime()) return vectors.length - 1;

  let left = 0;
  let right = vectors.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midTime = new Date(vectors[mid].date).getTime();

    if (midTime === targetTime) {
      return mid;
    } else if (midTime < targetTime) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  const leftTime = new Date(vectors[left] ? vectors[left].date : vectors[0].date).getTime();
  const rightTime = new Date(vectors[right] ? vectors[right].date : vectors[vectors.length - 1].date).getTime();

  return Math.abs(targetTime - leftTime) < Math.abs(targetTime - rightTime) ? left : right;
}

export function downsampleForTrails(vectors: VectorData[], everyNth: number = 10): VectorData[] {
  if (!vectors || vectors.length === 0 || everyNth <= 0) return vectors;

  const result: VectorData[] = [];

  for (let i = 0; i < vectors.length; i += everyNth) {
    if (isValidVectorData(vectors[i])) {
      result.push(vectors[i]);
    }
  }

  return result;
}
