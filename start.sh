#!/bin/bash

# Pfad merken
BASE_DIR="$(dirname "$(realpath "$0")")"

echo "🚀 Starte Flask-Backend im Docker..."
docker compose up -d backend

echo "🧠 Warte kurz, bis Flask gestartet ist..."
sleep 2

echo "🪟 Starte Electron GUI lokal..."
cd "$BASE_DIR/frontend"
npm run start


