# 🧪 Complete Testing Guide - Ask Your Document

## 📋 Table of Contents

1. [Pre-Testing Setup](#pre-testing-setup)
2. [Feature Testing Checklist](#feature-testing-checklist)
3. [Test Scenarios](#test-scenarios)
4. [Edge Cases](#edge-cases)
5. [Performance Testing](#performance-testing)
6. [UI/UX Testing](#uiux-testing)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Pre-Testing Setup

### 1. Environment Setup

```bash
# Navigate to project directory
cd buildwithai/AskYourDocument

# Install dependencies
pip install -r requirements.txt
pip install sentence-transformers

# Create .env file
# Add your API keys (see FREE_SETUP.md)
```

### 2. Test Document Preparation

Create a test document (`test_document.txt`) with:
- At least 2000 words
- Multiple topics/sections
- Some repeated concepts
- Questions that can be asked

**Sample Test Document Structure:**
```
Title: Introduction to Python Programming

Section 1: What is Python?
Python is a high-level programming language...

Section 2: Popular Use Cases
Python is used for:
- Web development
- Data science
- Machine learning
...

Section 3: Key Features
- Readable syntax
- Multiple paradigms
...
```

### 3. Start the Application

```bash
streamlit run app.py
```

The app should open at `http://localhost:8501`

---

## ✅ Feature Testing Checklist

### Core Features

#### 1. Document Upload & Processing
- [ ] Upload a .txt file (small: <100KB)
- [ ] Upload a .txt file (medium: 100KB-500KB)
- [ ] Upload a .txt file (large: 500KB-1MB)
- [ ] Try uploading file >5MB (should show error)
- [ ] Verify progress bar appears during processing
- [ ] Check that processing completes successfully
- [ ] Verify chunk count is displayed

**Expected Results:**
- Small files process quickly (<30 seconds)
- Medium files process in 1-2 minutes
- Large files process in 2-5 minutes
- Error message for oversized files
- Progress bar shows "Processing chunk X/Y"

#### 2. Document Summarization
- [ ] After upload, check sidebar for "Document Summary"
- [ ] Verify executive summary is generated
- [ ] Check that key points are listed (5-7 points)
- [ ] Verify suggested questions appear
- [ ] Click on a suggested question (should auto-ask)

**Expected Results:**
- Summary appears within 10-20 seconds
- Summary is 2-3 sentences
- Key points are relevant to document
- Suggested questions are clickable

#### 3. Q&A System
- [ ] Ask a simple question: "What is this document about?"
- [ ] Ask a specific question: "What are the main topics?"
- [ ] Ask a detailed question requiring multiple chunks
- [ ] Ask a question with low confidence (<50%)
- [ ] Verify answer appears
- [ ] Check confidence score is displayed
- [ ] Verify sources are shown

**Expected Results:**
- Answers appear within 5-10 seconds
- Answers are relevant to the question
- Confidence scores are between 0-100%
- Sources show similarity percentages

#### 4. Citation with Context
- [ ] Ask a question that has sources
- [ ] Click "View Sources & Citations"
- [ ] Verify exact quotes are highlighted
- [ ] Check before/after context is shown
- [ ] Verify similarity scores are color-coded
- [ ] Check full chunk view is expandable

**Expected Results:**
- Sources show exact quotes from document
- Context helps understand the quote
- Similarity scores: 🟢 High (≥70%), 🟡 Medium (50-69%), 🔴 Low (<50%)

### Advanced Features

#### 5. Follow-up Question Suggestions
- [ ] Ask a question
- [ ] Wait for answer
- [ ] Check that follow-up questions appear
- [ ] Click on a follow-up question
- [ ] Verify it's asked automatically

**Expected Results:**
- 3-5 follow-up questions appear
- Questions are related to the original question
- Clicking a question asks it automatically

#### 6. Conversational Memory
- [ ] Ask: "What is Python?"
- [ ] Then ask: "Tell me more about that"
- [ ] Verify the system remembers the previous question
- [ ] Ask: "What about the second point?"
- [ ] Check that context is maintained

**Expected Results:**
- System understands "that" refers to previous answer
- Context is maintained across 3-5 exchanges
- Answers reference previous conversation

#### 7. Query Rewriting
- [ ] Ask a vague question with low confidence
- [ ] Check if query rewrite suggestions appear
- [ ] Click on a rewritten query
- [ ] Verify it's asked automatically

**Expected Results:**
- Rewrite suggestions appear when confidence <50%
- Suggestions are more specific than original
- Clicking asks the rewritten question

#### 8. Answer Verification
- [ ] Ask a question
- [ ] Check for verification message
- [ ] Verify consistency check is shown
- [ ] Check similarity ratio is displayed

**Expected Results:**
- ✅ "Verified: Answer is consistent" for good answers
- ⚠️ Warning for potentially inconsistent answers
- Similarity ratio shows how well answer matches document

#### 9. Multi-Perspective Answers
- [ ] Go to Settings
- [ ] Select "ELI5" (Explain Like I'm 5)
- [ ] Ask a question
- [ ] Verify answer is simplified
- [ ] Switch to "Expert" perspective
- [ ] Ask same question
- [ ] Verify answer is more technical

**Expected Results:**
- ELI5: Simple language, analogies
- Expert: Technical terms, detailed analysis
- Normal: Balanced explanation
- Lawyer: Legal perspective
- Poet: Creative, metaphorical

#### 10. Document Telepathy (Thought Bubbles)
- [ ] Enable "Show AI Thoughts" in Settings
- [ ] Ask a question
- [ ] Verify thought bubbles appear
- [ ] Check that thoughts show reasoning process

**Expected Results:**
- Thought bubbles show: "🔍 Searching document..."
- "📚 Found X relevant chunks"
- "🧠 Analyzing context..."

#### 11. Animated Loading States
- [ ] Ask a question
- [ ] Watch loading animation
- [ ] Verify steps appear sequentially:
  - 🔍 Searching document...
  - 📚 Finding relevant sections...
  - 🧠 Analyzing context...
  - ✍️ Generating answer...

**Expected Results:**
- Smooth animation between steps
- Each step appears for ~0.3 seconds
- Final step leads to answer

#### 12. Smart Chunking Visualization
- [ ] Enable "Show Chunking Visualization" in Settings
- [ ] Check chunking info appears
- [ ] Verify total chunks count
- [ ] Check chunk size and overlap are shown

**Expected Results:**
- Shows total number of chunks created
- Displays chunk size (1500 chars)
- Shows overlap (300 chars)

#### 13. Document Insights Dashboard
- [ ] After uploading document
- [ ] Check "Document Insights" in sidebar
- [ ] Verify statistics:
  - Word count
  - Character count
  - Sentence count
  - Reading time
- [ ] Check top keywords are listed

**Expected Results:**
- All statistics are accurate
- Reading time is reasonable (words/200)
- Top keywords are meaningful (not common words)

#### 14. Export Chat History
- [ ] Have a conversation (3-5 questions)
- [ ] Click "Export Chat" button
- [ ] Verify JSON file downloads
- [ ] Open JSON file
- [ ] Check it contains:
  - All questions
  - All answers
  - Sources
  - Confidence scores

**Expected Results:**
- File downloads as `chat_history_YYYYMMDD_HHMMSS.json`
- JSON is properly formatted
- All conversation data is included

#### 15. Dark Mode
- [ ] Toggle "Dark Mode" in sidebar
- [ ] Verify background changes to dark
- [ ] Check text is readable
- [ ] Verify all UI elements are visible
- [ ] Toggle back to light mode

**Expected Results:**
- Smooth transition between modes
- All text is readable in both modes
- UI elements maintain functionality

---

## 🎯 Test Scenarios

### Scenario 1: First-Time User Flow

1. **Open Application**
   - ✅ App loads without errors
   - ✅ Sidebar shows upload section
   - ✅ Main area shows instruction message

2. **Upload Document**
   - ✅ Click "Browse files"
   - ✅ Select test_document.txt
   - ✅ Click "Process Document"
   - ✅ Progress bar appears
   - ✅ Success message appears

3. **View Summary**
   - ✅ Summary appears in sidebar
   - ✅ Key points are listed
   - ✅ Suggested questions are shown

4. **Ask First Question**
   - ✅ Click on a suggested question
   - ✅ Question is asked automatically
   - ✅ Answer appears
   - ✅ Sources are available

5. **Explore Further**
   - ✅ Click on a follow-up question
   - ✅ Continue conversation
   - ✅ Context is maintained

**Expected Outcome:** Smooth, intuitive experience for new users

---

### Scenario 2: Complex Question

1. **Ask Multi-Part Question**
   - Question: "What are the main features and how are they used?"
   - ✅ Answer addresses both parts
   - ✅ Multiple sources are cited
   - ✅ Confidence is reasonable (>60%)

2. **Ask Follow-up**
   - Question: "Can you give examples?"
   - ✅ System remembers previous context
   - ✅ Examples are provided
   - ✅ Sources are relevant

**Expected Outcome:** System handles complex queries and maintains context

---

### Scenario 3: Low Confidence Handling

1. **Ask Vague Question**
   - Question: "Tell me something interesting"
   - ✅ Answer is provided
   - ✅ Confidence is low (<50%)
   - ✅ Query rewrite suggestions appear

2. **Use Rewritten Query**
   - ✅ Click on a rewritten suggestion
   - ✅ New question is asked
   - ✅ Confidence improves

**Expected Outcome:** System helps users refine questions for better results

---

### Scenario 4: Document Analysis

1. **Upload Technical Document**
   - ✅ Document processes successfully
   - ✅ Summary captures main topics
   - ✅ Insights show relevant keywords

2. **Ask Technical Questions**
   - ✅ Answers use appropriate terminology
   - ✅ Expert perspective works well
   - ✅ Sources are technical content

**Expected Outcome:** System adapts to document type and user needs

---

## 🔍 Edge Cases

### 1. Empty Document
- [ ] Upload empty .txt file
- **Expected:** Error message: "Document is empty"

### 2. Very Short Document
- [ ] Upload document with <100 words
- **Expected:** Processes successfully, may have 1-2 chunks

### 3. Very Long Document
- [ ] Upload document >1MB text
- **Expected:** Warning message, processes in chunks

### 4. Special Characters
- [ ] Upload document with special characters (é, ñ, 中文)
- **Expected:** Handles encoding correctly

### 5. Questions with No Answer
- [ ] Ask: "What is the weather today?"
- **Expected:** "I cannot find this information in the document"

### 6. Rapid Questions
- [ ] Ask 5 questions quickly in succession
- **Expected:** All process correctly, no errors

### 7. Very Long Questions
- [ ] Ask question with 500+ characters
- **Expected:** Processes correctly, may take longer

### 8. Questions with Typos
- [ ] Ask: "Waht is Pythn?"
- **Expected:** System attempts to answer, may suggest corrections

### 9. Multiple Documents (Sequential)
- [ ] Upload document 1, ask questions
- [ ] Clear and upload document 2
- **Expected:** Previous context cleared, new document processed

### 10. Export Empty Chat
- [ ] Try to export with no questions asked
- **Expected:** Button disabled or shows message

---

## ⚡ Performance Testing

### Response Times

| Action | Target Time | Acceptable Time |
|--------|-------------|-----------------|
| Document Upload (100KB) | <30s | <60s |
| Document Upload (500KB) | <2min | <3min |
| Question Answering | <10s | <20s |
| Summary Generation | <15s | <30s |
| Follow-up Questions | <5s | <10s |

### Memory Usage

- [ ] Monitor memory during document processing
- [ ] Check memory doesn't exceed 2GB for 1MB document
- [ ] Verify memory is released after processing

### Concurrent Users

- [ ] Test with multiple browser tabs
- [ ] Verify each session is independent
- [ ] Check no interference between sessions

---

## 🎨 UI/UX Testing

### Visual Elements

- [ ] All buttons are clickable
- [ ] Colors are consistent
- [ ] Text is readable
- [ ] Icons are clear
- [ ] Spacing is appropriate

### Responsiveness

- [ ] Test on different screen sizes
- [ ] Verify sidebar collapses on mobile
- [ ] Check text doesn't overflow
- [ ] Buttons remain accessible

### Accessibility

- [ ] Keyboard navigation works
- [ ] Screen reader compatible (if applicable)
- [ ] Color contrast is sufficient
- [ ] Error messages are clear

### User Feedback

- [ ] Loading states are visible
- [ ] Success messages appear
- [ ] Error messages are helpful
- [ ] Progress indicators work

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: "Error initializing RAG pipeline"
**Solution:**
- Check .env file exists
- Verify API keys are correct
- Check internet connection
- Try restarting the app

#### Issue: "Could not load local embeddings"
**Solution:**
- Install sentence-transformers: `pip install sentence-transformers`
- System will fall back to API embeddings automatically
- Check PyTorch version compatibility

#### Issue: "Document processing stuck"
**Solution:**
- Check file size (should be <5MB)
- Verify internet connection (for API embeddings)
- Try smaller document first
- Check console for error messages

#### Issue: "Low confidence answers"
**Solution:**
- Try rephrasing the question
- Use query rewrite suggestions
- Check if information exists in document
- Try different perspective (Expert vs ELI5)

#### Issue: "Sources not showing"
**Solution:**
- Verify document was processed successfully
- Check that question has relevant content
- Try a different question
- Check browser console for errors

#### Issue: "Dark mode not working"
**Solution:**
- Refresh the page
- Check browser compatibility
- Try toggling off and on again
- Clear browser cache

---

## 📊 Test Results Template

```
Test Date: ___________
Tester: ___________
Environment: ___________

### Core Features
- Document Upload: [ ] Pass [ ] Fail [ ] Notes: ___________
- Summarization: [ ] Pass [ ] Fail [ ] Notes: ___________
- Q&A System: [ ] Pass [ ] Fail [ ] Notes: ___________
- Citations: [ ] Pass [ ] Fail [ ] Notes: ___________

### Advanced Features
- Follow-up Questions: [ ] Pass [ ] Fail [ ] Notes: ___________
- Conversational Memory: [ ] Pass [ ] Fail [ ] Notes: ___________
- Query Rewriting: [ ] Pass [ ] Fail [ ] Notes: ___________
- Answer Verification: [ ] Pass [ ] Fail [ ] Notes: ___________
- Multi-Perspective: [ ] Pass [ ] Fail [ ] Notes: ___________
- Thought Bubbles: [ ] Pass [ ] Fail [ ] Notes: ___________
- Loading Animation: [ ] Pass [ ] Fail [ ] Notes: ___________
- Chunking Viz: [ ] Pass [ ] Fail [ ] Notes: ___________
- Insights: [ ] Pass [ ] Fail [ ] Notes: ___________
- Export: [ ] Pass [ ] Fail [ ] Notes: ___________
- Dark Mode: [ ] Pass [ ] Fail [ ] Notes: ___________

### Performance
- Response Times: [ ] Pass [ ] Fail [ ] Notes: ___________
- Memory Usage: [ ] Pass [ ] Fail [ ] Notes: ___________

### Issues Found:
1. ___________
2. ___________
3. ___________

### Recommendations:
___________
```

---

## ✅ Quick Test Checklist

Run these 5 quick tests to verify basic functionality:

1. **Upload Test Document** → Should process successfully
2. **Ask: "What is this about?"** → Should get summary answer
3. **Click Follow-up Question** → Should ask automatically
4. **Toggle Dark Mode** → Should switch themes
5. **Export Chat** → Should download JSON file

If all 5 pass, the core system is working! 🎉

---

## 🎯 Success Criteria

The application is considered **fully functional** when:

- ✅ All core features work without errors
- ✅ At least 80% of advanced features work
- ✅ Response times meet targets
- ✅ No critical bugs
- ✅ UI is responsive and intuitive
- ✅ Error handling is graceful

---

**Happy Testing!** 🚀

For issues or questions, check the troubleshooting section or review the code comments.

