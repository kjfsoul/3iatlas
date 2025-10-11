# ATLAS Directive Integration Guide

This document explains how to integrate the ATLAS Directive game component into the 3IAtlas landing page.

## Overview

The ATLAS Directive is packaged as an npm module (`@kjfsoul/atlas-directive`) and published to GitHub Packages. The 3iatlas landing page consumes this package to display the interactive narrative game.

---

## Current Status

### ✅ Completed
- Modal overlay system implemented
- Game section with CTA button
- Animated scroll navigation
- Placeholder "Coming Soon" content
- Component architecture ready for package integration

### 🚧 Pending
- `@kjfsoul/atlas-directive` package build and publishing
- Package integration and testing
- Production deployment with live game

---

## Installation (When Package is Published)

### 1. Configure NPM for GitHub Packages

Create or update `.npmrc` in the project root:

```ini
@kjfsoul:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

For local development, replace `${GITHUB_TOKEN}` with your actual GitHub Personal Access Token that has `read:packages` permission.

For CI/CD, set `GITHUB_TOKEN` as an environment variable in your deployment pipeline (Vercel, GitHub Actions, etc.).

### 2. Install the Package

```bash
npm install @kjfsoul/atlas-directive@latest
```

Or with pnpm:

```bash
pnpm add @kjfsoul/atlas-directive@latest
```

### 3. Update Environment Variables

Add to `.env.local` (if the package requires any configuration):

```bash
# ATLAS Directive Configuration
NEXT_PUBLIC_ATLAS_DIRECTIVE_API_KEY=your_api_key_here
```

---

## Integration Steps

### Update the Modal Component

File: `/components/AtlasDirectiveModal.tsx`

Replace the placeholder content with the actual game component:

```typescript
'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
// Import the ATLAS Directive component
import { AtlasDirective } from '@kjfsoul/atlas-directive';

interface AtlasDirectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AtlasDirectiveModal({ isOpen, onClose }: AtlasDirectiveModalProps) {
  // ... existing modal code ...

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div /* ... backdrop code ... */ />

          {/* Modal Container */}
          <motion.div /* ... modal wrapper ... */>
            <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-b from-black/95 to-black/98">
              
              {/* Close Button */}
              <button onClick={onClose} /* ... close button ... */>
                {/* ... */}
              </button>

              {/* Game Component */}
              <div className="h-full w-full overflow-auto">
                <AtlasDirective
                  onExit={onClose}
                  // Pass any required props from the package
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
```

### Import Styles (If Required)

If the package includes CSS modules, import them in your app layout:

```typescript
// app/layout.tsx
import '@kjfsoul/atlas-directive/dist/styles.css';
```

---

## Local Development Setup

### Using npm link (Before Package is Published)

When developing both projects locally:

**In the ATLAS_DIRECTIVE repo:**

```bash
cd /Users/kfitz/Personal/ATLAS_DIRECTIVE

# Install dependencies and build
npm install
npm run build

# Create symlink
npm link
```

**In the 3iatlas repo:**

```bash
cd /Users/kfitz/3iatlas

# Link to local package
npm link @kjfsoul/atlas-directive

# Start dev server
npm run dev
```

**To unlink:**

```bash
npm unlink @kjfsoul/atlas-directive
npm install
```

---

## Package API Reference

### Component: `<AtlasDirective />`

The main game component exported by the package.

**Props:**

```typescript
interface AtlasDirectiveProps {
  /** Callback when user exits the game */
  onExit?: () => void;
  
  /** Initial game state (for save/load functionality) */
  initialState?: GameState;
  
