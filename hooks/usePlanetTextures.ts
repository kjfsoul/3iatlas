import { useMemo } from 'react';
import { TextureLoader } from 'three';

interface PlanetTextures {
  diffuse: THREE.Texture | null;
  normal?: THREE.Texture | null;
  specular?: THREE.Texture | null;
}

interface UsePlanetTexturesResult {
  mercury: PlanetTextures;
  venus: PlanetTextures;
  earth: PlanetTextures;
  mars: PlanetTextures;
  jupiter: PlanetTextures;
  saturn: PlanetTextures;
  uranus: PlanetTextures;
  neptune: PlanetTextures;
}

export function usePlanetTextures(): UsePlanetTexturesResult {
  const textureLoader = useMemo(() => new TextureLoader(), []);

  // Load textures with fallback to default
  const loadTexture = (path: string, fallbackPath: string = '/textures/default.jpg'): THREE.Texture | null => {
    try {
      return textureLoader.load(path, undefined, undefined, () => {
        // If main texture fails, try fallback
        console.warn(`Failed to load texture: ${path}, trying fallback: ${fallbackPath}`);
        return textureLoader.load(fallbackPath);
      });
    } catch (error) {
      console.error(`Error loading texture: ${path}`, error);
      return null;
    }
  };

  const mercury = useMemo(() => ({
    diffuse: loadTexture('/textures/mercury.jpg'),
  }), [textureLoader]);

  const venus = useMemo(() => ({
    diffuse: loadTexture('/textures/venus.jpg'),
  }), [textureLoader]);

  const earth = useMemo(() => ({
    diffuse: loadTexture('/textures/earth_diffuse.jpg'),
    normal: loadTexture('/textures/earth_normal.jpg'),
    specular: loadTexture('/textures/earth_specular.jpg'),
  }), [textureLoader]);

  const mars = useMemo(() => ({
    diffuse: loadTexture('/textures/mars.jpg'),
  }), [textureLoader]);

  const jupiter = useMemo(() => ({
    diffuse: loadTexture('/textures/jupiter.jpg'),
  }), [textureLoader]);

  const saturn = useMemo(() => ({
    diffuse: loadTexture('/textures/saturn.jpg'),
  }), [textureLoader]);

  const uranus = useMemo(() => ({
    diffuse: loadTexture('/textures/uranus.jpg'),
  }), [textureLoader]);

  const neptune = useMemo(() => ({
    diffuse: loadTexture('/textures/neptune.jpg'),
  }), [textureLoader]);

  return {
    mercury,
    venus,
    earth,
    mars,
    jupiter,
    saturn,
    uranus,
    neptune,
  };
}
