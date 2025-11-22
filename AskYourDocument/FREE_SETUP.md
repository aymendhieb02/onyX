# 🆓 Free Setup Guide - No Credit Card Needed!

Since you don't have a credit card, here are **3 completely FREE options** to run this app:

---

## Option 1: Groq (RECOMMENDED - Fastest & Easiest!) ⚡

**Why Groq?**
- ✅ **100% FREE** (no credit card needed)
- ✅ **Super fast** responses
- ✅ **Easy setup** (just one API key)
- ✅ **Generous free tier**

### Setup Steps:

1. **Get a free API key:**
   - Go to: https://console.groq.com/
   - Sign up with Google/GitHub (no credit card!)
   - Go to: https://console.groq.com/keys
   - Click "Create API Key"
   - Copy the key

2. **Create `.env` file:**
   ```
   AI_PROVIDER=groq
   GROQ_API_KEY=your_groq_key_here
   USE_LOCAL_EMBEDDINGS=true
   ```

3. **Install local embeddings (optional but recommended):**
   ```bash
   pip install sentence-transformers
   ```
   This makes embeddings FREE and faster (no API calls needed!)

4. **Run the app:**
   ```bash
   streamlit run app.py
   ```

**That's it!** 🎉

---

## Option 2: OpenRouter (Also Free!) 🌐

**Why OpenRouter?**
- ✅ **FREE tier** available
- ✅ Access to multiple AI models
- ✅ No credit card needed for free tier

### Setup Steps:

1. **Get a free API key:**
   - Go to: https://openrouter.ai/
   - Sign up (no credit card needed!)
   - Go to: https://openrouter.ai/keys
   - Create a new key
   - Copy it

2. **Create `.env` file:**
   ```
   AI_PROVIDER=openrouter
   OPENROUTER_API_KEY=your_openrouter_key_here
   USE_LOCAL_EMBEDDINGS=true
   ```

3. **Install local embeddings:**
   ```bash
   pip install sentence-transformers
   ```

4. **Run the app:**
   ```bash
   streamlit run app.py
   ```

---

## Option 3: HuggingFace (Completely Free!) 🤗

**Why HuggingFace?**
- ✅ **100% FREE** (no credit card ever!)
- ✅ Open source models
- ✅ Great for learning

### Setup Steps:

1. **Get a free API key:**
   - Go to: https://huggingface.co/
   - Sign up (completely free!)
   - Go to: https://huggingface.co/settings/tokens
   - Click "New token"
   - Name it "AskYourDocument"
   - Copy the token

2. **Create `.env` file:**
   ```
   AI_PROVIDER=huggingface
   HUGGINGFACE_API_KEY=your_huggingface_token_here
   USE_LOCAL_EMBEDDINGS=true
   ```

3. **Install local embeddings:**
   ```bash
   pip install sentence-transformers
   ```

4. **Run the app:**
   ```bash
   streamlit run app.py
   ```

---

## Option 4: 100% Local (No Internet Needed!) 🏠

**Why Local?**
- ✅ **Completely FREE** (no API keys at all!)
- ✅ **Works offline**
- ✅ **No rate limits**
- ✅ **Privacy** (everything stays on your computer)

### Setup Steps:

1. **Install local models:**
   ```bash
   pip install sentence-transformers
   ```

2. **Create `.env` file:**
   ```
   AI_PROVIDER=local
   USE_LOCAL_EMBEDDINGS=true
   ```

3. **Note:** Chat models need more setup. For now, use Groq (Option 1) for chat, but local embeddings work great!

---

## 🎯 My Recommendation

**Use Groq (Option 1)** because:
- Fastest setup (5 minutes)
- Fastest responses
- Most reliable
- Still free!

**Plus install local embeddings:**
```bash
pip install sentence-transformers
```

This gives you:
- ✅ Free embeddings (local)
- ✅ Free chat (Groq)
- ✅ Fast performance
- ✅ No credit card needed!

---

## 📝 Complete .env Example (Groq + Local Embeddings)

Create a file called `.env` in the `AskYourDocument` folder:

```
# AI Provider: groq, openrouter, huggingface, or local
AI_PROVIDER=groq

# Groq API Key (get free at https://console.groq.com/keys)
GROQ_API_KEY=your_groq_key_here

# Use local embeddings (recommended - faster and free!)
USE_LOCAL_EMBEDDINGS=true

# Optional: Other provider keys (if you want to switch)
# OPENROUTER_API_KEY=your_openrouter_key_here
# HUGGINGFACE_API_KEY=your_huggingface_token_here
```

---

## 🚀 Quick Start (Groq)

1. **Get Groq API key:** https://console.groq.com/keys
2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   pip install sentence-transformers
   ```
3. **Create `.env` file** (see example above)
4. **Run:**
   ```bash
   streamlit run app.py
   ```

**Done!** 🎉

---

## ❓ Troubleshooting

### "GROQ_API_KEY not found"
- Make sure you created the `.env` file
- Check that the key is correct (no extra spaces)
- Make sure the file is in the `AskYourDocument` folder

### "sentence-transformers not installed"
- Run: `pip install sentence-transformers`
- This might take a few minutes (downloads ~100MB model)

### "Error calling Groq API"
- Check your internet connection
- Verify your API key is correct
- Make sure you're not hitting rate limits (unlikely on free tier)

---

## 💡 Pro Tips

1. **Use local embeddings** - They're free and faster!
2. **Groq is fastest** - Best for hackathons!
3. **Test with small documents first** - Make sure everything works
4. **Keep your `.env` file secret** - Don't share it on GitHub!

---

**Need help?** Just ask! 😊

