#!/bin/bash

# ReNova Backend Startup Script
# This script sets up and runs the ReNova FastAPI server

set -e  # Exit on error

echo "================================================"
echo "🚀 ReNova Backend Startup"
echo "================================================"

# Check if Python 3.9+ is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.9 or higher."
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d ' ' -f 2 | cut -d '.' -f 1,2)
echo "✅ Found Python $PYTHON_VERSION"

# Check if MongoDB is running
echo ""
echo "🔍 Checking MongoDB..."
if ! pgrep -x mongod > /dev/null; then
    echo "⚠️  MongoDB not running. Attempting to start..."
    
    # Try to start MongoDB (macOS with Homebrew)
    if command -v brew &> /dev/null; then
        brew services start mongodb-community 2>/dev/null || echo "⚠️  Could not auto-start MongoDB"
    fi
    
    sleep 2
    
    if ! pgrep -x mongod > /dev/null; then
        echo "❌ MongoDB is not running. Please start MongoDB manually:"
        echo "   macOS: brew services start mongodb-community"
        echo "   Linux: sudo systemctl start mongod"
        exit 1
    fi
fi
echo "✅ MongoDB is running"

# Navigate to backend directory
cd "$(dirname "$0")/.."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo ""
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
echo ""
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/upgrade dependencies
echo ""
echo "📥 Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo "✅ Dependencies installed"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  .env file not found!"
    
    if [ -f ".env.example" ]; then
        echo "📝 Copying .env.example to .env..."
        cp .env.example .env
        echo ""
        echo "⚠️  IMPORTANT: Please edit .env and add your API keys:"
        echo "   - OPENAI_API_KEY=your-key-here"
        echo "   - SECRET_KEY=your-secret-here"
        echo ""
        echo "Press Enter after updating .env to continue..."
        read
    else
        echo "❌ .env.example not found. Cannot create .env file."
        exit 1
    fi
fi

# Verify OpenAI API key
if ! grep -q "OPENAI_API_KEY=sk-" .env; then
    echo ""
    echo "⚠️  WARNING: OpenAI API key not configured in .env"
    echo "   Some features will not work without a valid API key."
    echo ""
fi

# Ask about seeding data
echo ""
echo "📊 Do you want to seed sample data? (y/n)"
read -r SEED_DATA

if [ "$SEED_DATA" = "y" ] || [ "$SEED_DATA" = "Y" ]; then
    echo "🌱 Seeding sample data..."
    python3 scripts/seed_data.py
    echo "✅ Sample data seeded"
fi

# Start the server
echo ""
echo "================================================"
echo "🚀 Starting FastAPI server..."
echo "================================================"
echo ""
echo "Server will be available at:"
echo "  - Local:   http://localhost:8000"
echo "  - Docs:    http://localhost:8000/docs"
echo "  - ReDoc:   http://localhost:8000/redoc"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start with uvicorn
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
