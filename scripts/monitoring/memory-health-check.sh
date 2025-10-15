#!/bin/bash

# Memory System Health Check Script for 3IAtlas

echo "=== 3IAtlas Memory System Health Check ==="
echo "Timestamp: $(date)"

# Check directory structure
echo "Checking directory structure..."
if [ -d "memory" ] && [ -d "analysis" ] && [ -d "context" ] && [ -d "tasks" ]; then
    echo "✓ Directory structure intact"
else
    echo "✗ Directory structure missing"
    exit 1
fi

# Check system info
echo "Checking system info..."
if [ -f "memory/system-info.txt" ]; then
    echo "✓ System info file exists"
    cat memory/system-info.txt
else
    echo "✗ System info file missing"
    exit 1
fi

# Check component memory files
echo "Checking component memory files..."
for component in 3d-tracker nasa-api flightpath-simulator printify-integration oracle-component social-links; do
    if [ -f "memory/component/${component}-memory.json" ]; then
        echo "✓ ${component} memory file exists"
    else
        echo "✗ ${component} memory file missing"
    fi
done

# Check documentation files
echo "Checking documentation files..."
for doc in memory-strategy-comprehensive.md memory-architecture-design.md; do
    if [ -f "analysis/${doc}" ]; then
        echo "✓ ${doc} exists"
    else
        echo "✗ ${doc} missing"
    fi
done

# Check task templates
echo "Checking task templates..."
if [ -f "tasks/templates/development-task.json" ]; then
    echo "✓ Development task template exists"
else
    echo "✗ Development task template missing"
fi

# Check system prompts
echo "Checking system prompts..."
if [ -f "prompts/system/memory-management.md" ]; then
    echo "✓ Memory management prompt exists"
else
    echo "✗ Memory management prompt missing"
fi

# Check scripts
echo "Checking scripts..."
REQUIRED_SCRIPTS=(
    "scripts/init/memory-system-init.sh"
    "scripts/session-memory-persistence.sh"
    "scripts/auto-session-startup.sh"
    "scripts/end-session.sh"
)

for script in "${REQUIRED_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            echo "✓ $script exists and executable"
        else
            echo "⚠ $script exists but not executable"
        fi
    else
        echo "✗ $script missing"
    fi
done

# Check session status
echo "Checking session status..."
if [ -f ".env.session" ]; then
    echo "✓ Active session found"
    source .env.session
    echo "  Session ID: $SESSION_ID"
    echo "  Session Start: $SESSION_START"
    echo "  Memory Version: $MEMORY_SYSTEM_VERSION"
    echo "  Memory Status: $MEMORY_SYSTEM_STATUS"
else
    echo "⚠ No active session found"
fi

# Check logs
echo "Checking logs..."
if [ -d "logs" ]; then
    LOG_COUNT=$(find logs -name "*.log" | wc -l)
    echo "✓ Logs directory exists with $LOG_COUNT log files"
else
    echo "⚠ Logs directory missing"
fi

# Check 3IAtlas specific files
echo "Checking 3IAtlas specific files..."
if [ -f "memory/persistent/project-state.json" ]; then
    echo "✓ Project state file exists"
    PROJECT_NAME=$(jq -r '.project_name' memory/persistent/project-state.json 2>/dev/null || echo "unknown")
    echo "  Project Name: $PROJECT_NAME"
else
    echo "✗ Project state file missing"
fi

# Check critical facts
echo "Checking critical facts..."
if [ -f ".env.session" ]; then
    source .env.session
    if [ "$CRITICAL_FACT_3I_ATLAS_EXISTS" = "true" ]; then
        echo "✓ 3I/ATLAS critical fact loaded"
        echo "  Designation: $CRITICAL_FACT_DESIGNATION"
        echo "  Discovery Date: $CRITICAL_FACT_DISCOVERY_DATE"
        echo "  Current Date: $CRITICAL_FACT_CURRENT_DATE"
    else
        echo "✗ 3I/ATLAS critical fact missing"
    fi
else
    echo "⚠ No session environment to check critical facts"
fi

echo "=== Health Check Complete ==="
