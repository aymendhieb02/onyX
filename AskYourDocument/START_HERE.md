# 🚀 START HERE - Quick Setup (No Credit Card!)

## Step 1: Install Dependencies (2 minutes)

Open terminal in the `AskYourDocument` folder and run:

```bash
pip install -r requirements.txt
pip install sentence-transformers
```

The second command installs free local embeddings (no API needed for embeddings!).

---

## Step 2: Get FREE API Key (2 minutes)

### Option A: Groq (RECOMMENDED - Fastest!)

1. Go to: **https://console.groq.com/**
2. Sign up (use Google/GitHub - no credit card!)
3. Go to: **https://console.groq.com/keys**
4. Click "Create API Key"
5. Copy the key (starts with `gsk_...`)

### Option B: OpenRouter

1. Go to: **https://openrouter.ai/**
2. Sign up (no credit card!)
3. Go to: **https://openrouter.ai/keys**
4. Create new key
5. Copy it

---

## Step 3: Create .env File (1 minute)

1. In the `AskYourDocument` folder, create a file called `.env`
2. Open it in Notepad
3. Paste this (replace with YOUR key):

**If using Groq:**
```
AI_PROVIDER=groq
GROQ_API_KEY=gsk_your_actual_key_here
USE_LOCAL_EMBEDDINGS=true
```

**If using OpenRouter:**
```
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your_openrouter_key_here
USE_LOCAL_EMBEDDINGS=true
```

4. Save the file!

---

## Step 4: Run the App! (30 seconds)

In terminal (in `AskYourDocument` folder):

```bash
streamlit run app.py
```

Your browser should open automatically! 🎉

---

## Step 5: Test It!

1. In the sidebar, click "Browse files"
2. Select `test_document.txt`
3. Click "Process Document"
4. Wait for success message
5. Ask: "Who created Python?"
6. See the magic! ✨

---

## ✅ That's It!

You now have a working document Q&A app - **completely FREE!**

---

## 🆘 Having Issues?

- **"streamlit not found"**: Run `python -m pip install streamlit`
- **"API key error"**: Check your `.env` file is correct
- **"sentence-transformers error"**: Run `pip install sentence-transformers`
- **Need more help?**: Check `FREE_SETUP.md` for detailed guide

---

**Good luck with your hackathon!** 🍀

