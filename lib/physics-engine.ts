/**
 * N-Body Physics Engine for Solar System Simulation
 * Implements gravitational force calculations, collision detection, and energy conservation
 * Designed for real-time physics dashboard and trajectory predictions
 */

import { VectorData } from './horizons-api';

// Physical constants (in AU-based units)
export const PHYSICAL_CONSTANTS = {
  G: 4 * Math.PI * Math.PI, // Gravitational constant in AU^3/M_sun/year^2
  SUN_MASS: 1.0, // Solar mass in solar units
  EARTH_MASS: 3.003467e-6, // Earth mass in solar units
  JUPITER_MASS: 9.547919e-4, // Jupiter mass in solar units
  AU_PER_DAY: 173.1446, // AU per day (speed of light)
};

// Body mass definitions (in solar masses)
export const BODY_MASSES: Record<string, number> = {
  sun: 1.0,
  mercury: 1.652e-7,
  venus: 2.447e-6,
  earth: 3.003e-6,
  mars: 3.213e-7,
  jupiter: 9.547e-4,
  saturn: 2.858e-4,
  uranus: 4.366e-5,
  neptune: 5.151e-5,
  pluto: 6.55e-9,
  moon: 3.694e-8,
  io: 4.70e-8,
  europa: 2.53e-8,
  ganymede: 7.81e-8,
  callisto: 5.67e-8,
  titan: 7.55e-8,
  rhea: 1.29e-9,
  iapetus: 9.49e-10,
  dione: 5.78e-10,
  tethys: 3.43e-10,
  enceladus: 5.71e-11,
  mimas: 2.08e-11,
};

// Physics simulation state
export interface PhysicsState {
  bodies: Map<string, PhysicsBody>;
  time: number; // Current simulation time in days
  totalEnergy: number;
  kineticEnergy: number;
  potentialEnergy: number;
}

// Individual body in physics simulation
export interface PhysicsBody {
  id: string;
  name: string;
  mass: number; // In solar masses
  position: { x: number; y: number; z: number }; // In AU
  velocity: { x: number; y: number; z: number }; // In AU/day
  acceleration: { x: number; y: number; z: number }; // In AU/day²
  radius: number; // In AU (for collision detection)
  fixed: boolean; // Fixed bodies don't move (like the Sun)
  trail: Array<{ x: number; y: number; z: number; time: number }>;
}

/**
 * N-Body Physics Simulator Class
 */
export class NBodySimulator {
  private state: PhysicsState;
  private timeStep: number; // Time step in days
  private maxTrailLength: number;

  constructor(timeStep: number = 0.1, maxTrailLength: number = 100) {
    this.timeStep = timeStep;
    this.maxTrailLength = maxTrailLength;
    this.state = {
      bodies: new Map(),
      time: 0,
      totalEnergy: 0,
      kineticEnergy: 0,
      potentialEnergy: 0,
    };
  }

  /**
   * Initialize simulation with solar system bodies
   */
  initializeWithSolarSystem(positions: Record<string, VectorData>): void {
    this.state.bodies.clear();

    // Add the Sun as a fixed body
    this.state.bodies.set('sun', {
      id: 'sun',
      name: 'Sun',
      mass: PHYSICAL_CONSTANTS.SUN_MASS,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      acceleration: { x: 0, y: 0, z: 0 },
      radius: 0.00465, // Sun's radius in AU
      fixed: true,
      trail: [],
    });

    // Add planets and other bodies
    Object.entries(positions).forEach(([id, data]) => {
      if (id === 'sun') return; // Skip sun, already added

      const mass = BODY_MASSES[id] || 1e-10; // Default small mass for unknown bodies
      const radius = this.estimateRadius(id, mass);

      this.state.bodies.set(id, {
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        mass,
        position: { ...data.position },
        velocity: {
          x: data.velocity.vx,
          y: data.velocity.vy,
          z: data.velocity.vz
        },
        acceleration: { x: 0, y: 0, z: 0 },
        radius,
        fixed: false,
        trail: [{ ...data.position, time: 0 }],
      });
    });

    this.calculateTotalEnergy();
    console.log(`[Physics Engine] Initialized with ${this.state.bodies.size} bodies`);
  }

  /**
   * Advance simulation by one time step
   */
  step(): void {
    this.calculateGravitationalForces();
    this.integrateMotion();
    this.state.time += this.timeStep;
    this.updateTrails();
    this.calculateTotalEnergy();
  }

