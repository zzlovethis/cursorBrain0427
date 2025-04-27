#!/bin/bash

# Startup script to check for pending changes and push them to GitHub
# This script can be set up to run at system startup

# Path to your project directory - Update this to your actual path
PROJECT_DIR="/Users/zhang_zhe/Downloads/cursorBrain0416"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Maximum number of attempts
MAX_ATTEMPTS=3
ATTEMPT=1
DELAY=60  # Seconds to wait between attempts

echo -e "${YELLOW}[$(date)] Starting GitHub synchronization check...${NC}" >> "$PROJECT_DIR/sync_log.txt"

# Change to project directory
cd "$PROJECT_DIR" || {
    echo -e "${RED}[$(date)] Failed to change to project directory: $PROJECT_DIR${NC}" >> "$PROJECT_DIR/sync_log.txt"
    exit 1
}

# Function to check internet connection
check_connection() {
    if ping -c 1 github.com >/dev/null 2>&1; then
        echo -e "${GREEN}[$(date)] Connection to GitHub is available.${NC}" >> "$PROJECT_DIR/sync_log.txt"
        return 0
    else
        echo -e "${RED}[$(date)] No connection to GitHub.${NC}" >> "$PROJECT_DIR/sync_log.txt"
        return 1
    fi
}

# Function to check if there are unpushed commits
has_unpushed_commits() {
    local unpushed=$(git log @{u}.. --oneline 2>/dev/null | wc -l | tr -d ' ')
    if [ "$unpushed" -gt 0 ]; then
        echo -e "${YELLOW}[$(date)] Found $unpushed commit(s) waiting to be pushed.${NC}" >> "$PROJECT_DIR/sync_log.txt"
        return 0
    else
        echo -e "${GREEN}[$(date)] No unpushed commits found.${NC}" >> "$PROJECT_DIR/sync_log.txt"
        return 1
    fi
}

# Main sync function
attempt_sync() {
    # Try to push changes
    if git push origin "$(git rev-parse --abbrev-ref HEAD)" 2>> "$PROJECT_DIR/sync_log.txt"; then
        echo -e "${GREEN}[$(date)] Successfully pushed commits to GitHub.${NC}" >> "$PROJECT_DIR/sync_log.txt"
        return 0
    else
        echo -e "${RED}[$(date)] Failed to push commits (attempt $ATTEMPT/$MAX_ATTEMPTS)${NC}" >> "$PROJECT_DIR/sync_log.txt"
        return 1
    fi
}

# Wait for internet connection before attempting to push
while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if check_connection && has_unpushed_commits; then
        if attempt_sync; then
            exit 0
        fi
    else
        if ! has_unpushed_commits; then
            echo -e "${GREEN}[$(date)] No changes to sync.${NC}" >> "$PROJECT_DIR/sync_log.txt"
            exit 0
        fi
    fi
    
    # Increment attempt counter and wait before next attempt
    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -le $MAX_ATTEMPTS ]; then
        echo -e "${YELLOW}[$(date)] Waiting $DELAY seconds before next attempt...${NC}" >> "$PROJECT_DIR/sync_log.txt"
        sleep $DELAY
    fi
done

echo -e "${RED}[$(date)] Failed to sync after $MAX_ATTEMPTS attempts. Will try again next startup.${NC}" >> "$PROJECT_DIR/sync_log.txt"
exit 1 