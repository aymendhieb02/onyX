@echo off
cd /d "%~dp0"

echo Creating virtual environment...
if not exist ".venv\Scripts\python.exe" (
    python -m venv .venv
    if errorlevel 1 (
        echo ERROR: Could not create virtual environment.
        pause
        exit /b 1
    )
)

echo Installing Python dependencies into .venv...
".venv\Scripts\python.exe" -m pip install --upgrade pip
".venv\Scripts\python.exe" -m pip install -r requirements.txt

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Make sure .env contains your GROQ_API_KEY or OPENROUTER_API_KEY
echo 2. Run: RUN_ME.bat
pause
