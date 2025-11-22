@echo off
echo ========================================
echo   Ask Your Document - Starting App
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Python...
python --version
if errorlevel 1 (
    echo ERROR: Python not found!
    pause
    exit /b 1
)

echo.
echo Installing/updating dependencies...
python -m pip install -q streamlit requests chromadb python-dotenv sentence-transformers

echo.
echo Starting Streamlit app...
echo.
echo Your browser should open automatically!
echo If not, go to: http://localhost:8501
echo.
echo Press Ctrl+C to stop the app
echo.

python -m streamlit run app.py

pause

