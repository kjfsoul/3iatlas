# Contributing to 3I/ATLAS

Thank you for your interest in contributing to the 3I/ATLAS Interactive Landing Page! This document provides guidelines and information for contributors.

---

## 🎯 Project Mission

We're building an awe-inspiring, interactive 3D visualization of the interstellar comet 3I/ATLAS (C/2025 N1) that makes users want to share it with friends. Our goal is to transform basic NASA data into a cinematic, gamified experience that educates and entertains.

### Core Values
- **Scientific Accuracy:** All data from NASA JPL Horizons API
- **Performance First:** 60fps target for 3D visualization
- **User Experience:** Intuitive, engaging, shareable
- **Code Quality:** TypeScript strict mode, no "any" types
- **Real Data Only:** No mock data, stubs, or hardcoded values

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git
- Basic understanding of React, TypeScript, and Three.js

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/3iatlas.git
   cd 3iatlas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   NEXT_PUBLIC_3IATLAS_BASE=https://your-printify-store.com
   NEXT_PUBLIC_ARCANA_BASE=https://your-arcana-store.com
   NEXT_PUBLIC_EDM_BASE=https://your-edm-store.com
   NEXT_PUBLIC_BDAY_BASE=https://your-bday-store.com
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3030
   ```

---

## 📋 Development Workflow

### Branch Naming Convention
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `perf/description` - Performance improvements

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(3d-tracker): add perihelion event view
fix(api): handle NASA Horizons API timeouts
docs(readme): update setup instructions
perf(rendering): optimize Three.js scene updates
```

---

## 🏗️ Architecture Guidelines

### Project Structure
```
3iatlas/
├── app/                    # Next.js App Router
│   ├── api/horizons/      # NASA API proxy routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── views/             # 3D tracker views
│   ├── utils/             # Utility components
│   └── *.tsx              # Main components
├── lib/                   # Core libraries
│   ├── horizons-api.ts    # NASA API integration
│   ├── horizons-cache.ts  # Caching system
│   └── *.ts               # Other utilities
├── docs/                  # Documentation
├── public/                # Static assets
└── tests/                 # Test files
```

### Component Guidelines

#### 3D Components
- **Use `@react-three/fiber`** for React integration
- **Wrap animation loops** with `withFrameGuard`
- **Call `setFps`** each frame for telemetry
- **Dispose resources** on unmount
- **Validate data** before rendering

#### API Components
- **Always use real NASA data** - no mock data
- **Handle errors gracefully** with fallbacks
- **Cache responses** for performance
- **Validate responses** before use

#### UI Components
- **Use Tailwind CSS** for styling
- **Follow responsive design** principles
- **Include proper ARIA labels** for accessibility
- **Test on mobile devices**

---

## 🔒 Critical Rules (NEVER VIOLATE)

### 1. NO Mock Data, NO Stubs, NO Hardcoded Values
```typescript
// ❌ WRONG - Never do this
const mockOrbitalData = {
  position: { x: 1, y: 2, z: 3 },
  velocity: { x: 0.1, y: 0.2, z: 0.3 }
};

// ✅ CORRECT - Always use real API calls
const response = await fetch('/api/horizons/ephemeris?COMMAND=1004083');
const realData = await response.json();
```

### 2. NO Changes to Printify Logic
- **Never modify** `FeaturedRow.tsx` without explicit request
- **Never modify** `printify.ts` without explicit request
- **All work** should be in new 3D tracker files only

### 3. NO TypeScript Errors
- **Strict mode enabled** - no implicit any
- **All types defined** - no "any" types
- **Run typecheck** before committing: `npm run typecheck`

### 4. Performance Requirements
- **60fps target** for 3D visualization
- **Use FrameGuard** for performance monitoring
- **Dispose resources** properly
- **Optimize for mobile** devices

### 5. Data Validation
- **Validate all API responses** before use
- **Check for NaN values** in 3D calculations
- **Handle edge cases** gracefully
- **Log errors** for debugging

---

## 🧪 Testing Guidelines

### E2E Testing with Playwright
```bash
# Run all tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run specific test
npx playwright test tests/3d-tracker.spec.ts
```

### Test Coverage Areas
- **3D Tracker:** Interactive visualization testing
- **API Routes:** NASA Horizons integration
- **Performance:** FrameGuard telemetry validation
- **Responsive:** Mobile and desktop compatibility

### Writing Tests
```typescript
// Example test structure
import { test, expect } from '@playwright/test';

test('3D tracker loads and displays 3I/ATLAS', async ({ page }) => {
  await page.goto('/');
  
  // Wait for 3D scene to load
  await page.waitForSelector('[data-testid="3d-tracker"]');
  
  // Verify 3I/ATLAS is visible
  const comet = page.locator('[data-testid="comet-3i-atlas"]');
  await expect(comet).toBeVisible();
  
  // Test interaction
  await page.click('[data-testid="play-button"]');
  await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();
});
```

---

## 🚀 Performance Guidelines

### 3D Rendering Performance
- **Target 60fps** for smooth animation
- **Use `withFrameGuard`** for performance monitoring
- **Implement adaptive quality** based on performance
- **Dispose unused resources** immediately

