/**
 * Trajectory Calculator for 3I/ATLAS
 * Implements path prediction algorithms, impact prediction, and gravitational slingshot calculations
 * Provides real-time physics dashboard data and scenario presets
 */

import { VectorData } from './horizons-api';
import { BODY_MASSES, PHYSICAL_CONSTANTS } from './physics-engine';

// Scenario presets
export interface ScenarioPreset {
  name: string;
  description: string;
  targetBody: string;
  approachDistance: number; // In AU
  relativeVelocity: number; // In AU/day
  outcome: 'impact' | 'slingshot' | 'flyby' | 'orbit_capture';
}

// Predefined scenario presets
export const SCENARIO_PRESETS: Record<string, ScenarioPreset> = {
  earth_impact: {
    name: 'Earth Impact',
    description: 'Direct collision course with Earth',
    targetBody: 'earth',
    approachDistance: 0.000042, // Earth radius in AU
    relativeVelocity: 15.0, // km/s converted to AU/day
    outcome: 'impact',
  },
  jupiter_sling: {
    name: 'Jupiter Slingshot',
    description: 'Close approach to Jupiter for gravity assist',
    targetBody: 'jupiter',
    approachDistance: 0.001, // Close approach but not impact
    relativeVelocity: 8.0,
    outcome: 'slingshot',
  },
  mars_flyby: {
    name: 'Mars Flyby',
    description: 'Close observation flyby of Mars',
    targetBody: 'mars',
    approachDistance: 0.0001, // Safe distance
    relativeVelocity: 12.0,
    outcome: 'flyby',
  },
  solar_closeup: {
    name: 'Solar Close Approach',
    description: 'Extreme close approach to the Sun',
    targetBody: 'sun',
    approachDistance: 0.01, // Very close to Sun
    relativeVelocity: 25.0,
    outcome: 'flyby',
  },
};

// Trajectory prediction result
export interface TrajectoryPrediction {
  positions: VectorData[];
  closestApproach: {
    distance: number;
    time: Date;
    body: string;
  };
  impacts: Array<{
    body: string;
    time: Date;
    velocity: number;
    energy: number;
  }>;
  slingshots: Array<{
    body: string;
    time: Date;
    approachDistance: number;
    velocityChange: number;
  }>;
  energyAnalysis: {
    initialKinetic: number;
    finalKinetic: number;
    totalChange: number;
    conservationRatio: number;
  };
  health: PhysicsHealthStats;
}

// Impact prediction result
export interface ImpactPrediction {
  willImpact: boolean;
  targetBody?: string;
  impactTime?: Date;
  impactVelocity?: number;
  impactEnergy?: number;
  impactAngle?: number;
  confidence: number; // 0-1
}

// Physics health statistics
export interface PhysicsHealthStats {
  energyConservation: number; // Should be close to 1.0
  numericalStability: number; // 0-1, higher is better
  collisionRisk: number; // 0-1, higher means more collision risk
  timestepQuality: number; // 0-1, adaptive timestep effectiveness
  totalSteps: number;
  failedSteps: number;
  warnings: string[];
}

/**
 * Enhanced N-Body Physics Simulator with Velocity-Verlet Integration
 */
export class StableNBodySimulator {
  private state: PhysicsState;
  private baseTimeStep: number; // Base time step in days
  private adaptiveTimeStep: boolean;
  private softeningParameter: number; // ε for gravitational softening
  private maxTimeStep: number;
  private minTimeStep: number;
  private energyTolerance: number;
  private stepCount: number;
  private failedSteps: number;
  private warnings: string[];

