#!/bin/bash
# Ensure we're using Node.js 22+ for Vite 7 compatibility
export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"
NODE_OPTIONS='--no-warnings' npx vitest run --coverage "$@"
