# 🚀 Beginner's Setup Guide - Step by Step

## What is this project?
This is a web app where you can:
1. Upload a text document (.txt file)
2. Ask questions about it
3. Get AI-powered answers based on the document content

Think of it like ChatGPT, but it only knows about YOUR document!

---

## Step 1: Install Python Dependencies

**What are dependencies?** 
- These are extra Python packages (like libraries) that our code needs to work
- Similar to installing apps on your phone - we need these "apps" for Python

**How to install:**
1. Open your terminal/command prompt
2. Navigate to the AskYourDocument folder
3. Run this command:

```bash
pip install -r requirements.txt
```

This will install all the packages listed in `requirements.txt` (like Streamlit, OpenAI, ChromaDB, etc.)

**What if it says "pip not found"?**
- Try: `python -m pip install -r requirements.txt`
- Or: `py -m pip install -r requirements.txt`

---

## Step 2: Get an OpenAI API Key

**What is an API key?**
- It's like a password that lets our app use OpenAI's AI models
- We need it to:
  - Convert text into numbers (embeddings) - so the computer can understand meaning
  - Generate answers using GPT-3.5

**How to get one:**
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Go to API Keys section: https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy the key (it looks like: `sk-...`)

**⚠️ Important:** Keep this key secret! Don't share it or put it on GitHub.

---

## Step 3: Create .env File

**What is a .env file?**
- It's a file where we store secret information (like API keys)
- The `.gitignore` file makes sure we don't accidentally share it

**How to create it:**
1. In the `AskYourDocument` folder, create a new file called `.env`
2. Open it in a text editor
3. Add this line (replace with YOUR actual key):

```
OPENAI_API_KEY=sk-your-actual-key-here
USE_LOCAL_MODELS=false
```

**Example:**
```
OPENAI_API_KEY=sk-abc123xyz456...
USE_LOCAL_MODELS=false
```

---

## Step 4: Run the Application

**What is Streamlit?**
- It's a Python library that makes it SUPER easy to create web apps
- Instead of writing HTML/CSS/JavaScript, we just write Python!

**How to run:**
1. Make sure you're in the `AskYourDocument` folder
2. Run this command:

```bash
streamlit run app.py
```

**What happens:**
- Your terminal will show something like:
  ```
  You can now view your Streamlit app in your browser.
  Local URL: http://localhost:8501
  ```
- Your web browser should automatically open
- If not, copy the URL and paste it in your browser

**To stop the app:**
- Press `Ctrl + C` in the terminal

---

## Step 5: Test It!

1. **Create a test document:**
   - Create a file called `test.txt` with some text
   - Example content:
     ```
     Python is a programming language. It was created by Guido van Rossum.
     Python is known for being easy to learn. Many people use Python for data science.
     Machine learning is a popular use case for Python.
     ```

2. **In the web app:**
   - Click "Browse files" in the sidebar
   - Select your `test.txt` file
   - Click "Process Document"
   - Wait for the success message

3. **Ask a question:**
   - Type in the chat: "Who created Python?"
   - Press Enter
   - You should get an answer!

---

## Common Problems & Solutions

### Problem: "ModuleNotFoundError: No module named 'streamlit'"
**Solution:** You need to install dependencies. Run: `pip install -r requirements.txt`

### Problem: "OPENAI_API_KEY not found"
**Solution:** Make sure you created the `.env` file with your API key

### Problem: "Port 8501 is already in use"
**Solution:** Another Streamlit app is running. Either:
- Stop the other app (Ctrl+C in its terminal)
- Or run: `streamlit run app.py --server.port 8502`

### Problem: "Error: Invalid API key"
**Solution:** 
- Check that your API key in `.env` is correct
- Make sure there are no extra spaces
- Make sure you have credits in your OpenAI account

---

## What's Happening Behind the Scenes?

When you upload a document and ask a question:

1. **Document Processing:**
   - The document is split into small chunks (like paragraphs)
   - Each chunk is converted into numbers (embeddings) that represent meaning

2. **Question Processing:**
   - Your question is also converted into numbers (embeddings)

3. **Finding Relevant Parts:**
   - The computer compares your question's numbers with all the document chunks
   - It finds the most similar/relevant chunks

4. **Generating Answer:**
   - The AI (GPT-3.5) reads the relevant chunks
   - It creates an answer based ONLY on those chunks
   - This prevents "hallucinations" (making up answers)

---

## Next Steps

Once this works, we can add:
- ✅ Better UI design
- ✅ Citation with context (showing exact quotes)
- ✅ Follow-up question suggestions
- ✅ Document visualization
- ✅ And more cool features!

---

**Need help?** Just ask! 😊

