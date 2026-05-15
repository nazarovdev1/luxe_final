#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLIENT_DIR="$ROOT_DIR/client"
SERVER_DIR="$ROOT_DIR/server"
SERVER_PUBLIC_DIR="$SERVER_DIR/public"
SERVER_TMP_DIR="$SERVER_DIR/tmp"

echo "==> Installing frontend dependencies"
cd "$CLIENT_DIR"
npm ci --legacy-peer-deps

echo "==> Building frontend"
CI=false npm run build

echo "==> Installing backend production dependencies"
cd "$SERVER_DIR"
npm ci --omit=dev

echo "==> Refreshing server/public from client/build"
rm -rf "$SERVER_PUBLIC_DIR"
mkdir -p "$SERVER_PUBLIC_DIR"
cp -R "$CLIENT_DIR/build/." "$SERVER_PUBLIC_DIR/"

echo "==> Restarting Plesk Node.js application"
mkdir -p "$SERVER_TMP_DIR"
touch "$SERVER_TMP_DIR/restart.txt"

echo "==> Plesk deploy finished"
