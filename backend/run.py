"""
Quick startup script for ReNova backend
Python alternative to start.sh for cross-platform compatibility
"""

import subprocess
import sys
import os
from pathlib import Path

def main():
    print("=" * 60)
    print("🚀 ReNova Backend Startup")
    print("=" * 60)
    
    # Get backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Check Python version
    if sys.version_info < (3, 9):
        print("❌ Python 3.9+ required")
        sys.exit(1)
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor}")
    
    # Check .env
    if not Path(".env").exists():
        print("\n⚠️  .env file not found!")
        if Path(".env.example").exists():
            print("📝 Copying .env.example to .env...")
            import shutil
            shutil.copy(".env.example", ".env")
            print("\n⚠️  IMPORTANT: Edit .env and add your API keys!")
            print("   - OPENAI_API_KEY=your-key-here")
            print("   - SECRET_KEY=your-secret-here")
            input("\nPress Enter after updating .env...")
        else:
            print("❌ .env.example not found")
            sys.exit(1)
    
    # Check dependencies
    print("\n📦 Checking dependencies...")
    try:
        import fastapi
        import motor
        print("✅ Core dependencies found")
    except ImportError:
        print("⚠️  Installing dependencies...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "-r", "requirements.txt"])
        print("✅ Dependencies installed")
    
    # Ask about seeding
    print("\n📊 Seed sample data? (y/n): ", end="")
    if input().lower() == 'y':
        print("🌱 Seeding data...")
        subprocess.run([sys.executable, "scripts/seed_data.py"])
    
    # Start server
    print("\n" + "=" * 60)
    print("🚀 Starting FastAPI server...")
    print("=" * 60)
    print("\n📍 Server URLs:")
    print("  - API:     http://localhost:8000")
    print("  - Docs:    http://localhost:8000/docs")
    print("  - ReDoc:   http://localhost:8000/redoc")
    print("\n⏸️  Press Ctrl+C to stop\n")
    
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn",
            "app.main:app",
            "--reload",
            "--host", "0.0.0.0",
            "--port", "8000"
        ])
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped")

if __name__ == "__main__":
    main()
