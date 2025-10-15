# 3I/ATLAS Trajectory Plotter Enhancement Plan

## Executive Summary

This document outlines a two-phase implementation plan to enhance the TrajectoryPlotterView component with pre-calculated scenario toggles and interactive physics sandbox capabilities. The plan leverages the existing StableNBodySimulator and SCENARIO_PRESETS infrastructure while adding new functionality for user interaction and trajectory visualization.

## Current State Analysis

### Existing Capabilities

- **Physics Engine**: StableNBodySimulator with Velocity-Verlet integration, adaptive timesteps, and gravitational softening
- **Trajectory Calculation**: Real-time trajectory prediction with impact detection and slingshot calculations
- **3D Visualization**: Interactive Three.js scene with drag-and-drop comet positioning
- **Scenario Presets**: Four predefined scenarios (Earth Impact, Jupiter Slingshot, Mars Flyby, Solar Closeup) defined in SCENARIO_PRESETS
- **Performance Optimizations**: Object pooling, debounced trajectory updates, and memory management

### Current Limitations

- Scenario buttons are present but not connected to actual functionality
- No pre-calculated trajectory data for instant scenario switching
- Limited user interaction beyond drag-and-drop positioning
- No persistence of trajectory calculations between sessions

## Phase 1: Trajectory Toggle Implementation

### Overview

Implement pre-calculated trajectory scenarios that can be instantly toggled, providing immediate visual feedback without real-time physics calculations.

### Technical Implementation

#### 1.1 Trajectory Data Pre-calculation

```typescript
// New file: lib/trajectory-precalculator.ts
export class TrajectoryPrecalculator {
  // Pre-calculate and cache trajectory data for all scenarios
  async precalculateScenarios(): Promise<Record<string, TrajectoryPrediction>>
  
  // Generate trajectory data for a specific scenario
  private generateScenarioTrajectory(scenario: ScenarioPreset): Promise<TrajectoryPrediction>
  
  // Store pre-calculated data in JSON format
  private storeTrajectoryData(data: Record<string, TrajectoryPrediction>): Promise<void>
}
```

#### 1.2 Enhanced TrajectoryPlotterView

```typescript
// Modifications to components/views/TrajectoryPlotterView.tsx
const TrajectoryPlotterView: React.FC<TrajectoryPlotterViewProps> = ({
  solarSystemData,
  onTrajectoryChange,
  className = ''
}) => {
  // Add state for current scenario and pre-calculated data
  const [currentScenario, setCurrentScenario] = useState<string>('current');
  const [precalculatedTrajectories, setPrecalculatedTrajectories] = useState<Record<string, TrajectoryPrediction>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Add scenario toggle handlers
  const handleScenarioChange = useCallback(async (scenarioKey: string) => {
    if (precalculatedTrajectories[scenarioKey]) {
      setCurrentScenario(scenarioKey);
      updateTrajectoryVisualization(precalculatedTrajectories[scenarioKey]);
    }
  }, [precalculatedTrajectories]);
  
  // Enhanced trajectory visualization
  const updateTrajectoryVisualization = useCallback((trajectory: TrajectoryPrediction) => {
    // Update trajectory line with pre-calculated points
    // Update physics dashboard with scenario-specific data
    // Show closest approach and impact predictions
  }, []);
};
```

#### 1.3 Scenario UI Enhancement

```typescript
// Enhanced scenario buttons with loading states
<div className="absolute top-4 right-4 bg-black/90 text-white p-4 rounded-lg">
  <h4 className="font-bold mb-2">Scenarios</h4>
  <div className="space-y-2">
    {Object.entries(SCENARIO_PRESETS).map(([key, scenario]) => (
      <button
        key={key}
        onClick={() => handleScenarioChange(key)}
        disabled={isLoading}
        className={`block w-full text-left px-3 py-1 rounded text-sm transition-colors
          ${currentScenario === key ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {scenario.name}
        {currentScenario === key && <span className="ml-2">✓</span>}
      </button>
    ))}
  </div>
  <button
    onClick={() => handleScenarioChange('current')}
    className="block w-full text-left px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm mt-2"
  >
    Current Trajectory
  </button>
