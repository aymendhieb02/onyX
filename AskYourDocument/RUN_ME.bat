@echo off
echo ========================================
echo   Ask Your Document - Starting App
echo ========================================
echo.

cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
    echo Virtual environment not found. Creating it now...
    python -m venv .venv
    if errorlevel 1 (
        echo ERROR: Python not found or virtual environment could not be created!
        pause
        exit /b 1
    )
)

echo Checking Python...
".venv\Scripts\python.exe" --version
if errorlevel 1 (
    echo ERROR: Virtual environment Python is not working!
    pause
    exit /b 1
)

echo.
echo Installing/updating dependencies...
".venv\Scripts\python.exe" -m pip install -q -r requirements.txt

echo.
echo Starting Streamlit app...
echo.
echo Your browser should open automatically!
echo If not, go to: http://localhost:8501
echo.
echo Press Ctrl+C to stop the app
echo.

".venv\Scripts\python.exe" -m streamlit run app.py

pause
