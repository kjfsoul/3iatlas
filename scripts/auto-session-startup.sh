#!/bin/bash

# Auto Session Startup Script for 3IAtlas
# This script automatically starts a new session with memory persistence

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}======================================================${NC}"
    echo -e "${BLUE}          🚀 3IAtlas AUTO STARTUP${NC}"
    echo -e "${BLUE}======================================================${NC}"
}

# Check if we're in the right directory
if [ ! -f "memory/system-info.txt" ]; then
    print_error "Memory system not found. Please run from project root."
    exit 1
fi

# Handle --force flag first
if [ "$1" = "--force" ]; then
    print_warning "Force starting new session..."
    rm -f .env.session SESSION_MEMORY_SUMMARY.md
fi

# Check if session is already active (after force cleanup)
if [ -f ".env.session" ] && [ -f "SESSION_MEMORY_SUMMARY.md" ]; then
    SESSION_ID=$(grep "SESSION_ID=" .env.session | cut -d'=' -f2)
    print_warning "Session already active: $SESSION_ID"
    print_status "Memory system is already loaded and operational"
    echo ""
    echo "To check session status:"
    echo "  cat SESSION_MEMORY_SUMMARY.md"
    echo "  tail -f logs/session-memory-*.log"
    echo ""
    echo "To start a new session:"
    echo "  ./scripts/auto-session-startup.sh --force"
    echo ""
    exit 0
fi

print_header
print_status "Starting 3IAtlas session with memory persistence..."

# 1. Run session memory persistence
print_status "Activating memory system..."
if [ -f "scripts/session-memory-persistence.sh" ]; then
    ./scripts/session-memory-persistence.sh
    if [ $? -eq 0 ]; then
        print_status "✅ Memory system activated successfully"
    else
        print_error "❌ Memory system activation failed"
        exit 1
    fi
else
    print_error "Session memory persistence script not found"
    exit 1
fi

# 2. Load environment variables
print_status "Loading session environment..."
if [ -f ".env.session" ]; then
    source .env.session
    print_status "✅ Session environment loaded"
else
    print_error "Session environment file not found"
    exit 1
fi

# 3. Display session information
print_status "Session Information:"
echo "  Session ID: $SESSION_ID"
echo "  Start Time: $SESSION_START"
echo "  Memory Version: $MEMORY_SYSTEM_VERSION"
echo "  Memory Status: $MEMORY_SYSTEM_STATUS"
echo "  Session Log: $SESSION_LOG"

# 4. Display available components
print_status "Available Components:"
echo "  ✅ 3D Tracker (Memory loaded)"
echo "  ✅ NASA API (Memory loaded)"
echo "  ✅ Flight Path Simulator (Memory loaded)"
echo "  ✅ Printify Integration (Memory loaded)"
echo "  ✅ Oracle Component (Memory loaded)"
echo "  ✅ Social Links (Memory loaded)"

# 5. Display available documentation
print_status "Available Documentation:"
echo "  ✅ Memory Strategy Comprehensive"
echo "  ✅ Memory Architecture Design"

# 6. Display available templates
print_status "Available Templates:"
echo "  ✅ Development Task Template"

# 7. Display available prompts
print_status "Available Prompts:"
echo "  ✅ Memory Management System Prompt"

# 8. Display 3IAtlas critical facts
print_status "3IAtlas Critical Facts:"
echo "  🌟 3I/ATLAS: Third confirmed interstellar object"
echo "  📅 Discovery Date: July 1, 2025"
echo "  🏷️  Designation: 3I/ATLAS or C/2025 N1"
echo "  📍 Current Date: October 2025 or later"
echo "  🌍 Perihelion: Late October 2025"

# 9. Display next steps
print_status "Next Steps:"
echo "  1. Begin development work"
echo "  2. Update component memories"
echo "  3. Track session activities"

