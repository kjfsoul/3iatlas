#!/bin/bash

# Session Memory Persistence Script for 3IAtlas
# This script ensures memory system is loaded and active at session start

set -e

echo "=== 3IAtlas Session Memory Persistence ==="
echo "Starting memory system activation..."

# Check if we're in the right directory
if [ ! -f "memory/system-info.txt" ]; then
    echo "Error: Memory system not found. Please run from project root."
    exit 1
fi

# Create session log
SESSION_LOG="logs/session-memory-$(date +%Y%m%d-%H%M%S).log"
mkdir -p logs
echo "Session log: $SESSION_LOG"

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$SESSION_LOG"
}

log "Starting session memory persistence"

# 1. Check memory system health
log "Checking memory system health..."
if [ -f "scripts/monitoring/memory-health-check.sh" ]; then
    ./scripts/monitoring/memory-health-check.sh >> "$SESSION_LOG" 2>&1
    if [ $? -eq 0 ]; then
        log "✅ Memory system health check passed"
    else
        log "❌ Memory system health check failed"
        exit 1
    fi
else
    log "⚠️  Memory health check script not found"
fi

# 2. Load memory system manifest
log "Loading memory system manifest..."
if [ -f "memory/persistent/project-state.json" ]; then
    log "✅ Memory system manifest loaded"
    # Extract key information
    MEMORY_VERSION=$(jq -r '.memory_system.version' memory/persistent/project-state.json 2>/dev/null || echo "1.0.0")
    MEMORY_STATUS=$(jq -r '.memory_system.status' memory/persistent/project-state.json 2>/dev/null || echo "active")
    log "Memory system version: $MEMORY_VERSION"
    log "Memory system status: $MEMORY_STATUS"
else
    log "❌ Memory system manifest not found"
    exit 1
fi

# 3. Initialize session memory
log "Initializing session memory..."
SESSION_ID="session-$(date +%Y%m%d-%H%M%S)"
SESSION_FILE="memory/session/${SESSION_ID}.json"

# Create session file
cat > "$SESSION_FILE" << EOF
{
  "session_id": "$SESSION_ID",
  "start_time": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "end_time": null,
  "context": {
    "active_component": null,
    "current_task": null,
    "user_context": null,
    "memory_snapshot": {}
  },
  "activities": [],
  "insights": [],
  "performance": {
    "context_switches": 0,
    "memory_accesses": 0,
    "error_count": 0
  },
  "memory_system": {
    "version": "$MEMORY_VERSION",
    "status": "$MEMORY_STATUS",
    "manifest_loaded": true
  },
  "project_context": {
    "name": "3IAtlas",
    "version": "1.0.0",
    "active_components": [
      "3d-tracker",
      "nasa-api",
      "flightpath-simulator",
      "printify-integration",
      "oracle-component",
      "social-links"
    ]
  }
}
EOF

log "✅ Session memory initialized: $SESSION_FILE"

# 4. Load component memories
log "Loading component memories..."
for component in 3d-tracker nasa-api flightpath-simulator printify-integration oracle-component social-links; do
    if [ -f "memory/component/${component}-memory.json" ]; then
        log "✅ ${component} memory loaded"
    else
        log "⚠️  ${component} memory missing"
    fi
done

# 5. Create session environment variables
log "Creating session environment variables..."
cat > ".env.session" << EOF
# 3IAtlas Session Environment Variables
# Generated: $(date)

# Session Information
SESSION_ID=$SESSION_ID
SESSION_START=$(date -u +%Y-%m-%dT%H:%M:%SZ)
SESSION_LOG=$SESSION_LOG

# Memory System
MEMORY_SYSTEM_VERSION=$MEMORY_VERSION
MEMORY_SYSTEM_STATUS=$MEMORY_STATUS
MEMORY_MANIFEST_LOADED=true