  /**
   * Calculate gravitational forces between all bodies
   */
  private calculateGravitationalForces(): void {
    const bodies = Array.from(this.state.bodies.values());

    // Reset accelerations
    bodies.forEach(body => {
      if (!body.fixed) {
        body.acceleration = { x: 0, y: 0, z: 0 };
      }
    });

    // Calculate pairwise gravitational forces (O(n²) but n is small for solar system)
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const body1 = bodies[i];
        const body2 = bodies[j];

        if (body1.fixed && body2.fixed) continue; // No force between two fixed bodies

        const force = this.calculateGravitationalForce(body1, body2);

        // Apply Newton's third law
        if (!body1.fixed) {
          body1.acceleration.x += force.x / body1.mass;
          body1.acceleration.y += force.y / body1.mass;
          body1.acceleration.z += force.z / body1.mass;
        }

        if (!body2.fixed) {
          body2.acceleration.x -= force.x / body2.mass;
          body2.acceleration.y -= force.y / body2.mass;
          body2.acceleration.z -= force.z / body2.mass;
        }
      }
    }
  }

  /**
   * Calculate gravitational force between two bodies
   */
  private calculateGravitationalForce(body1: PhysicsBody, body2: PhysicsBody): { x: number; y: number; z: number } {
    const dx = body2.position.x - body1.position.x;
    const dy = body2.position.y - body1.position.y;
    const dz = body2.position.z - body1.position.z;

    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // Avoid singularities (collisions or very close approaches)
    const minDistance = (body1.radius + body2.radius) * 1.1;
    const effectiveDistance = Math.max(distance, minDistance);

    const forceMagnitude = (PHYSICAL_CONSTANTS.G * body1.mass * body2.mass) / (effectiveDistance * effectiveDistance);

    const forceX = forceMagnitude * (dx / effectiveDistance);
    const forceY = forceMagnitude * (dy / effectiveDistance);
    const forceZ = forceMagnitude * (dz / effectiveDistance);

    return { x: forceX, y: forceY, z: forceZ };
  }

  /**
   * Integrate motion using Velocity Verlet integration
   */
  private integrateMotion(): void {
    const bodies = Array.from(this.state.bodies.values());

    bodies.forEach(body => {
      if (body.fixed) return;

      // Update position: x(t+dt) = x(t) + v(t)*dt + 0.5*a(t)*dt²
      body.position.x += body.velocity.x * this.timeStep + 0.5 * body.acceleration.x * this.timeStep * this.timeStep;
      body.position.y += body.velocity.y * this.timeStep + 0.5 * body.acceleration.y * this.timeStep * this.timeStep;
      body.position.z += body.velocity.z * this.timeStep + 0.5 * body.acceleration.z * this.timeStep * this.timeStep;

      // Store current acceleration for velocity update
      const prevAcceleration = { ...body.acceleration };

      // Update velocity: v(t+dt) = v(t) + 0.5*(a(t) + a(t+dt))*dt
      body.velocity.x += 0.5 * (prevAcceleration.x + body.acceleration.x) * this.timeStep;
      body.velocity.y += 0.5 * (prevAcceleration.y + body.acceleration.y) * this.timeStep;
      body.velocity.z += 0.5 * (prevAcceleration.z + body.acceleration.z) * this.timeStep;
    });
  }

  /**
   * Update position trails for visualization
   */
  private updateTrails(): void {
    this.state.bodies.forEach(body => {
      body.trail.push({ ...body.position, time: this.state.time });

      // Limit trail length
      if (body.trail.length > this.maxTrailLength) {
        body.trail.shift();
      }
    });
  }

  /**
   * Calculate total energy (kinetic + potential)
   */
  private calculateTotalEnergy(): void {
    let kineticEnergy = 0;
    let potentialEnergy = 0;

    const bodies = Array.from(this.state.bodies.values());

    // Calculate kinetic energy
    bodies.forEach(body => {
      if (!body.fixed) {
        const v2 = body.velocity.x * body.velocity.x +
                   body.velocity.y * body.velocity.y +
                   body.velocity.z * body.velocity.z;
        kineticEnergy += 0.5 * body.mass * v2;
      }
    });

    // Calculate potential energy (gravitational)
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const body1 = bodies[i];
        const body2 = bodies[j];

        const dx = body2.position.x - body1.position.x;
        const dy = body2.position.y - body1.position.y;
        const dz = body2.position.z - body1.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance > 0) {
          potentialEnergy -= (PHYSICAL_CONSTANTS.G * body1.mass * body2.mass) / distance;
        }
      }
    }

    this.state.kineticEnergy = kineticEnergy;
    this.state.potentialEnergy = potentialEnergy;
    this.state.totalEnergy = kineticEnergy + potentialEnergy;
  }

  /**
   * Estimate radius for collision detection
   */
  private estimateRadius(bodyId: string, mass: number): number {
    // Radius estimates based on typical solar system body sizes
    const radiusMap: Record<string, number> = {
      mercury: 0.000016, // Radius in AU
      venus: 0.000040,
      earth: 0.000042,
      mars: 0.000022,
      jupiter: 0.00047,
      saturn: 0.00040,
      uranus: 0.00017,
      neptune: 0.00016,
      pluto: 0.000008,
      moon: 0.000011,
    };

    return radiusMap[bodyId] || (mass * 0.01); // Default based on mass
  }

  /**
   * Detect collisions between bodies
   */
  detectCollisions(): Array<{ body1: string; body2: string; distance: number }> {
    const collisions: Array<{ body1: string; body2: string; distance: number }> = [];
    const bodies = Array.from(this.state.bodies.values());

    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const body1 = bodies[i];
        const body2 = bodies[j];

        const dx = body2.position.x - body1.position.x;
        const dy = body2.position.y - body1.position.y;
        const dz = body2.position.z - body1.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        const collisionDistance = body1.radius + body2.radius;

        if (distance < collisionDistance) {
          collisions.push({
            body1: body1.id,
            body2: body2.id,
            distance,
          });
        }
      }
    }

    return collisions;
  }

  /**
   * Get current simulation state
   */
  getState(): PhysicsState {
    return {
      ...this.state,
      bodies: new Map(this.state.bodies), // Return copy of bodies map
    };
  }

  /**
   * Get positions for visualization
   */
  getPositions(): Record<string, VectorData> {
    const positions: Record<string, VectorData> = {};

    this.state.bodies.forEach((body, id) => {
      positions[id] = {
        jd: 2451545.0 + (this.state.time / 365.25), // Approximate Julian Date
        date: new Date(Date.now() + this.state.time * 24 * 60 * 60 * 1000).toISOString(),
        position: { ...body.position },
        velocity: {
          vx: body.velocity.x,
          vy: body.velocity.y,
          vz: body.velocity.z
        },
      };
    });

    return positions;
  }

  /**
   * Reset simulation to initial state
   */
  reset(): void {
    this.state.time = 0;
    this.state.totalEnergy = 0;
    this.state.kineticEnergy = 0;
    this.state.potentialEnergy = 0;

    this.state.bodies.forEach(body => {
      body.acceleration = { x: 0, y: 0, z: 0 };
      body.trail = [body.trail[0] || { ...body.position, time: 0 }];
    });

    this.calculateTotalEnergy();
  }

  /**
   * Set time step for simulation
   */
  setTimeStep(timeStep: number): void {
    this.timeStep = Math.max(0.001, Math.min(1.0, timeStep)); // Clamp between 0.001 and 1.0 days
  }

  /**
   * Get energy conservation ratio (should be close to 1.0 for accurate simulation)
   */
  getEnergyConservationRatio(): number {
    if (this.state.totalEnergy === 0) return 1.0;
    return Math.abs(this.state.totalEnergy) / Math.max(this.state.kineticEnergy, this.state.potentialEnergy);
  }
}

