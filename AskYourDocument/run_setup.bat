@echo off
echo Installing Python dependencies...
pip install -r requirements.txt
echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Create a .env file with your OPENAI_API_KEY
echo 2. Run: streamlit run app.py
pause