</div>
```

#### 1.4 Trajectory Visualization Enhancements

```typescript
// Enhanced trajectory line rendering with scenario-specific styling
const updateTrajectoryLine = useCallback((trajectory: TrajectoryPrediction) => {
  const positions = new Float32Array(trajectory.positions.length * 3);
  trajectory.positions.forEach((point, i) => {
    positions[i * 3] = point.position.x;
    positions[i * 3 + 1] = point.position.y;
    positions[i * 3 + 2] = point.position.z;
  });
  
  trajectoryLine.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  // Color code trajectory based on scenario outcome
  const outcomeColor = getOutcomeColor(trajectory.impacts.length > 0 ? 'impact' : 'safe');
  trajectoryLine.material.color.setHex(outcomeColor);
}, []);

const getOutcomeColor = (outcome: string): number => {
  switch (outcome) {
    case 'impact': return 0xff0000; // Red
    case 'slingshot': return 0x00ff00; // Green
    case 'flyby': return 0x00aaff; // Blue
    default: return 0x00ff88; // Default green
  }
};
```

### Performance Optimizations

- Cache pre-calculated trajectories in localStorage for instant loading
- Use Web Workers for background trajectory calculations
- Implement progressive loading with low-resolution preview first
- Add compression for trajectory data storage

## Phase 2: Live Physics Sandbox Enhancement

### Overview

Enhance the existing physics sandbox with more interactive controls, real-time parameter adjustments, and advanced visualization features.

### Technical Implementation

#### 2.1 Interactive Control Panel

```typescript
// New component: components/controls/PhysicsControlPanel.tsx
interface PhysicsControlPanelProps {
  simulator: StableNBodySimulator;
  onParameterChange: (params: PhysicsParameters) => void;
}

interface PhysicsParameters {
  timeStep: number;
  adaptiveTimeStep: boolean;
  softeningParameter: number;
  showTrails: boolean;
  showVelocityVectors: boolean;
  showForceVectors: boolean;
  trailLength: number;
}

const PhysicsControlPanel: React.FC<PhysicsControlPanelProps> = ({
  simulator,
  onParameterChange
}) => {
  // Real-time parameter controls
  // Time step adjustment with visual feedback
  // Toggle switches for visualization options
  // Reset and pause/play controls
};
```

#### 2.2 Enhanced Visualization Features

```typescript
// Enhanced TrajectoryPlotterView with new visualization options
const TrajectoryPlotterView: React.FC<TrajectoryPlotterViewProps> = ({
  solarSystemData,
  onTrajectoryChange,
  className = ''
}) => {
  // Add visualization state
  const [showVelocityVectors, setShowVelocityVectors] = useState(false);
  const [showForceVectors, setShowForceVectors] = useState(false);
  const [showTrails, setShowTrails] = useState(true);
  const [trailLength, setTrailLength] = useState(100);
  
  // Enhanced rendering with optional visualizations
  const renderVelocityVectors = useCallback(() => {
    // Render velocity vectors as arrows
    // Scale based on velocity magnitude
    // Color code by speed
  }, []);
  
  const renderForceVectors = useCallback(() => {
    // Render gravitational force vectors
    // Show attraction between bodies
    // Scale based on force magnitude
  }, []);
  
  const renderTrails = useCallback(() => {
    // Render motion trails for all bodies
    // Adjustable trail length
    // Fade effect for older positions
  }, []);
};
```

#### 2.3 Advanced Interaction Features

```typescript
// Enhanced interaction capabilities
const TrajectoryPlotterView: React.FC<TrajectoryPlotterViewProps> = ({
  solarSystemData,
  onTrajectoryChange,
  className = ''
}) => {
  // Multi-body selection and manipulation
  const [selectedBodies, setSelectedBodies] = useState<Set<string>>(new Set());
  
  // Velocity adjustment tools
  const [velocityAdjustmentMode, setVelocityAdjustmentMode] = useState(false);
  
  // Time control
  const [simulationSpeed, setSimulationSpeed] = useState(1.0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Enhanced mouse interactions
  const handleBodySelection = useCallback((bodyId: string) => {
    setSelectedBodies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bodyId)) {
        newSet.delete(bodyId);
      } else {
        newSet.add(bodyId);
      }
      return newSet;
    });
  }, []);
  
  const handleVelocityAdjustment = useCallback((bodyId: string, deltaVelocity: Vector3) => {
    const body = simulator.getState().bodies.get(bodyId);
    if (body && !body.fixed) {
      body.velocity.x += deltaVelocity.x;
      body.velocity.y += deltaVelocity.y;
      body.velocity.z += deltaVelocity.z;
      updateTrajectory();
    }
  }, [simulator]);
};
```

#### 2.4 Real-time Analysis Tools

```typescript
// New component: components/analysis/RealTimeAnalysis.tsx
interface RealTimeAnalysisProps {
  simulator: StableNBodySimulator;
  selectedBodies: Set<string>;
}

