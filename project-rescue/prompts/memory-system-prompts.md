# Memory System Implementation Prompts

## Overview
This document contains specialized prompts for implementing the memory system in the 3IAtlas project. These prompts are designed to guide AI agents through the implementation process.

## Phase 1: Foundation Setup Prompts

### Prompt 1.1: State Management Setup
```
You are implementing a Zustand state management system for the 3IAtlas project. 

REQUIREMENTS:
- Create a modular store structure with separate stores for different data types
- Implement TypeScript interfaces for type safety
- Add persistence middleware for data persistence
- Include error handling and validation

CONTEXT:
- Project uses Next.js with TypeScript
- Multiple 3D tracker components need shared state
- NASA API data needs to be cached and managed
- User preferences need to be persisted

TASKS:
1. Create the main store structure in `lib/stores/`
2. Implement orbital data store for 3I/ATLAS tracking
3. Create user preferences store
4. Add API cache store
5. Implement persistence middleware
6. Add TypeScript interfaces

CONSTRAINTS:
- No mock data or hardcoded values
- All data must come from real APIs
- No TypeScript errors allowed
- Follow existing project patterns

OUTPUT:
- Complete Zustand store implementation
- TypeScript interfaces
- Persistence middleware
- Integration examples
```

### Prompt 1.2: Persistent Storage Implementation
```
You are implementing IndexedDB persistent storage for the 3IAtlas project.

REQUIREMENTS:
- Create a robust IndexedDB wrapper
- Implement data serialization/deserialization
- Add backup and recovery mechanisms
- Include comprehensive error handling

CONTEXT:
- Need to store orbital data, user preferences, and API cache
- Data must persist across browser sessions
- Backup mechanisms needed for data recovery
- Error handling must be comprehensive

TASKS:
1. Create IndexedDB wrapper in `lib/storage/`
2. Implement data serialization utilities
3. Add backup and recovery systems
4. Create error handling mechanisms
5. Add data validation
6. Implement cleanup utilities

CONSTRAINTS:
- No data loss allowed
- Must handle browser storage limits
- Error recovery must be graceful
- Performance must be optimized

OUTPUT:
- Complete IndexedDB implementation
- Serialization utilities
- Backup/recovery systems
- Error handling mechanisms
```

## Phase 2: Core Features Prompts

### Prompt 2.1: API Caching System
```
You are implementing a comprehensive API caching system for the 3IAtlas project.

REQUIREMENTS:
- Cache NASA Horizons API responses
- Implement cache invalidation strategies
- Add offline data fallback
- Create cache management utilities

CONTEXT:
- NASA API provides orbital data for 3I/ATLAS
- Printify API provides product data
- Cache must be efficient and reliable
- Offline functionality required

TASKS:
1. Create API cache manager in `lib/api/`
2. Implement NASA API caching
3. Add Printify API caching
4. Create cache invalidation logic
5. Implement offline data fallback
6. Add cache management utilities

CONSTRAINTS:
- No hardcoded API responses
- Real API integration required
- Cache must be efficient
- Offline fallback must work

OUTPUT:
- Complete API caching system
- Cache management utilities
- Offline fallback mechanisms
- Integration examples
```

### Prompt 2.2: User Preferences System
```
You are implementing a user preferences system for the 3IAtlas project.

REQUIREMENTS:
- Store user theme preferences
- Save camera settings for 3D tracker
- Persist display options
- Manage notification settings

CONTEXT:
- Users need personalized experience
- 3D tracker camera positions need persistence
- Theme preferences must be saved
- Display options need to be remembered

TASKS:
1. Create user preferences manager in `lib/preferences/`
2. Implement theme preference storage
3. Add camera settings persistence
4. Create display options management
5. Add notification settings
6. Implement preference validation

CONSTRAINTS:
- No default hardcoded preferences
- User choices must be respected
- Data must be validated
- Performance must be optimized

OUTPUT:
- Complete preferences system
- Validation mechanisms
- Integration examples
- User interface components
```

## Phase 3: Integration Prompts

### Prompt 3.1: 3D Tracker Memory Integration
```
You are integrating the memory system with 3D tracker components in the 3IAtlas project.

REQUIREMENTS:
- Store orbital element calculations
- Cache Three.js scene data
- Persist user camera positions
- Implement scene state management

CONTEXT:
- Multiple 3D tracker components exist
- Three.js scene data needs caching
- User camera positions need persistence
- Scene state must be managed

TASKS:
1. Integrate memory system with existing 3D trackers
2. Implement scene data caching
3. Add camera position persistence
4. Create scene state management
5. Implement data synchronization
6. Add error handling

CONSTRAINTS:
- No changes to existing 3D tracker logic
- Memory integration must be seamless
- Performance must not degrade
- Error handling must be comprehensive

OUTPUT:
- Integrated 3D tracker components
- Scene management system
- Camera persistence
- Synchronization mechanisms
```

### Prompt 3.2: Cross-Component Communication
```
You are implementing cross-component communication for the 3IAtlas project.

REQUIREMENTS:
- Create event bus system
- Implement data synchronization
- Add state propagation
- Create component coordination

CONTEXT:
- Multiple components need to communicate
- Data must be synchronized across components
- State changes must be propagated
- Component coordination is required

TASKS:
1. Create event bus system in `lib/events/`
2. Implement data synchronization
3. Add state propagation mechanisms
4. Create component coordination
5. Add event handling
6. Implement error handling

CONSTRAINTS:
- No direct component coupling
- Event system must be efficient
- Data synchronization must be reliable
- Error handling must be comprehensive

OUTPUT:
- Complete event bus system
- Data synchronization mechanisms
- Component coordination
- Error handling systems
```