/**
 * Create physics engine instance
 */
export function createPhysicsEngine(timeStep: number = 0.1): NBodySimulator {
  return new NBodySimulator(timeStep);
}

/**
 * Collision detection utility functions
 */
export class CollisionDetector {
  /**
   * Check if two bodies will collide within a given time frame
   */
  static predictCollision(
    body1: PhysicsBody,
    body2: PhysicsBody,
    timeHorizon: number,
    timeStep: number = 0.1
  ): { willCollide: boolean; timeToCollision?: number; impactParameter?: number } {
    // Simplified collision prediction - for more accuracy, would need to integrate trajectories
    const dx = body2.position.x - body1.position.x;
    const dy = body2.position.y - body1.position.y;
    const dz = body2.position.z - body1.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const collisionDistance = body1.radius + body2.radius;

    if (distance <= collisionDistance) {
      return { willCollide: true, timeToCollision: 0 };
    }

    // Relative velocity
    const dvx = body2.velocity.x - body1.velocity.x;
    const dvy = body2.velocity.y - body1.velocity.y;
    const dvz = body2.velocity.z - body1.velocity.z;
    const relativeSpeed = Math.sqrt(dvx * dvx + dvy * dvy + dvz * dvz);

    if (relativeSpeed === 0) {
      return { willCollide: false };
    }

    const timeToCollision = (distance - collisionDistance) / relativeSpeed;

    return {
      willCollide: timeToCollision > 0 && timeToCollision < timeHorizon,
      timeToCollision: timeToCollision > 0 ? timeToCollision : undefined,
    };
  }

  /**
   * Calculate impact parameter for collision prediction
   */
  static calculateImpactParameter(body1: PhysicsBody, body2: PhysicsBody): number {
    // Vector from body1 to body2
    const dx = body2.position.x - body1.position.x;
    const dy = body2.position.y - body1.position.y;
    const dz = body2.position.z - body1.position.z;

    // Relative velocity
    const dvx = body2.velocity.x - body1.velocity.x;
    const dvy = body2.velocity.y - body1.velocity.y;
    const dvz = body2.velocity.z - body1.velocity.z;

    // Cross product magnitude (impact parameter)
    const crossX = dy * dvz - dz * dvy;
    const crossY = dz * dvx - dx * dvz;
    const crossZ = dx * dvy - dy * dvx;

    const crossMagnitude = Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ);
    const relativeSpeed = Math.sqrt(dvx * dvx + dvy * dvy + dvz * dvz);

    return relativeSpeed > 0 ? crossMagnitude / relativeSpeed : 0;
  }
}
