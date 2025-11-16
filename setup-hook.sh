#!/bin/bash
#
# Setup script for Git pre-commit hook
# This script installs the pre-commit hook that runs ESLint before each commit
#

set -e

echo "🔧 Setting up Git pre-commit hook..."

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
HOOK_DIR="$SCRIPT_DIR/.git/hooks"
HOOK_FILE="$HOOK_DIR/pre-commit"

# Check if .git directory exists
if [ ! -d "$SCRIPT_DIR/.git" ]; then
    echo "❌ Error: .git directory not found. Are you in a Git repository?"
    exit 1
fi

# Create hooks directory if it doesn't exist
if [ ! -d "$HOOK_DIR" ]; then
    echo "📁 Creating .git/hooks directory..."
    mkdir -p "$HOOK_DIR"
fi

# Create the pre-commit hook
cat > "$HOOK_FILE" << 'EOF'
#!/bin/sh
#
# Pre-commit hook to run ESLint before committing
# This ensures code quality and prevents build errors in production
#

echo "🔍 Running ESLint before commit..."

# Run ESLint
npm run lint

# Capture exit code
ESLINT_EXIT_CODE=$?

if [ $ESLINT_EXIT_CODE -ne 0 ]; then
  echo ""
  echo "❌ ESLint found errors. Please fix them before committing."
  echo "💡 Tip: Run 'npm run lint:fix' to automatically fix some issues."
  exit 1
fi

echo "✅ ESLint passed! Proceeding with commit..."
exit 0
EOF

# Make the hook executable
chmod +x "$HOOK_FILE"

echo "✅ Pre-commit hook installed successfully!"
echo ""
echo "📝 The hook will now run ESLint before each commit."
echo "💡 To bypass the hook (not recommended), use: git commit --no-verify"
echo ""

