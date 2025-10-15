# 3I/ATLAS Agent Playbook

*Comprehensive guide for AI agents working on the 3IAtlas project*

---

## 🎯 Project Overview

**Mission:** Transform basic NASA data into an unforgettable, interactive 3D experience that makes users want to share the 3I/ATLAS interstellar comet with friends.

**Current Status:** Phase 1 complete, Phase 2 in progress - Critical crashes need immediate attention TODAY

**Tech Stack:** Next.js 15.5.4, React 18.2.0, TypeScript 5.6.3, Three.js 0.180.0, NASA JPL Horizons API

---

## 👥 Agent Roles & Responsibilities

### 🏗️ Architect Agent

**Primary Role:** System design, architecture decisions, technical strategy

#### Responsibilities

- **System Architecture:** Design scalable, maintainable solutions
- **Technical Decisions:** Make architectural choices and trade-offs
- **Code Review:** Ensure code quality and architectural compliance
- **Performance Strategy:** Optimize for 60fps target and scalability
- **Integration Planning:** Coordinate between different system components

#### Key Skills Required

- **3D Graphics:** Three.js, WebGL, performance optimization
- **React Architecture:** Component design, state management, hooks
- **TypeScript:** Advanced types, interfaces, generics
- **Performance:** FrameGuard, telemetry, optimization techniques
- **API Design:** RESTful APIs, data validation, error handling

#### Typical Tasks

- Design unified state management system
- Plan performance optimization strategies
- Review and approve architectural changes
- Design error handling and recovery mechanisms
- Plan scalability and maintainability improvements

#### Handoff Rules

- **To Implementer:** Provide detailed technical specifications
- **To QA:** Provide testing requirements and success criteria
- **Documentation:** Update architecture documentation
- **Code Review:** Approve implementation before merge

---

### 🔧 Implementer Agent

**Primary Role:** Code implementation, bug fixes, feature development

#### Responsibilities

- **Code Implementation:** Write clean, efficient, maintainable code
- **Bug Fixes:** Resolve crashes, performance issues, and errors
- **Feature Development:** Implement new features and enhancements
- **Testing:** Write and maintain tests
- **Documentation:** Update code documentation and comments

#### Key Skills Required

- **React Development:** Components, hooks, state management
- **Three.js:** 3D rendering, animation, performance
- **TypeScript:** Type safety, interfaces, error handling
- **API Integration:** NASA Horizons API, data fetching
- **Performance:** FrameGuard, optimization, debugging

#### Typical Tasks

- Fix Speed Simulation View crashes
- Implement unified playback state management
- Optimize 3D rendering performance
- Add data validation and error handling
- Implement new 3D visualization features

#### Handoff Rules

- **To Architect:** Request architectural guidance for complex decisions
- **To QA:** Provide testing instructions and expected behavior
- **Code Quality:** Ensure all code passes linting and type checking
- **Performance:** Verify 60fps target is maintained

---

### 🧪 QA Agent

**Primary Role:** Testing, quality assurance, user experience validation

#### Responsibilities

- **Testing Strategy:** Design comprehensive testing approaches
- **Quality Assurance:** Ensure code quality and reliability
- **User Experience:** Validate user workflows and interactions
- **Performance Testing:** Monitor and validate performance metrics
- **Bug Reporting:** Identify and document issues

#### Key Skills Required

- **Testing Frameworks:** Playwright, Jest, testing utilities
- **Performance Testing:** FrameGuard telemetry, profiling
- **User Experience:** Usability testing, accessibility
- **Debugging:** Browser DevTools, error analysis
- **Documentation:** Test cases, bug reports, quality metrics

#### Typical Tasks

- Test 3D visualization functionality
- Validate performance metrics and targets
- Test user workflows and interactions
- Identify and report bugs and issues
- Validate accessibility and usability

#### Handoff Rules

- **To Architect:** Report architectural issues and performance problems
- **To Implementer:** Provide detailed bug reports and test results
- **Quality Gates:** Approve releases based on quality criteria
- **Documentation:** Update testing documentation and procedures

---

## 🔄 Handoff Protocols

### Architect → Implementer

**Trigger:** Complex implementation requiring architectural guidance

**Required Information:**

- **Technical Specification:** Detailed implementation requirements
- **Architecture Diagram:** System design and component relationships
- **Performance Requirements:** Specific performance targets and constraints
- **Integration Points:** How components interact with existing system
- **Error Handling:** Expected error scenarios and recovery mechanisms

