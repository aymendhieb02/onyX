# 🚀 Quick Start Guide (Super Simple!)

## Step 1: Install Dependencies

Open your terminal/command prompt in the `AskYourDocument` folder and run:

```bash
pip install -r requirements.txt
```

**OR** double-click `run_setup.bat` (Windows)

This installs all the Python packages we need (like Streamlit, OpenAI, etc.)

---

## Step 2: Get OpenAI API Key

1. Go to: https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)

---

## Step 3: Create .env File

1. In the `AskYourDocument` folder, create a new file called `.env`
2. Open it in Notepad or any text editor
3. Paste this (replace with YOUR key):

```
OPENAI_API_KEY=sk-your-key-here
USE_LOCAL_MODELS=false
```

**Example:**
```
OPENAI_API_KEY=sk-abc123xyz456...
USE_LOCAL_MODELS=false
```

Save the file!

---

## Step 4: Run the App!

In your terminal (in the `AskYourDocument` folder), run:

```bash
streamlit run app.py
```

Your browser should open automatically! If not, go to: http://localhost:8501

---

## Step 5: Test It!

1. In the sidebar, click "Browse files"
2. Select `test_document.txt` (I created this for you!)
3. Click "Process Document"
4. Wait for the success message
5. Type a question like: "Who created Python?"
6. Press Enter
7. See the magic! ✨

---

## That's It! 🎉

You now have a working document Q&A app!

**To stop the app:** Press `Ctrl + C` in the terminal

---

## Need Help?

- Check `SETUP_GUIDE.md` for detailed explanations
- Make sure your `.env` file has the correct API key
- Make sure you installed dependencies (Step 1)