  constructor(
    baseTimeStep: number = 0.1,
    adaptiveTimeStep: boolean = true,
    softeningParameter: number = 1e-3
  ) {
    this.baseTimeStep = baseTimeStep;
    this.adaptiveTimeStep = adaptiveTimeStep;
    this.softeningParameter = softeningParameter;
    this.maxTimeStep = 0.2; // Cap maximum timestep
    this.minTimeStep = 0.05; // Cap minimum timestep
    this.energyTolerance = 1e-6; // Energy conservation tolerance
    this.stepCount = 0;
    this.failedSteps = 0;
    this.warnings = [];

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
    this.stepCount = 0;
    this.failedSteps = 0;
    this.warnings = [];

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
          z: data.velocity.vz,
        },
        acceleration: { x: 0, y: 0, z: 0 },
        radius,
        fixed: false,
        trail: [{ ...data.position, time: 0 }],
      });
    });

    this.calculateTotalEnergy();
    console.log(`[Stable Physics] Initialized with ${this.state.bodies.size} bodies`);
  }

  /**
   * Advance simulation by one adaptive time step using Velocity-Verlet
   */
  step(): boolean {
    try {
      const currentTimeStep = this.adaptiveTimeStep 
        ? this.calculateAdaptiveTimeStep() 
        : this.baseTimeStep;

      // Clamp timestep to bounds
      const clampedTimeStep = Math.max(this.minTimeStep, Math.min(this.maxTimeStep, currentTimeStep));

      this.velocityVerletStep(clampedTimeStep);
      this.state.time += clampedTimeStep;
      this.updateTrails();
      this.calculateTotalEnergy();
      this.stepCount++;

      // Validate energy conservation
      if (this.stepCount > 0 && !this.validateEnergyConservation()) {
        this.warnings.push(`Energy conservation violated at step ${this.stepCount}`);
      }

      return true;
    } catch (error) {
      this.failedSteps++;
      this.warnings.push(`Physics step failed at step ${this.stepCount}: ${error}`);
      console.warn('[Stable Physics] Step failed:', error);
      return false;
    }
  }

  /**
   * Velocity-Verlet integration with gravitational softening
   */
  private velocityVerletStep(dt: number): void {
    const bodies = Array.from(this.state.bodies.values());

    // Step 1: Calculate initial accelerations
    this.calculateGravitationalForces();

    // Step 2: Update positions and velocities
    bodies.forEach(body => {
      if (body.fixed) return;

      // Update position: x(t+dt) = x(t) + v(t)*dt + 0.5*a(t)*dt²
      body.position.x += body.velocity.x * dt + 0.5 * body.acceleration.x * dt * dt;
      body.position.y += body.velocity.y * dt + 0.5 * body.acceleration.y * dt * dt;
      body.position.z += body.velocity.z * dt + 0.5 * body.acceleration.z * dt * dt;

      // Store current acceleration for velocity update
      const prevAcceleration = { ...body.acceleration };

      // Step 3: Calculate new accelerations at new positions
      this.calculateGravitationalForces();

      // Step 4: Update velocity: v(t+dt) = v(t) + 0.5*(a(t) + a(t+dt))*dt
      body.velocity.x += 0.5 * (prevAcceleration.x + body.acceleration.x) * dt;
      body.velocity.y += 0.5 * (prevAcceleration.y + body.acceleration.y) * dt;
      body.velocity.z += 0.5 * (prevAcceleration.z + body.acceleration.z) * dt;

      // Validate and clamp values
      this.validateAndClampBody(body);
    });
  }

  /**
   * Calculate gravitational forces with softening parameter
   */
  private calculateGravitationalForces(): void {
    const bodies = Array.from(this.state.bodies.values());

    // Reset accelerations
    bodies.forEach(body => {
      if (!body.fixed) {
        body.acceleration = { x: 0, y: 0, z: 0 };
      }
    });

    // Calculate pairwise gravitational forces with softening
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const body1 = bodies[i];
        const body2 = bodies[j];

        if (body1.fixed && body2.fixed) continue; // No force between two fixed bodies

        const force = this.calculateSoftenedGravitationalForce(body1, body2);

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
   * Calculate gravitational force with softening parameter ε
   */
  private calculateSoftenedGravitationalForce(body1: PhysicsBody, body2: PhysicsBody): { x: number; y: number; z: number } {
    const dx = body2.position.x - body1.position.x;
    const dy = body2.position.y - body1.position.y;
    const dz = body2.position.z - body1.position.z;

    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // Apply softening: r → sqrt(r² + ε²)
    const softenedDistance = Math.sqrt(distance * distance + this.softeningParameter * this.softeningParameter);

    // Avoid singularities (collisions or very close approaches)
    const minDistance = (body1.radius + body2.radius) * 1.1;
    const effectiveDistance = Math.max(softenedDistance, minDistance);

    const forceMagnitude = (PHYSICAL_CONSTANTS.G * body1.mass * body2.mass) / (effectiveDistance * effectiveDistance * effectiveDistance);

    const forceX = forceMagnitude * dx;
    const forceY = forceMagnitude * dy;
    const forceZ = forceMagnitude * dz;

    return { x: forceX, y: forceY, z: forceZ };
  }

  /**
   * Calculate adaptive timestep based on system dynamics
   */
  private calculateAdaptiveTimeStep(): number {
    const bodies = Array.from(this.state.bodies.values());
    let minTimeStep = this.maxTimeStep;

    bodies.forEach(body => {
      if (body.fixed) return;

      // Calculate timestep based on acceleration (higher acceleration = smaller timestep)
      const accelerationMagnitude = Math.sqrt(
        body.acceleration.x ** 2 + body.acceleration.y ** 2 + body.acceleration.z ** 2
      );

      if (accelerationMagnitude > 0) {
        const adaptiveStep = 0.1 / Math.sqrt(accelerationMagnitude);
        minTimeStep = Math.min(minTimeStep, adaptiveStep);
      }

      // Check for close approaches that require smaller timesteps
      bodies.forEach(otherBody => {
        if (otherBody.id === body.id || otherBody.fixed) return;

        const dx = otherBody.position.x - body.position.x;
        const dy = otherBody.position.y - body.position.y;
        const dz = otherBody.position.z - body.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < 0.1) { // Close approach threshold
          const closeApproachStep = distance * 0.01; // Scale timestep with distance
          minTimeStep = Math.min(minTimeStep, closeApproachStep);
        }
      });
    });

    return Math.max(this.minTimeStep, Math.min(this.maxTimeStep, minTimeStep));
  }

  /**
   * Validate and clamp body properties to prevent NaN propagation
   */
  private validateAndClampBody(body: PhysicsBody): void {
    // Clamp position
    body.position.x = Math.max(-100, Math.min(100, body.position.x));
    body.position.y = Math.max(-100, Math.min(100, body.position.y));
    body.position.z = Math.max(-100, Math.min(100, body.position.z));

    // Clamp velocity
    const velocityMagnitude = Math.sqrt(
      body.velocity.x ** 2 + body.velocity.y ** 2 + body.velocity.z ** 2
    );
    if (velocityMagnitude > 10) { // Cap extreme velocities
      const scale = 10 / velocityMagnitude;
      body.velocity.x *= scale;
      body.velocity.y *= scale;
      body.velocity.z *= scale;
    }

    // Clamp acceleration
    body.acceleration.x = Math.max(-100, Math.min(100, body.acceleration.x));
    body.acceleration.y = Math.max(-100, Math.min(100, body.acceleration.y));
    body.acceleration.z = Math.max(-100, Math.min(100, body.acceleration.z));
  }

  /**
   * Validate energy conservation
   */
  private validateEnergyConservation(): boolean {
    if (this.state.totalEnergy === 0) return true;
    const conservationRatio = Math.abs(this.state.totalEnergy) / 
      Math.max(this.state.kineticEnergy, Math.abs(this.state.potentialEnergy));
    return conservationRatio > (1 - this.energyTolerance) && conservationRatio < (1 + this.energyTolerance);
  }

  /**
   * Update position trails for visualization
   */
  private updateTrails(): void {
    this.state.bodies.forEach(body => {
      body.trail.push({ ...body.position, time: this.state.time });

      // Limit trail length
      if (body.trail.length > 100) {
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

    // Calculate potential energy (gravitational) with softening
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const body1 = bodies[i];
        const body2 = bodies[j];

        const dx = body2.position.x - body1.position.x;
        const dy = body2.position.y - body1.position.y;
        const dz = body2.position.z - body1.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        const softenedDistance = Math.sqrt(distance * distance + this.softeningParameter * this.softeningParameter);

        if (softenedDistance > 0) {
          potentialEnergy -= (PHYSICAL_CONSTANTS.G * body1.mass * body2.mass) / softenedDistance;
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
   * Get physics health statistics
   */
  getHealthStats(): PhysicsHealthStats {
    const energyConservation = this.state.totalEnergy !== 0 
      ? Math.abs(this.state.totalEnergy) / Math.max(this.state.kineticEnergy, Math.abs(this.state.potentialEnergy))
      : 1.0;

    const numericalStability = this.validateEnergyConservation() ? 1.0 : energyConservation;
    const collisionRisk = this.calculateCollisionRisk();
    const timestepQuality = this.calculateTimestepQuality();

    return {
      energyConservation,
      numericalStability,
      collisionRisk,
      timestepQuality,
      totalSteps: this.stepCount,
      failedSteps: this.failedSteps,
      warnings: [...this.warnings],
    };
  }

  /**
   * Calculate collision risk metric
   */
  private calculateCollisionRisk(): number {
    const bodies = Array.from(this.state.bodies.values());
    let minDistance = Infinity;

    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const body1 = bodies[i];
        const body2 = bodies[j];

        const dx = body2.position.x - body1.position.x;
        const dy = body2.position.y - body1.position.y;
        const dz = body2.position.z - body1.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        minDistance = Math.min(minDistance, distance);
      }
    }

    // Risk increases as minimum distance decreases
    return Math.max(0, 1 - minDistance / 0.1);
  }

  /**
   * Calculate adaptive timestep quality
   */
  private calculateTimestepQuality(): number {
    const currentTimeStep = this.adaptiveTimeStep 
      ? this.calculateAdaptiveTimeStep() 
      : this.baseTimeStep;
    
    const clampedTimeStep = Math.max(this.minTimeStep, Math.min(this.maxTimeStep, currentTimeStep));
    
    // Quality is 1.0 when timestep is within adaptive bounds
    if (clampedTimeStep === currentTimeStep) return 1.0;
    
    // Quality decreases when timestep needs to be clamped
    return Math.min(1.0, clampedTimeStep / currentTimeStep);
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
        velocity: { vx: body.velocity.x, vy: body.velocity.y, vz: body.velocity.z },
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
    this.stepCount = 0;
    this.failedSteps = 0;
    this.warnings = [];

    this.state.bodies.forEach(body => {
      body.acceleration = { x: 0, y: 0, z: 0 };
      body.trail = [body.trail[0] || { ...body.position, time: 0 }];
    });

    this.calculateTotalEnergy();
  }

  /**
   * Set base timestep
   */
  setBaseTimeStep(timeStep: number): void {
    this.baseTimeStep = Math.max(this.minTimeStep, Math.min(this.maxTimeStep, timeStep));
  }

  /**
   * Enable/disable adaptive timestep
   */
  setAdaptiveTimeStep(enabled: boolean): void {
    this.adaptiveTimeStep = enabled;
  }
}

// Physics simulation state
interface PhysicsState {
  bodies: Map<string, PhysicsBody>;
  time: number; // Current simulation time in days
  totalEnergy: number;
  kineticEnergy: number;
  potentialEnergy: number;
}

// Individual body in physics simulation
interface PhysicsBody {
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
 * Main Trajectory Calculator Class
 */
export class TrajectoryCalculator {
  private simulator: StableNBodySimulator;
  private currentScenario: ScenarioPreset | null = null;

  constructor(timeStep: number = 0.1) {
    this.simulator = new StableNBodySimulator(timeStep, true, 1e-3); // Enable adaptive timestep and softening
  }

  /**
   * Calculate trajectory prediction for a given scenario
   */
  async calculateTrajectory(
    initialConditions: VectorData,
    scenario: ScenarioPreset,
    predictionDays: number = 365
  ): Promise<TrajectoryPrediction> {
    this.currentScenario = scenario;

    // Initialize simulator with solar system
    const solarSystemPositions = this.generateSolarSystemForScenario(scenario);
    this.simulator.initializeWithSolarSystem(solarSystemPositions);

    // Set up 3I/ATLAS with initial conditions
    const atlasBody: PhysicsBody = {
      id: 'atlas',
      name: '3I/ATLAS',
      mass: 1e-12, // Small mass for comet
      position: { ...initialConditions.position },
      velocity: {
        x: initialConditions.velocity.vx,
        y: initialConditions.velocity.vy,
        z: initialConditions.velocity.vz,
      },
      acceleration: { x: 0, y: 0, z: 0 },
      radius: 0.00001, // Small radius for comet
      fixed: false,
      trail: [{ ...initialConditions.position, time: 0 }],
    };

    this.simulator['state'].bodies.set('atlas', atlasBody);

    // Run simulation
    const positions: VectorData[] = [];
    const impacts: TrajectoryPrediction['impacts'] = [];
    const slingshots: TrajectoryPrediction['slingshots'] = [];
    let closestApproach = {
      distance: Infinity,
      time: new Date(),
      body: '',
    };

    const stepsPerDay = Math.floor(1 / this.simulator['baseTimeStep']);
    const totalSteps = predictionDays * stepsPerDay;

    for (let step = 0; step < totalSteps; step++) {
      // Record position every day
      if (step % stepsPerDay === 0) {
        const currentPositions = this.simulator.getPositions();
        positions.push(currentPositions.atlas);

        // Check for events
        this.checkForEvents(currentPositions, step / stepsPerDay, impacts, slingshots, closestApproach);
      }

      if (!this.simulator.step()) {
        console.warn(`[Trajectory] Physics step failed at step ${step}, stopping simulation`);
        break;
      }
    }

    // Calculate energy analysis
    const initialEnergy = this.calculateInitialEnergy(atlasBody);
    const finalEnergy = this.calculateFinalEnergy(atlasBody);

    return {
      positions,
      closestApproach,
      impacts,
      slingshots,
      energyAnalysis: {
        initialKinetic: initialEnergy.kinetic,
        finalKinetic: finalEnergy.kinetic,
        totalChange: finalEnergy.total - initialEnergy.total,
        conservationRatio: finalEnergy.total / initialEnergy.total,
      },
      health: this.simulator.getHealthStats(),
    };
  }

  /**
   * Calculate initial energy of a body
   */
  private calculateInitialEnergy(body: PhysicsBody): { kinetic: number; potential: number; total: number } {
    const kinetic = 0.5 * body.mass *
      (body.velocity.x ** 2 + body.velocity.y ** 2 + body.velocity.z ** 2);

    const distanceFromSun = Math.sqrt(body.position.x ** 2 + body.position.y ** 2 + body.position.z ** 2);
    const potential = -PHYSICAL_CONSTANTS.G * PHYSICAL_CONSTANTS.SUN_MASS * body.mass / distanceFromSun;

    return {
      kinetic,
      potential,
      total: kinetic + potential,
    };
  }

  /**
   * Calculate final energy of a body
   */
  private calculateFinalEnergy(body: PhysicsBody): { kinetic: number; potential: number; total: number } {
    return this.calculateInitialEnergy(body); // Same calculation for current state
  }

  /**
   * Check for events during trajectory simulation
   */
  private checkForEvents(
    positions: Record<string, VectorData>,
    day: number,
    impacts: TrajectoryPrediction['impacts'],
    slingshots: TrajectoryPrediction['slingshots'],
    closestApproach: TrajectoryPrediction['closestApproach']
  ): void {
    const atlasPos = positions.atlas;
    if (!atlasPos) return;

    Object.entries(positions).forEach(([bodyId, bodyData]) => {
      if (bodyId === 'atlas') return;

      const distance = Math.sqrt(
        Math.pow(bodyData.position.x - atlasPos.position.x, 2) +
        Math.pow(bodyData.position.y - atlasPos.position.y, 2) +
        Math.pow(bodyData.position.z - atlasPos.position.z, 2)
      );

      // Update closest approach
      if (distance < closestApproach.distance) {
        closestApproach.distance = distance;
        closestApproach.time = new Date(Date.now() + day * 24 * 60 * 60 * 1000);
        closestApproach.body = bodyId;
      }

      // Check for impacts
      const bodyRadius = this.getBodyRadius(bodyId);
      if (distance <= bodyRadius) {
        const relativeVelocity = Math.sqrt(
          Math.pow(bodyData.velocity.vx - atlasPos.velocity.vx, 2) +
          Math.pow(bodyData.velocity.vy - atlasPos.velocity.vy, 2) +
          Math.pow(bodyData.velocity.vz - atlasPos.velocity.vz, 2)
        );

        impacts.push({
          body: bodyId,
          time: new Date(Date.now() + day * 24 * 60 * 60 * 1000),
          velocity: relativeVelocity,
          energy: 0.5 * (BODY_MASSES.atlas || 1e-12) * relativeVelocity * relativeVelocity,
        });
      }

      // Check for slingshots (close approaches)
      if (distance < 0.01 && distance > bodyRadius) {
        slingshots.push({
          body: bodyId,
          time: new Date(Date.now() + day * 24 * 60 * 60 * 1000),
          approachDistance: distance,
          velocityChange: this.calculateSlingshotDeltaV(bodyId, distance),
        });
      }
    });
  }

  /**
   * Calculate velocity change from gravitational slingshot
   */
  private calculateSlingshotDeltaV(body: string, approachDistance: number): number {
    const bodyMass = BODY_MASSES[body] || 1e-6;
    const vEscape = Math.sqrt(2 * PHYSICAL_CONSTANTS.G * bodyMass / approachDistance);

    // Simplified - actual calculation depends on trajectory geometry
    return Math.min(vEscape * 0.8, 5.0); // Cap at reasonable value
  }

  /**
   * Get body radius for collision detection
   */
  private getBodyRadius(bodyId: string): number {
    const radii: Record<string, number> = {
      sun: 0.00465,
      mercury: 0.000016,
      venus: 0.000040,
      earth: 0.000042,
      mars: 0.000022,
      jupiter: 0.00047,
      saturn: 0.00040,
    };

    return radii[bodyId] || 0.00001;
  }

  /**
   * Generate solar system positions for a specific scenario
   */
  private generateSolarSystemForScenario(scenario: ScenarioPreset): Record<string, VectorData> {
    // This would integrate with the solar-system-positions.ts
    // For now, return a basic structure
    return {
      sun: {
        jd: 2451545.0,
        date: new Date().toISOString(),
        position: { x: 0, y: 0, z: 0 },
        velocity: { vx: 0, vy: 0, vz: 0 },
      },
      earth: {
        jd: 2451545.0,
        date: new Date().toISOString(),
        position: { x: 1.0, y: 0, z: 0 },
        velocity: { vx: 0, vy: 6.28, vz: 0 },
      },
      jupiter: {
        jd: 2451545.0,
        date: new Date().toISOString(),
        position: { x: 5.2, y: 0, z: 0 },
        velocity: { vx: 0, vy: 2.76, vz: 0 },
      },
    };
  }

  /**
   * Get current scenario
   */
  getCurrentScenario(): ScenarioPreset | null {
    return this.currentScenario;
  }

  /**
   * Set scenario preset
   */
  setScenario(scenario: ScenarioPreset): void {
    this.currentScenario = scenario;
  }
}

/**
 * Create trajectory calculator instance
 */
export function createTrajectoryCalculator(timeStep?: number): TrajectoryCalculator {
  return new TrajectoryCalculator(timeStep);
}

/**
 * Utility functions for trajectory analysis
 */
export class TrajectoryAnalysis {
  /**
   * Calculate orbital elements from position and velocity vectors
   */
  static calculateOrbitalElements(position: VectorData): {
    semiMajorAxis: number;
    eccentricity: number;
    inclination: number;
    longitudeOfNode: number;
    argumentOfPeriapsis: number;
    trueAnomaly: number;
  } {
    // Simplified orbital elements calculation
    // Full implementation would use proper astronomical algorithms

    const r = Math.sqrt(position.position.x ** 2 + position.position.y ** 2 + position.position.z ** 2);
    const v = Math.sqrt(position.velocity.vx ** 2 + position.velocity.vy ** 2 + position.velocity.vz ** 2);

    // Semi-major axis (vis-viva equation)
    const semiMajorAxis = 1 / (2 / r - v ** 2 / PHYSICAL_CONSTANTS.G);

    // Eccentricity (simplified)
    const eccentricity = Math.max(0, 1 - r / semiMajorAxis);

    return {
      semiMajorAxis,
      eccentricity,
      inclination: 0, // Would need proper calculation
      longitudeOfNode: 0,
      argumentOfPeriapsis: 0,
      trueAnomaly: 0,
    };
  }

  /**
   * Calculate time to closest approach between two bodies
   */
  static calculateTimeToClosestApproach(
    body1Pos: { x: number; y: number; z: number },
    body1Vel: { x: number; y: number; z: number },
    body2Pos: { x: number; y: number; z: number },
    body2Vel: { x: number; y: number; z: number }
  ): { time: number; distance: number } {
    // Simplified calculation - assumes straight line motion
    const relativePos = {
      x: body2Pos.x - body1Pos.x,
      y: body2Pos.y - body1Pos.y,
      z: body2Pos.z - body1Pos.z,
    };

    const relativeVel = {
      x: body2Vel.x - body1Vel.x,
      y: body2Vel.y - body1Vel.y,
      z: body2Vel.z - body1Vel.z,
    };

    const distance = Math.sqrt(relativePos.x ** 2 + relativePos.y ** 2 + relativePos.z ** 2);
    const speed = Math.sqrt(relativeVel.x ** 2 + relativeVel.y ** 2 + relativeVel.z ** 2);

    if (speed === 0) {
      return { time: 0, distance };
    }

    return {
      time: distance / speed,
      distance,
    };
  }
}
