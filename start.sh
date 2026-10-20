#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "================================================================="
echo "  SKYREADY | Predictive Maintenance & Fleet Availability Optimizer"
echo "  Ministry of Defence (MoD) / DSSC • SIH Problem Statement ID 26249"
echo "  Team ZEN (SIH-S-B1-060) • 'One Loop: Sensor -> Schedule -> Spares'"
echo "================================================================="

# Check virtual environment
if [ ! -d ".venv" ]; then
    echo "[!] Virtual environment not found. Setting up..."
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r backend/requirements.txt
else
    source .venv/bin/activate
fi

export PYTHONPATH="$DIR/backend"

echo "[+] Starting SkyReady Full-Stack Server on http://localhost:8000 ..."
echo "[+] API Docs available at http://localhost:8000/docs"
echo "[+] Frontend Dashboard active at http://localhost:8000"
echo "================================================================="

exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --app-dir backend
