# 3I/ATLAS Interactive Landing Page

**Real-time 3D visualization of the third confirmed interstellar object**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.180.0-green)](https://threejs.org/)

## 🌌 About 3I/ATLAS

**3I/ATLAS** (C/2025 N1) is the third confirmed interstellar object to visit our solar system, discovered on July 1, 2025, by the ATLAS telescope in Chile. This ancient cosmic wanderer is making its closest approach to the Sun in late October 2025, providing astronomers with an unprecedented opportunity to study material from another star system.

### Key Facts
- **Discovery Date:** July 1, 2025
- **Age:** 7+ billion years old (from Milky Way thick disk)
- **NASA Horizons ID:** SPK-ID 1004083
- **Current Status:** Perihelion approach (October 2025)
- **Trajectory:** Hyperbolic orbit, closest approach ~1.5 AU from Sun

## 🚀 Features

### Real-Time 3D Orbital Tracker
- **Live NASA Data:** Direct integration with JPL Horizons API
- **Interactive Visualization:** Five-view tracker system
- **Performance Optimized:** FrameGuard telemetry, intelligent caching
- **Educational:** Gamified learning with "The ATLAS Directive" narrative

### Multi-View Experience
1. **Historical Flight:** Animate July 1–Oct 8, 2025 path with trail
2. **Current Moment:** Static freeze-frame with object labels
3. **Speed Simulation:** POV from 3I/ATLAS with motion blur
4. **Perihelion Event:** Dramatic Oct 28–29 time-lapse
5. **Trajectory Plotter:** Interactive physics simulation

### Printify Integration
- Multi-shop product carousels
- Real-time pricing and descriptions
- Automatic image updates

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15.5.4 (App Router)
- **UI:** React 18.2.0 + TypeScript 5.6.3
- **Styling:** Tailwind CSS 3.4.13
- **Animation:** Framer Motion 11.2.10

### 3D Visualization
- **Engine:** Three.js 0.180.0
- **React Integration:** @react-three/fiber 8.18.0
- **Utilities:** @react-three/drei 9.122.0

### Data & APIs
- **Orbital Data:** NASA JPL Horizons API (public, no auth)
- **Products:** Printify API integration
- **Caching:** 7-day localStorage with fallback

## 📦 Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/3iatlas.git
   cd 3iatlas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set environment variables**
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

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3030
   ```

## 🏃‍♂️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server on port 3030
npm run build        # Build for production
npm run start        # Start production server
npm run typecheck    # TypeScript type checking

# Testing
npm run test:e2e     # Run Playwright E2E tests
npm run test:e2e:ui  # Run tests with UI

# Data Generation
npm run generate-data # Generate trajectory data
```

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

## 🚀 Deployment

### Vercel (Primary Deployment Target)

1. **Connect repository to Vercel**
2. **Set environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_3IATLAS_BASE`
   - `NEXT_PUBLIC_ARCANA_BASE`
   - `NEXT_PUBLIC_EDM_BASE`
   - `NEXT_PUBLIC_BDAY_BASE`
3. **Deploy automatically** on push to main
4. **Configure custom domain** if needed
5. **Enable preview deployments** for pull requests

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm run start
   ```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_3IATLAS_BASE` | 3I Atlas Printify store URL | Yes |
| `NEXT_PUBLIC_ARCANA_BASE` | Mystic Arcana store URL | Yes |
| `NEXT_PUBLIC_EDM_BASE` | EDM Shuffle store URL | Yes |
| `NEXT_PUBLIC_BDAY_BASE` | BirthdayGen store URL | Yes |

## 🧪 Testing

### E2E Testing with Playwright

```bash
# Run all tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run specific test
npx playwright test tests/3d-tracker.spec.ts
```

### Test Coverage

- **3D Tracker:** Interactive visualization testing
- **API Routes:** NASA Horizons integration
- **Performance:** FrameGuard telemetry validation
- **Responsive:** Mobile and desktop compatibility

## 📊 Performance

### Optimization Features

- **Code Splitting:** Dynamic imports for Three.js
- **Caching:** 7-day NASA data cache
- **FrameGuard:** Performance monitoring and degradation
- **Image Optimization:** Next.js automatic optimization
- **Bundle Analysis:** Webpack bundle optimization

### Performance Targets

- **All buttons functional** - No broken interactions
- **All planets/artifacts visible** - Complete solar system rendering
- **Correct rotation and motion** - Accurate orbital mechanics
- **Appropriate sizing** - Realistic scale relationships
- **Expected speed** - Proper time progression
- **No crashes** - Stable 3D visualization
- **3D Frame Rate:** 60fps target
- **Build Time:** < 30s

## 🔧 Configuration

### Next.js Configuration

Key settings in `next.config.mjs`:

```javascript
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["three", "@react-three/fiber"],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images-api.printify.com" },
      { protocol: "https", hostname: "images.printify.com" },
      { protocol: "https", hostname: "cdn.printify.com" },
    ],
  },
};
```

### Tailwind Configuration

Minimal configuration in `tailwind.config.ts`:

```typescript
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
```

## 🤝 Contributing

### Development Rules

1. **NO mock data** - Always use real NASA API calls
2. **NO TypeScript errors** - Maintain type safety
3. **NO "any" types** - Use proper TypeScript interfaces
4. **Performance first** - Optimize for 60fps target
5. **Real data only** - No hardcoded orbital data

### Code Style

- **TypeScript:** Strict mode enabled
- **ESLint:** Disabled for starter (configure as needed)
- **Prettier:** Not configured (add if needed)
- **Git Hooks:** Not configured (add if needed)

### Pull Request Process

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📚 Documentation

### Key Documents

- [`docs/3I_ATLAS_KNOWLEDGE_BASE.md`](docs/3I_ATLAS_KNOWLEDGE_BASE.md) - Scientific facts & SEO content
- [`docs/PROJECT_MEMORY.md`](docs/PROJECT_MEMORY.md) - Project status & architecture
- [`docs/ARCHITECTURE_VALIDATION.md`](docs/ARCHITECTURE_VALIDATION.md) - Technical implementation details
- [`docs/CONTENT_STRATEGY_DOMINANCE.md`](docs/CONTENT_STRATEGY_DOMINANCE.md) - SEO/GEO strategy

### API Documentation

- **NASA Horizons API:** [JPL Horizons System](https://ssd-api.jpl.nasa.gov/doc/horizons.html)
- **Printify API:** [Printify API Docs](https://developers.printify.com/)

## 🐛 Troubleshooting

### Common Issues

**Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**3D Performance Issues:**
- Check browser console for FrameGuard warnings
- Monitor `window.__AE_HEALTH__` telemetry
- Reduce particle density in Perihelion view

**API Errors:**
- Verify NASA Horizons API is accessible
- Check CORS proxy routes are working
- Validate SPK-ID 1004083 for 3I/ATLAS

### Debug Mode

Enable debug logging:
```bash
DEBUG=3iatlas:* npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NASA JPL:** For providing the Horizons API and orbital data
- **ATLAS Survey:** For discovering 3I/ATLAS on July 1, 2025
- **Three.js Community:** For the amazing 3D web library
- **Printify:** For the e-commerce platform integration

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/your-org/3iatlas/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/3iatlas/discussions)
- **Email:** support@3iatlas.com

---

**Last Updated:** October 1, 2025  
**Version:** 0.1.0  
**Status:** Active Development