const RealTimeAnalysis: React.FC<RealTimeAnalysisProps> = ({
  simulator,
  selectedBodies
}) => {
  // Real-time orbital element calculation
  // Energy and momentum tracking
  // Close approach prediction
  // Stability analysis
  
  const [orbitalElements, setOrbitalElements] = useState<Record<string, OrbitalElements>>({});
  const [energyHistory, setEnergyHistory] = useState<number[]>([]);
  const [closeApproaches, setCloseApproaches] = useState<CloseApproach[]>([]);
  
  // Calculate and update analysis in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      updateOrbitalElements();
      updateEnergyHistory();
      updateCloseApproaches();
    }, 100); // Update every 100ms
    
    return () => clearInterval(interval);
  }, [simulator, selectedBodies]);
};
```

### Performance Optimizations

- Implement level-of-detail (LOD) for trajectory rendering
- Use instanced rendering for force vectors
- Add culling for off-screen objects
- Optimize physics calculations with spatial partitioning

## Implementation Timeline

### Phase 1: Trajectory Toggle (2-3 weeks)

1. **Week 1**: Trajectory pre-calculation system
   - Implement TrajectoryPrecalculator class
   - Create pre-calculation script
   - Generate initial trajectory data

2. **Week 2**: UI enhancements
   - Connect scenario buttons to functionality
   - Implement scenario switching
   - Add loading states and transitions

3. **Week 3**: Visualization improvements
   - Enhanced trajectory line rendering
   - Scenario-specific styling
   - Performance optimizations

### Phase 2: Live Physics Sandbox (3-4 weeks)

1. **Week 1**: Control panel implementation
   - PhysicsControlPanel component
   - Real-time parameter controls
   - Time control features

2. **Week 2**: Enhanced visualization
   - Velocity and force vector rendering
   - Trail system improvements
   - Multi-body selection

3. **Week 3**: Advanced interactions
   - Velocity adjustment tools
   - Multi-body manipulation
   - Enhanced mouse controls

4. **Week 4**: Analysis tools and polish
   - Real-time analysis components
   - Performance optimizations
   - Testing and refinement

## Technical Considerations

### Performance

- Maintain 60fps target with enhanced features
- Use Web Workers for background calculations
- Implement progressive loading for large trajectory datasets
- Optimize Three.js rendering with object pooling

### User Experience

- Provide clear visual feedback for all interactions
- Ensure smooth transitions between scenarios
- Implement intuitive controls for physics parameters
- Add helpful tooltips and instructions

### Data Management

- Cache pre-calculated trajectories efficiently
- Implement data compression for storage
- Provide fallback for missing trajectory data
- Ensure data integrity for physics calculations

## Success Metrics

### Phase 1 Success Criteria

- [ ] Scenario switching completes within 100ms
- [ ] All four predefined scenarios render correctly
- [ ] Trajectory visualization matches scenario outcomes
- [ ] No performance regression from current implementation

### Phase 2 Success Criteria

- [ ] Real-time parameter adjustments work smoothly
- [ ] Multi-body selection and manipulation implemented
- [ ] Advanced visualization features render at 60fps
- [ ] Analysis tools provide accurate real-time data

## Conclusion

This two-phase enhancement plan will significantly improve the TrajectoryPlotterView by providing both instant scenario access and advanced physics sandbox capabilities. The implementation leverages existing infrastructure while adding new features for enhanced user interaction and visualization. The phased approach ensures manageable development cycles and allows for testing and refinement at each stage.
