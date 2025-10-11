/**
 * Type definitions for @kjfsoul/atlas-directive
 * 
 * These types provide TypeScript support for the ATLAS Directive game component.
 * Update these definitions based on the actual package API when it's published.
 */

declare module '@kjfsoul/atlas-directive' {
  import { ReactNode } from 'react';

  /**
   * Game state interface for save/load functionality
   */
  export interface GameState {
    /** Current chapter/node ID in the narrative tree */
    currentNodeId: string;
    
    /** Player choices made so far */
    choices: Array<{
      nodeId: string;
      choiceId: string;
      timestamp: number;
    }>;
    
    /** Player progress percentage (0-100) */
    progress: number;
    
    /** Unlocked achievements */
    achievements: string[];
    
    /** Custom game variables */
    variables: Record<string, unknown>;
    
    /** Last saved timestamp */
    lastSaved: number;
  }

  /**
   * Theme configuration for the game UI
   */
  export type Theme = 'dark' | 'light' | 'auto';

  /**
   * Audio configuration
   */
  export interface AudioConfig {
    /** Enable sound effects */
    soundEnabled?: boolean;
    
    /** Enable background music */
    musicEnabled?: boolean;
    
    /** Master volume (0-1) */
    volume?: number;
  }

  /**
   * Configuration options for the ATLAS Directive component
   */
  export interface AtlasDirectiveConfig {
    /** Theme variant */
    theme?: Theme;
    
    /** Audio settings */
    audio?: AudioConfig;
    
    /** Enable autosave */
    autosave?: boolean;
    
    /** Autosave interval in milliseconds */
    autosaveInterval?: number;
    
    /** Enable analytics tracking */
    analytics?: boolean;
    
    /** Custom CSS class name */
    className?: string;
    
    /** Enable debug mode */
    debug?: boolean;
  }

  /**
   * Event data for game events
   */
  export interface GameEvent {
    /** Event type */
    type: 'choice' | 'achievement' | 'progress' | 'save' | 'load' | 'exit';
    
    /** Event payload */
    payload: unknown;
    
    /** Event timestamp */
    timestamp: number;
  }

  /**
   * Props for the main ATLAS Directive component
   */
  export interface AtlasDirectiveProps {
    /** Callback when user exits the game */
    onExit?: () => void;
    
    /** Callback when game state changes */
    onStateChange?: (state: GameState) => void;
    
    /** Callback for game events */
    onEvent?: (event: GameEvent) => void;
    
    /** Initial game state (for loading saves) */
    initialState?: GameState;
    
    /** Configuration options */
    config?: AtlasDirectiveConfig;
    
    /** Custom rendering for loading state */
    loadingComponent?: ReactNode;
    
    /** Custom rendering for error state */
    errorComponent?: ReactNode;
    
    /** Additional CSS class names */
    className?: string;
  }

  /**
   * Main ATLAS Directive game component
   */
  export const AtlasDirective: React.FC<AtlasDirectiveProps>;

  /**
   * Utility function to validate game state
   */
  export function validateGameState(state: unknown): state is GameState;

  /**
   * Utility function to create a new game state
   */
  export function createNewGameState(): GameState;

  /**
   * Utility function to serialize game state for storage
   */
  export function serializeGameState(state: GameState): string;

  /**
   * Utility function to deserialize game state from storage
   */
  export function deserializeGameState(serialized: string): GameState | null;

  /**
   * Hook for managing game state with localStorage
   */
  export function useGameState(
    key?: string
  ): [GameState | null, (state: GameState) => void, () => void];

  /**
   * Context provider for game configuration
   */
  export const AtlasDirectiveProvider: React.FC<{
    children: ReactNode;
    config: AtlasDirectiveConfig;
  }>;

  /**
   * Hook to access game configuration
   */
  export function useAtlasDirectiveConfig(): AtlasDirectiveConfig;

  /**
   * Version of the package
   */
  export const VERSION: string;

  /**
   * Default export
   */
  export default AtlasDirective;
}

/**
 * Augment window interface if the package adds global properties
 */
declare global {
  interface Window {
    __ATLAS_DIRECTIVE_DEBUG__?: boolean;
  }
}

