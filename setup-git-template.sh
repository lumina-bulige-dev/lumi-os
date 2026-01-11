#!/bin/bash
set -e  # Exit on error

# Setup script for configuring git commit message template
# Run this script to automatically configure your local git to use the commit message template

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_FILE="$SCRIPT_DIR/.gitmessage"

echo "Setting up git commit message template..."

if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "Error: Template file not found at $TEMPLATE_FILE"
    exit 1
fi

# Configure git to use the template for this repository
git config commit.template "$TEMPLATE_FILE"

if [ $? -eq 0 ]; then
    echo "✓ Git commit message template configured successfully!"
    echo "  Template file: $TEMPLATE_FILE"
    echo ""
    echo "When you run 'git commit', your editor will open with the template."
    echo "For more information, see CONTRIBUTING.md"
else
    echo "✗ Failed to configure git commit message template"
    exit 1
fi