## Phase 4: Optimization Prompts

### Prompt 4.1: Performance Optimization
```
You are optimizing the memory system performance for the 3IAtlas project.

REQUIREMENTS:
- Implement lazy loading
- Optimize cache performance
- Add memory usage monitoring
- Implement performance tuning

CONTEXT:
- Memory system must be performant
- Lazy loading needed for large datasets
- Cache performance must be optimized
- Memory usage must be monitored

TASKS:
1. Implement lazy loading in `lib/performance/`
2. Optimize cache performance
3. Add memory usage monitoring
4. Implement performance tuning
5. Create performance metrics
6. Add optimization utilities

CONSTRAINTS:
- Performance must be improved
- Memory usage must be optimized
- No functionality loss allowed
- Monitoring must be comprehensive

OUTPUT:
- Optimized performance system
- Memory monitoring
- Performance metrics
- Optimization utilities
```

### Prompt 4.2: Security Implementation
```
You are implementing security measures for the memory system in the 3IAtlas project.

REQUIREMENTS:
- Encrypt sensitive data
- Implement access controls
- Add audit logging
- Create security monitoring

CONTEXT:
- Sensitive data must be protected
- Access controls needed for data security
- Audit logging required for compliance
- Security monitoring essential

TASKS:
1. Implement encryption in `lib/security/`
2. Add access control mechanisms
3. Create audit logging system
4. Implement security monitoring
5. Add data validation
6. Create security utilities

CONSTRAINTS:
- Security must be comprehensive
- No security vulnerabilities allowed
- Performance impact must be minimal
- Compliance requirements must be met

OUTPUT:
- Complete security system
- Encryption mechanisms
- Access controls
- Audit logging
- Security monitoring
```

## Testing Prompts

### Prompt T.1: Unit Testing
```
You are creating unit tests for the memory system in the 3IAtlas project.

REQUIREMENTS:
- Test all store modules
- Test storage utilities
- Test API caching
- Test error handling

CONTEXT:
- Comprehensive test coverage needed
- All memory system components must be tested
- Error scenarios must be covered
- Performance tests required

TASKS:
1. Create unit tests for stores
2. Test storage utilities
3. Test API caching system
4. Test error handling
5. Add performance tests
6. Create test utilities

CONSTRAINTS:
- Test coverage must be > 90%
- All edge cases must be covered
- Performance tests must be included
- Tests must be maintainable

OUTPUT:
- Complete test suite
- Test utilities
- Performance tests
- Test documentation
```

### Prompt T.2: Integration Testing
```
You are creating integration tests for the memory system in the 3IAtlas project.

REQUIREMENTS:
- Test component integration
- Test cross-component communication
- Test session management
- Test performance optimization

CONTEXT:
- Integration between components must be tested
- Cross-component communication must be verified
- Session management must be tested
- Performance optimization must be validated

TASKS:
1. Create integration tests
2. Test component communication
3. Test session management
4. Test performance optimization
5. Add end-to-end tests
6. Create test scenarios

CONSTRAINTS:
- Integration must be thoroughly tested
- All communication paths must be covered
- Performance must be validated
- Tests must be reliable

OUTPUT:
- Complete integration test suite
- Test scenarios
- Performance validation
- Test documentation
```

## Validation Prompts

### Prompt V.1: System Validation
```
You are validating the complete memory system implementation for the 3IAtlas project.

REQUIREMENTS:
- Validate all components work together
- Check performance meets requirements
- Verify security measures are effective
- Confirm user experience is optimal

CONTEXT:
- Complete system validation needed
- Performance requirements must be met
- Security must be verified
- User experience must be optimal

TASKS:
1. Run comprehensive system tests
2. Validate performance metrics
3. Verify security measures
4. Test user experience
5. Check error handling
6. Validate data integrity

CONSTRAINTS:
- All requirements must be met
- Performance must be optimal
- Security must be verified
- User experience must be excellent

OUTPUT:
- Validation report
- Performance metrics
- Security assessment
- User experience evaluation
```

## Usage Guidelines

### When to Use These Prompts
- **Phase 1**: Use foundation setup prompts when starting implementation
- **Phase 2**: Use core features prompts for main functionality
- **Phase 3**: Use integration prompts for component integration
- **Phase 4**: Use optimization prompts for performance and security
- **Testing**: Use testing prompts for quality assurance
- **Validation**: Use validation prompts for final verification

### Best Practices
1. **Follow the prompts exactly** - They contain specific requirements
2. **Validate all constraints** - Ensure no violations occur
3. **Test thoroughly** - Use the testing prompts
4. **Document everything** - Keep implementation records
5. **Monitor performance** - Use performance prompts
6. **Ensure security** - Use security prompts

### Common Pitfalls to Avoid
- **Don't skip validation** - Always validate implementation
- **Don't ignore constraints** - Follow all constraints strictly
- **Don't skip testing** - Comprehensive testing is essential
- **Don't forget security** - Security must be implemented
- **Don't ignore performance** - Performance optimization is critical
- **Don't skip documentation** - Documentation is essential