**Deliverables:**

- Technical specification document
- Architecture diagrams and flowcharts
- Performance requirements and constraints
- Integration guidelines and best practices
- Code review checklist

**Success Criteria:**

- Implementer understands technical requirements
- Architecture is clearly documented
- Performance targets are specified
- Integration points are identified
- Error handling is planned

---

### Implementer → QA

**Trigger:** Code implementation ready for testing

**Required Information:**

- **Implementation Details:** What was implemented and how
- **Testing Instructions:** How to test the implementation
- **Expected Behavior:** What should happen during testing
- **Performance Impact:** Expected performance changes
- **Known Issues:** Any known limitations or issues

**Deliverables:**

- Implementation summary
- Testing instructions and test cases
- Expected behavior documentation
- Performance impact analysis
- Known issues and limitations

**Success Criteria:**

- QA can test the implementation effectively
- Expected behavior is clearly documented
- Performance impact is understood
- Known issues are documented
- Testing approach is comprehensive

---

### QA → Architect/Implementer

**Trigger:** Issues found during testing or quality validation

**Required Information:**

- **Issue Description:** Detailed description of the problem
- **Reproduction Steps:** How to reproduce the issue
- **Expected vs Actual:** What should happen vs what actually happens
- **Environment Details:** Browser, device, and system information
- **Impact Assessment:** Severity and impact of the issue

**Deliverables:**

- Bug report with detailed information
- Reproduction steps and environment details
- Impact assessment and severity rating
- Suggested fixes or workarounds
- Testing results and quality metrics

**Success Criteria:**

- Issue is clearly documented and reproducible
- Impact and severity are assessed
- Environment details are provided
- Suggested fixes are included
- Quality metrics are reported

---

## 📋 Task Management Workflow

### Task Assignment

1. **Architect** reviews task requirements and creates technical specification
2. **Implementer** receives specification and implements solution
3. **QA** tests implementation and validates quality
4. **Architect** reviews final implementation and approves merge

### Quality Gates

- **Code Quality:** All code passes linting and type checking
- **Performance:** 60fps target maintained, no performance regressions
- **Testing:** All tests pass, including E2E and performance tests
- **Documentation:** Code is properly documented and commented
- **Architecture:** Implementation follows architectural guidelines

### Escalation Process

1. **Implementer** encounters architectural decision → Escalate to **Architect**
2. **QA** finds critical bug → Escalate to **Implementer** and **Architect**
3. **Architect** identifies performance issue → Escalate to **Implementer**
4. **Any agent** finds security issue → Escalate to **Architect** immediately

---

## 🚨 Critical Rules (NEVER VIOLATE)

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

## 🛠️ Development Environment Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Modern browser with WebGL support

### Setup Commands

```bash
# Clone and setup
git clone https://github.com/your-org/3iatlas.git
cd 3iatlas
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3030
```

### Key Environment Variables

```env
NEXT_PUBLIC_3IATLAS_BASE=https://your-printify-store.com
NEXT_PUBLIC_ARCANA_BASE=https://your-arcana-store.com
NEXT_PUBLIC_EDM_BASE=https://your-edm-store.com
NEXT_PUBLIC_BDAY_BASE=https://your-bday-store.com
```

---

## 📊 Performance Monitoring

### FrameGuard Telemetry

```typescript
// Monitor performance metrics
const health = window.__AE_HEALTH__;
console.log('FPS:', health.fps);
console.log('NaN Frames:', health.nanFrames);
console.log('Clipped Frames:', health.clippedFrames);
```

### Performance Targets

- **All buttons functional** - No broken interactions
- **All planets/artifacts visible** - Complete solar system rendering
- **Correct rotation and motion** - Accurate orbital mechanics
- **Appropriate sizing** - Realistic scale relationships
- **Expected speed** - Proper time progression
- **No crashes** - Stable 3D visualization
- **3D Frame Rate:** 60fps target
- **Build Time:** < 30s

### Monitoring Tools

- Browser DevTools Performance tab
- FrameGuard telemetry system
- Network tab for API calls
- Memory tab for memory usage
- Console for errors and warnings

---

## 🧪 Testing Strategy

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

### Quality Assurance Checklist

