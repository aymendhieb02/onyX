# Streamlit Cloud Deployment Guide

## Quick Fix for ModuleNotFoundError

If you're getting `ModuleNotFoundError: No module named 'dotenv'` when deploying to Streamlit Cloud, follow these steps:

### Solution 1: Verify requirements.txt Location

Make sure `requirements.txt` is in the **same directory** as your `app.py` file:
```
AskYourDocument/
├── app.py
├── requirements.txt  ← Must be here
└── backend/
    └── ...
```

### Solution 2: Check Repository Structure on Streamlit Cloud

When deploying to Streamlit Cloud:
1. Go to your app settings in Streamlit Cloud
2. Under "App directory", make sure it points to: `AskYourDocument` (or the folder containing app.py)
3. Under "Main file", it should be: `app.py`

### Solution 3: Verify requirements.txt Format

Your `requirements.txt` should look like this (no blank lines at the end):
```
streamlit>=1.28.0
python-dotenv>=1.0.0
chromadb>=0.4.15
openai>=1.6.1
requests>=2.31.0
sentence-transformers>=2.2.0
pymongo>=4.0.0,<5.0.0
certifi>=2023.0.0
```

### Solution 4: Add packages.txt (if needed)

If requirements.txt still doesn't work, create a `packages.txt` file in the same directory:
```
python3-dev
```

### Solution 5: Check Streamlit Cloud Logs

1. Go to your app on Streamlit Cloud
2. Click "Manage app" (bottom right)
3. Check the logs to see the exact error
4. Look for any installation errors during the build process

## Common Issues

### Issue: "ModuleNotFoundError: No module named 'dotenv'"
**Fix**: Make sure `python-dotenv>=1.0.0` is in requirements.txt

### Issue: "ModuleNotFoundError: No module named 'backend'"
**Fix**: Make sure the app directory is set correctly in Streamlit Cloud settings

### Issue: Build fails during installation
**Fix**: Check if all package versions are compatible. Try pinning specific versions:
```
python-dotenv==1.0.0
```

## Environment Variables

Don't forget to set your environment variables in Streamlit Cloud:
1. Go to "Manage app" → "Secrets"
2. Add your `.env` variables there, for example:
```
AI_PROVIDER=groq
GROQ_API_KEY=your_key_here
USE_LOCAL_EMBEDDINGS=true
```

## Testing Locally Before Deployment

Test that your requirements.txt works locally:
```bash
cd AskYourDocument
pip install -r requirements.txt
python -c "from dotenv import load_dotenv; print('Success!')"
```

If this works locally but fails on Streamlit Cloud, the issue is likely with the deployment configuration.