  /** Configuration options */
  config?: {
    /** Enable sound effects */
    soundEnabled?: boolean;
    /** Enable music */
    musicEnabled?: boolean;
    /** Theme variant */
    theme?: 'dark' | 'light';
  };
}
```

**Example:**

```typescript
<AtlasDirective
  onExit={() => setIsModalOpen(false)}
  config={{
    soundEnabled: true,
    musicEnabled: true,
    theme: 'dark'
  }}
/>
```

---

## Troubleshooting

### Package Not Found

**Error:** `npm ERR! 404 Not Found - GET https://npm.pkg.github.com/@kjfsoul/atlas-directive`

**Solution:**
- Ensure the package is published to GitHub Packages
- Verify your `.npmrc` configuration
- Check that your GitHub token has `read:packages` permission
- Confirm the package name matches exactly: `@kjfsoul/atlas-directive`

### Authentication Failed

**Error:** `npm ERR! code E401` or `npm ERR! 401 Unauthorized`

**Solution:**
- Generate a new GitHub Personal Access Token with `read:packages` scope
- Update your `.npmrc` with the new token
- For CI/CD, ensure `GITHUB_TOKEN` secret is set in your deployment platform

### Type Errors

**Error:** `Cannot find module '@kjfsoul/atlas-directive' or its corresponding type declarations.`

**Solution:**
- Ensure the package includes TypeScript definitions (`dist/index.d.ts`)
- Check that `package.json` has `"types": "dist/index.d.ts"`
- Try deleting `node_modules` and reinstalling

### Build Errors

**Error:** Build fails with "Module not found" or bundling issues

**Solution:**
- Ensure all peer dependencies are installed
- Check `next.config.mjs` for any required webpack configurations
- Verify the package exports both ESM and CJS formats

---

## CI/CD Integration

### GitHub Actions Example

See `.github/workflows/deploy.yml` for the complete workflow.

Key points:
- Install dependencies with GitHub Packages access
- Set `GITHUB_TOKEN` environment variable
- Run build and tests
- Deploy to Vercel

### Vercel Configuration

**Environment Variables to Set:**

1. `GITHUB_TOKEN` - For accessing private GitHub Packages
2. `NEXT_PUBLIC_*` - Any public environment variables needed
3. Package-specific variables (if any)

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

---

## Architecture

### Component Structure

```
3iatlas/
├── components/
│   ├── AtlasDirectiveCTA.tsx          # Animated scroll trigger
│   ├── AtlasDirectiveSection.tsx      # Game section container
│   └── AtlasDirectiveModal.tsx        # Modal overlay with game
├── lib/
│   └── smooth-scroll.ts               # Smooth scroll utility
└── app/
    └── page.tsx                        # Main landing page
```

### Data Flow

```
User clicks CTA
  → Smooth scroll to game section (3.5s window-browsing)
  → User sees game section
  → Clicks "Enter The Directive"
  → Modal opens with <AtlasDirective />
  → User plays game
  → onExit callback closes modal
```

---

## Performance Considerations

### Code Splitting

The ATLAS Directive component should be lazy-loaded to reduce initial bundle size:

```typescript
import dynamic from 'next/dynamic';

const AtlasDirective = dynamic(
  () => import('@kjfsoul/atlas-directive').then(mod => mod.AtlasDirective),
  {
    loading: () => <LoadingSpinner />,
    ssr: false, // Disable SSR for game component
  }
);
```

### Bundle Size

Monitor the package size and ensure it doesn't exceed reasonable limits:

```bash
npm run build
# Check bundle analyzer output
```

---

## Testing

### Manual Testing Checklist

- [ ] CTA section renders and animates correctly
- [ ] Smooth scroll navigates to game section
- [ ] Brands section is visible during scroll (window-browsing effect)
- [ ] Game section button opens modal
- [ ] Modal displays game component
- [ ] ESC key closes modal
- [ ] Close button closes modal
- [ ] Click outside closes modal
- [ ] Body scroll is locked when modal is open
- [ ] Responsive on mobile/tablet/desktop
- [ ] No console errors
- [ ] TypeScript compiles without errors
- [ ] Build succeeds for production

### Automated Testing

```bash
# Run Playwright tests
npm run test:e2e

# Specific test for ATLAS Directive integration
npx playwright test --grep "atlas directive"
```

---

## Support & Resources

- **ATLAS_DIRECTIVE Repository:** https://github.com/kjfsoul/ATLAS_DIRECTIVE
- **3iatlas Repository:** https://github.com/kjfsoul/3iatlas
- **GitHub Packages Documentation:** https://docs.github.com/en/packages

---

## Version History

### v1.0.0 (Planned)
- Initial integration setup
- Modal overlay system
- Smooth scroll navigation
- Placeholder implementation

### v1.1.0 (Future)
- Live game integration
- Save/load functionality
- Analytics integration
- Performance optimizations

---

**Last Updated:** October 11, 2025

