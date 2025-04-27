#!/bin/bash

# Script to automatically sync with GitHub repository
# Usage: 
#   ./sync.sh "Commit message"            - Normal sync operation
#   ./sync.sh --offline "Commit message"  - Commit only without push/pull
#   ./sync.sh --push-only                 - Push existing commits without new commits
#   ./sync.sh --status                    - Show status only

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Default mode and message
MODE="full"
COMMIT_MSG="Auto sync update"

# Parse arguments
if [ "$1" == "--offline" ]; then
    MODE="offline"
    if [ ! -z "$2" ]; then
        COMMIT_MSG="$2"
    fi
elif [ "$1" == "--push-only" ]; then
    MODE="push-only"
elif [ "$1" == "--status" ]; then
    MODE="status"
elif [ ! -z "$1" ]; then
    COMMIT_MSG="$1"
fi

# Function to check connection to GitHub
check_connection() {
    echo -e "${YELLOW}Checking connection to GitHub...${NC}"
    if ping -c 1 github.com >/dev/null 2>&1; then
        echo -e "${GREEN}Connection to GitHub is available.${NC}"
        return 0
    else
        echo -e "${RED}No connection to GitHub. Operating in offline mode.${NC}"
        return 1
    fi
}

# Show status function
show_status() {
    echo -e "${BLUE}Current branch: ${NC}$BRANCH"
    echo -e "${BLUE}Git status: ${NC}"
    git status -s
    
    # Check for unpushed commits
    local unpushed=$(git log @{u}.. --oneline 2>/dev/null | wc -l | tr -d ' ')
    if [ "$unpushed" -gt 0 ]; then
        echo -e "${YELLOW}You have $unpushed commit(s) waiting to be pushed.${NC}"
    fi
}

# Display mode information
case $MODE in
    "full")
        echo -e "${YELLOW}Starting full synchronization with GitHub...${NC}"
        ;;
    "offline")
        echo -e "${YELLOW}Running in offline mode (commit only, no push/pull)...${NC}"
        ;;
    "push-only")
        echo -e "${YELLOW}Running in push-only mode...${NC}"
        ;;
    "status")
        echo -e "${YELLOW}Showing repository status...${NC}"
        show_status
        exit 0
        ;;
esac

# Offline mode or full sync with connection check
if [ "$MODE" == "offline" ] || [ "$MODE" == "full" ] && ! check_connection; then
    MODE="offline"
fi

# Pull latest changes if in full mode
if [ "$MODE" == "full" ]; then
    echo -e "${YELLOW}Pulling latest changes from remote...${NC}"
    if ! git pull origin $BRANCH; then
        echo -e "${RED}Failed to pull latest changes.${NC}"
        echo -e "${YELLOW}Continuing in offline mode...${NC}"
        MODE="offline"
    fi
fi

# Stage all changes for offline and full modes
if [ "$MODE" == "offline" ] || [ "$MODE" == "full" ]; then
    echo -e "${YELLOW}Staging all changes...${NC}"
    git add .
    
    # Check if there are changes to commit
    if git diff-index --quiet HEAD --; then
        echo -e "${YELLOW}No changes to commit.${NC}"
    else
        # Commit changes
        echo -e "${YELLOW}Committing changes with message: ${NC}\"$COMMIT_MSG\""
        if ! git commit -m "$COMMIT_MSG"; then
            echo -e "${RED}Failed to commit changes.${NC}"
            exit 1
        fi
        echo -e "${GREEN}Changes committed successfully.${NC}"
    fi
fi

# Push changes if in full or push-only mode
if ([ "$MODE" == "full" ] || [ "$MODE" == "push-only" ]) && check_connection; then
    echo -e "${YELLOW}Pushing changes to remote...${NC}"
    if ! git push origin $BRANCH; then
        echo -e "${RED}Failed to push changes.${NC}"
        echo -e "${YELLOW}Your commits are saved locally and will be pushed later when connection is available.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Changes pushed successfully.${NC}"
elif [ "$MODE" == "offline" ]; then
    echo -e "${YELLOW}Working offline. Changes are committed locally but not pushed.${NC}"
    echo -e "${YELLOW}Run './sync.sh --push-only' later to push your changes.${NC}"
fi

echo -e "${GREEN}Operation completed successfully!${NC}"
show_status 