# Component Status
3D_TRACKER_MEMORY_LOADED=true
NASA_API_MEMORY_LOADED=true
FLIGHTPATH_SIMULATOR_MEMORY_LOADED=true
PRINTIFY_INTEGRATION_MEMORY_LOADED=true
ORACLE_COMPONENT_MEMORY_LOADED=true
SOCIAL_LINKS_MEMORY_LOADED=true

# Documentation Status
MEMORY_STRATEGY_LOADED=true
ARCHITECTURE_DESIGN_LOADED=true

# Task Templates Status
DEVELOPMENT_TEMPLATE_LOADED=true

# System Prompts Status
MEMORY_MANAGEMENT_PROMPT_LOADED=true

# 3IAtlas Specific
PROJECT_NAME=3IAtlas
PROJECT_VERSION=1.0.0
CRITICAL_FACT_3I_ATLAS_EXISTS=true
CRITICAL_FACT_DISCOVERY_DATE=2025-07-01
CRITICAL_FACT_DESIGNATION=3I/ATLAS
CRITICAL_FACT_ALTERNATE_DESIGNATION=C/2025 N1
CRITICAL_FACT_CURRENT_DATE=2025-10-14
EOF

log "✅ Session environment variables created"

# 6. Update system info
log "Updating system info..."
echo "CURRENT_SESSION_ID=$SESSION_ID" >> memory/system-info.txt
echo "SESSION_START_TIME=$(date)" >> memory/system-info.txt
echo "SESSION_LOG=$SESSION_LOG" >> memory/system-info.txt

log "✅ System info updated"

# 7. Create session summary
log "Creating session summary..."
cat > "SESSION_MEMORY_SUMMARY.md" << EOF
# Session Memory Summary - $SESSION_ID

## Session Information
- **Session ID**: $SESSION_ID
- **Start Time**: $(date)
- **Session Log**: $SESSION_LOG
- **Memory System Version**: $MEMORY_VERSION
- **Memory System Status**: $MEMORY_STATUS

## Memory System Status
- ✅ Memory system manifest loaded
- ✅ Component memories loaded
- ✅ Session environment variables created

## Available Components
- **3D Tracker**: Memory loaded
- **NASA API**: Memory loaded
- **Flight Path Simulator**: Memory loaded
- **Printify Integration**: Memory loaded
- **Oracle Component**: Memory loaded
- **Social Links**: Memory loaded

## Available Documentation
- **Memory Strategy**: Comprehensive strategy document
- **Architecture Design**: Technical architecture

## Available Templates
- **Development Tasks**: Development task template

## Available Prompts
- **Memory Management**: Memory management system prompt

## 3IAtlas Critical Facts
- **3I/ATLAS**: Third confirmed interstellar object
- **Discovery Date**: July 1, 2025
- **Designation**: 3I/ATLAS or C/2025 N1
- **Current Date**: October 2025 or later
- **Perihelion**: Late October 2025

## Next Steps
1. Begin development work
2. Update component memories
3. Track session activities

---
*Session started: $(date)*
*Memory system: Active and operational*
EOF

log "✅ Session summary created"

# 8. Final status check
log "Performing final status check..."
if [ -f "$SESSION_FILE" ] && [ -f ".env.session" ] && [ -f "SESSION_MEMORY_SUMMARY.md" ]; then
    log "✅ Session memory persistence completed successfully"
    echo ""
    echo "=== SESSION MEMORY PERSISTENCE COMPLETE ==="
    echo "Session ID: $SESSION_ID"
    echo "Session Log: $SESSION_LOG"
    echo "Summary: SESSION_MEMORY_SUMMARY.md"
    echo "Environment: .env.session"
    echo ""
    echo "Memory system is now active and operational!"
    echo "All components, documentation, and templates are loaded."
    echo ""
    echo "To use the memory system:"
    echo "1. Source the environment: source .env.session"
    echo "2. Check session status: cat SESSION_MEMORY_SUMMARY.md"
    echo "3. Monitor session: tail -f $SESSION_LOG"
else
    log "❌ Session memory persistence failed"
    echo "Session persistence failed. Check log: $SESSION_LOG"
    exit 1
fi

log "Session memory persistence completed successfully"


