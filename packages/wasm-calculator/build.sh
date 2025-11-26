#!/bin/bash

# Build WASM module for smeta-calculator

set -e

echo "🦀 Building WASM Calculator..."

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo "Installing wasm-pack..."
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
fi

# Build for web target
echo "Building for web..."
wasm-pack build --target web --out-dir pkg

# Build for Node.js target (optional)
# wasm-pack build --target nodejs --out-dir pkg-node

echo "✅ WASM build complete!"
echo "Output: pkg/"