### API Performance
- **Cache responses** for 7 days
- **Implement fallbacks** for API failures
- **Use request deduplication** for identical requests
- **Monitor API response times**

### Bundle Performance
- **Use dynamic imports** for large libraries
- **Optimize Three.js** bundle size
- **Implement code splitting** for routes
- **Monitor bundle size** regularly

---

## 📝 Code Style Guidelines

### TypeScript
```typescript
// ✅ Good - Explicit types
interface OrbitalData {
  position: Vector3;
  velocity: Vector3;
  timestamp: number;
}

// ❌ Bad - Using any
const data: any = await fetchData();

// ✅ Good - Proper error handling
try {
  const data = await fetchOrbitalData();
  if (!isValidOrbitalData(data)) {
    throw new Error('Invalid orbital data');
  }
  return data;
} catch (error) {
  console.error('Failed to fetch orbital data:', error);
  return getFallbackData();
}
```

### React Components
```typescript
// ✅ Good - Proper component structure
interface Props {
  data: OrbitalData;
  onUpdate: (data: OrbitalData) => void;
}

export function OrbitalTracker({ data, onUpdate }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Use useEffect for side effects
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        onUpdate(getNextFrame(data));
      }, 1000 / 60); // 60fps
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, data, onUpdate]);
  
  return (
    <div data-testid="orbital-tracker">
      {/* Component content */}
    </div>
  );
}
```

### Three.js Integration
```typescript
// ✅ Good - Proper Three.js usage
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export function CometMesh({ position, velocity }: CometProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Update position based on velocity
      meshRef.current.position.add(
        new THREE.Vector3(velocity.x, velocity.y, velocity.z)
          .multiplyScalar(delta)
      );
    }
  });
  
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.1, 32, 32]} />
      <meshBasicMaterial color={0x00ff88} />
    </mesh>
  );
}
```

---

## 🐛 Bug Reports

### Before Reporting
1. **Check existing issues** on GitHub
2. **Update to latest version** and test again
3. **Clear browser cache** and test again
4. **Check browser console** for errors

### Bug Report Template
```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 22]
- Node.js version: [e.g. 18.17.0]

## Additional Context
Any other context about the problem

## Console Output
```
Paste any console errors here
```

## Screenshots
If applicable, add screenshots to help explain your problem
```

---

## 💡 Feature Requests

### Before Requesting
1. **Check existing issues** and roadmap
2. **Consider the project scope** and mission
3. **Think about implementation** complexity
4. **Consider user impact** and value

### Feature Request Template
```markdown
## Feature Description
Brief description of the feature

## Problem Statement
What problem does this feature solve?

## Proposed Solution
How should this feature work?

## Alternatives Considered
What other solutions have you considered?

## Additional Context
Any other context, mockups, or examples

## Implementation Notes
Any thoughts on how this might be implemented
```

---

## 🔄 Pull Request Process

### Before Submitting
1. **Fork the repository** and create a feature branch
2. **Write tests** for new functionality
3. **Run tests** and ensure they pass
4. **Update documentation** as needed
5. **Follow code style** guidelines

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] E2E tests pass
- [ ] Performance tests pass

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Performance impact considered

## Screenshots
If applicable, add screenshots

## Additional Notes
Any additional information
```

### Review Process
1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** on multiple devices/browsers
4. **Performance validation** for 3D features
5. **Documentation review** for accuracy

---

## 🎯 Contribution Areas

### High Priority
- **3D Performance Optimization** - Improve frame rates and reduce memory usage
- **Error Handling** - Better error recovery and user feedback
- **Mobile Optimization** - Improve 3D performance on mobile devices
- **Accessibility** - Add ARIA labels and keyboard navigation
- **Testing** - Increase test coverage and reliability

### Medium Priority
- **New 3D Views** - Additional visualization modes
- **User Experience** - Improve interaction patterns
- **Documentation** - Better developer and user documentation
- **Performance Monitoring** - Enhanced telemetry and analytics
- **Offline Support** - Basic offline functionality

### Low Priority
- **Advanced Features** - Complex physics simulations
- **Social Features** - User accounts and sharing
- **Analytics** - User behavior tracking
- **Internationalization** - Multi-language support
- **Advanced Customization** - User preferences and themes

---

## 📞 Getting Help

### Communication Channels
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Email** - support@3iatlas.com for urgent issues

### Resources
- **Project Documentation** - Check `/docs` folder
- **NASA Horizons API** - [JPL Horizons System](https://ssd-api.jpl.nasa.gov/doc/horizons.html)
- **Three.js Documentation** - [Three.js Docs](https://threejs.org/docs/)
- **Next.js Documentation** - [Next.js Docs](https://nextjs.org/docs)

### Code of Conduct
- **Be respectful** and inclusive
- **Be constructive** in feedback
- **Be patient** with responses
- **Be collaborative** in approach

---

## 🙏 Recognition

Contributors will be recognized in:
- **README.md** contributors section
- **Release notes** for significant contributions
- **Project documentation** for major features
- **Social media** for notable contributions

---

*Last Updated: October 1, 2025*  
*Version: 0.1.0*  
*Status: Active Development*