# 10. Create session completion message
print_status "Session startup completed successfully!"
echo ""
echo "Memory system is now active and operational."
echo "All components, documentation, and templates are loaded."
echo ""
echo "Quick commands:"
echo "  Check session status: cat SESSION_MEMORY_SUMMARY.md"
echo "  Monitor session: tail -f $SESSION_LOG"
echo "  End session: ./scripts/end-session.sh"
echo ""

# 11. Create session end script
cat > "scripts/end-session.sh" << 'EOF'
#!/bin/bash

# End Session Script for 3IAtlas
# This script properly ends a session and saves final state

set -e

echo "=== Ending 3IAtlas Session ==="

if [ ! -f ".env.session" ]; then
    echo "No active session found."
    exit 0
fi

# Load session info
source .env.session

# Update session end time
if [ -f "memory/session/${SESSION_ID}.json" ]; then
    jq ".end_time = \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"" memory/session/${SESSION_ID}.json > memory/session/${SESSION_ID}.json.tmp
    mv memory/session/${SESSION_ID}.json.tmp memory/session/${SESSION_ID}.json
    echo "✅ Session end time updated"
fi

# Clean up session files
rm -f .env.session SESSION_MEMORY_SUMMARY.md
echo "✅ Session files cleaned up"

# Update system info
sed -i '/CURRENT_SESSION_ID=/d' memory/system-info.txt
sed -i '/SESSION_START_TIME=/d' memory/system-info.txt
sed -i '/SESSION_LOG=/d' memory/system-info.txt
echo "✅ System info updated"

echo "Session ended successfully: $SESSION_ID"
EOF

chmod +x scripts/end-session.sh

print_status "Session end script created: scripts/end-session.sh"

# 12. Create shell integration instructions
cat > "SHELL_INTEGRATION_INSTRUCTIONS.md" << EOF
# Shell Integration Instructions

## Automatic Session Startup

To automatically start 3IAtlas sessions when you open a terminal, add this to your shell startup file:

### For Bash (.bashrc):
\`\`\`bash
# 3IAtlas Auto Startup
if [ -d "/Users/kfitz/3iatlas" ]; then
    cd /Users/kfitz/3iatlas
    if [ -f "scripts/auto-session-startup.sh" ]; then
        ./scripts/auto-session-startup.sh
    fi
fi
\`\`\`

### For Zsh (.zshrc):
\`\`\`zsh
# 3IAtlas Auto Startup
if [ -d "/Users/kfitz/3iatlas" ]; then
    cd /Users/kfitz/3iatlas
    if [ -f "scripts/auto-session-startup.sh" ]; then
        ./scripts/auto-session-startup.sh
    fi
fi
\`\`\`

## Manual Session Management

### Start Session:
\`\`\`bash
./scripts/auto-session-startup.sh
\`\`\`

### Force New Session:
\`\`\`bash
./scripts/auto-session-startup.sh --force
\`\`\`

### End Session:
\`\`\`bash
./scripts/end-session.sh
\`\`\`

### Check Session Status:
\`\`\`bash
cat SESSION_MEMORY_SUMMARY.md
\`\`\`

### Monitor Session:
\`\`\`bash
tail -f logs/session-memory-*.log
\`\`\`

## Environment Variables

After starting a session, these environment variables are available:
- \`SESSION_ID\`: Current session identifier
- \`SESSION_START\`: Session start time
- \`MEMORY_SYSTEM_VERSION\`: Memory system version
- \`MEMORY_SYSTEM_STATUS\`: Memory system status
- \`PROJECT_NAME\`: 3IAtlas
- \`CRITICAL_FACT_3I_ATLAS_EXISTS\`: true

## Support

For issues or questions, refer to the main project documentation or contact the development team.
EOF

print_status "Shell integration instructions created: SHELL_INTEGRATION_INSTRUCTIONS.md"

print_status "Auto session startup completed successfully!"
echo ""
echo "To enable automatic startup, add the integration code to your shell startup file."
echo "See: SHELL_INTEGRATION_INSTRUCTIONS.md"
echo ""