- [ ] All tests pass
- [ ] No console errors
- [ ] Performance targets met
- [ ] Accessibility requirements met
- [ ] Code quality standards met
- [ ] Documentation updated
- [ ] Security considerations addressed

---

## 📚 Key Documentation

### Project Documentation

- [`README.md`](../README.md) - Project overview and setup
- [`docs/FACTS.mdx`](../docs/FACTS.mdx) - Technical and scientific facts
- [`docs/CONTRIBUTING.md`](../docs/CONTRIBUTING.md) - Contribution guidelines
- [`docs/PROJECT_MEMORY.md`](../docs/PROJECT_MEMORY.md) - Project status and architecture
- [`docs/ARCHITECTURE_VALIDATION.md`](../docs/ARCHITECTURE_VALIDATION.md) - Technical implementation details

### Task Management

- [`tasks/3iatlas/backlog.json`](../tasks/3iatlas/backlog.json) - Prioritized task backlog
- [`TOP3_P0.md`](../TOP3_P0.md) - Top 3 critical tasks
- [`IMPLEMENTER_PROMPT.md`](../IMPLEMENTER_PROMPT.md) - Implementation guide for P0-001

### External Resources

- **NASA Horizons API:** [JPL Horizons System](https://ssd-api.jpl.nasa.gov/doc/horizons.html)
- **Three.js Documentation:** [Three.js Docs](https://threejs.org/docs/)
- **Next.js Documentation:** [Next.js Docs](https://nextjs.org/docs)
- **React Documentation:** [React Docs](https://reactjs.org/docs/)

---

## 🎯 Success Metrics

### Technical Success

- [ ] Zero crashes in any view
- [ ] Consistent 60fps performance
- [ ] No console errors
- [ ] All interactive features work
- [ ] State management is unified and consistent

### User Experience Success

- [ ] Users can navigate all views smoothly
- [ ] Interactive features respond immediately
- [ ] Visual quality is maintained
- [ ] Performance is smooth on target devices
- [ ] Error states are handled gracefully

### Business Success

- [ ] Core value proposition is delivered
- [ ] Users can complete primary workflows
- [ ] Application is ready for user testing
- [ ] Foundation is solid for future development
- [ ] Technical debt is reduced

---

## 🚀 Deployment & Release Process

### Development Workflow

1. **Feature Branch** - Create branch from main
2. **Development** - Implement feature with tests
3. **Code Review** - Architect reviews implementation
4. **QA Testing** - QA validates quality and functionality
5. **Merge** - Merge to main after approval
6. **Deploy** - Deploy to staging/production

### Release Criteria

- [ ] All P0 tasks completed
- [ ] All tests pass
- [ ] Performance targets met
- [ ] No critical bugs
- [ ] Documentation updated
- [ ] Security review completed

### Rollback Plan

- **Feature Flags** - Disable problematic features
- **Database Migrations** - Rollback database changes
- **Code Rollback** - Revert to previous stable version
- **Monitoring** - Monitor for issues after deployment

---

## 📞 Support & Escalation

### Communication Channels

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Email** - <support@3iatlas.com> for urgent issues

### Escalation Matrix

- **Technical Issues** → Architect Agent
- **Implementation Issues** → Implementer Agent
- **Quality Issues** → QA Agent
- **Security Issues** → Architect Agent (immediate)
- **Performance Issues** → Architect Agent + Implementer Agent

### Getting Help

- Check existing issues on GitHub
- Review project documentation in `/docs`
- Test on multiple devices/browsers
- Monitor performance metrics
- Use debugging tools and telemetry

---

## 🔄 Continuous Improvement

### Regular Reviews

- **Weekly:** Review progress and priorities
- **Sprint End:** Review completed work and lessons learned
- **Monthly:** Review architecture and technical debt
- **Quarterly:** Review overall project direction and strategy

### Process Improvements

- **Retrospectives:** Identify what went well and what to improve
- **Tool Updates:** Update development tools and processes
- **Documentation:** Keep documentation current and accurate
- **Training:** Ensure team members have necessary skills

### Quality Improvements

- **Code Quality:** Regular code reviews and refactoring
- **Performance:** Continuous performance monitoring and optimization
- **Testing:** Improve test coverage and quality
- **User Experience:** Regular user feedback and usability testing

---

*Last Updated: October 1, 2025*  
*Version: 0.1.0*  
*Status: Active Development*  
*Next Review: October 8, 2025*
