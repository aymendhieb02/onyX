"""Streamlit frontend for Ask Your Document."""

import streamlit as st
import sys
import os
from datetime import datetime
import json
import re

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.rag_pipeline import RAGPipeline
from backend.mongodb_storage import MongoDBStorage

# Page configuration
st.set_page_config(
    page_title="Ask Your Document",
    page_icon="📄",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize dark_mode if not exists (must be before sidebar access)
if 'dark_mode' not in st.session_state:
    st.session_state.dark_mode = False

# Professional Dark Mode CSS
dark_mode_css = """
    /* Main App Container */
    [data-testid="stAppViewContainer"] {
        background-color: #0f172a !important;
        color: #e2e8f0 !important;
    }
    
    /* Sidebar */
    [data-testid="stSidebar"] {
        background-color: #1e293b !important;
        border-right: 1px solid #334155;
    }
    
    /* Text Colors */
    .stMarkdown, .stMarkdown p, .stMarkdown li, .stMarkdown ul, .stMarkdown ol {
        color: #e2e8f0 !important;
    }
    
    h1, h2, h3, h4, h5, h6 {
        color: #f1f5f9 !important;
    }
    
    /* Input Fields */
    .stTextInput>div>div>input, .stTextArea>div>div>textarea {
        background-color: #1e293b !important;
        color: #e2e8f0 !important;
        border-color: #475569 !important;
    }
    
    .stTextInput>div>div>input:focus, .stTextArea>div>div>textarea:focus {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
    }
    
    /* Buttons */
    .stButton>button {
        background-color: #3b82f6 !important;
        color: white !important;
        border: none !important;
    }
    
    .stButton>button:hover {
        background-color: #2563eb !important;
    }
    
    /* Expanders */
    .streamlit-expanderHeader {
        background-color: #1e293b !important;
        color: #e2e8f0 !important;
    }
    
    /* Chat Messages */
    [data-testid="stChatMessage"] {
        background-color: #1e293b !important;
    }
    
    /* Info/Error/Success Boxes */
    .stAlert {
        background-color: #1e293b !important;
        border-color: #475569 !important;
    }
    
    /* Citation Box */
    .citation-box {
        background-color: #1e293b !important;
        color: #e2e8f0 !important;
        border-left: 4px solid #3b82f6 !important;
    }
    
    /* Thought Bubble */
    .thought-bubble {
        background-color: #1e3a8a !important;
        color: #dbeafe !important;
        border-left: 4px solid #60a5fa !important;
    }
    
    /* Metrics */
    [data-testid="stMetricValue"] {
        color: #f1f5f9 !important;
    }
    
    /* Selectbox/Dropdown */
    .stSelectbox>div>div>select {
        background-color: #1e293b !important;
        color: #e2e8f0 !important;
    }
    
    /* File Uploader */
    [data-testid="stFileUploader"] {
        background-color: #1e293b !important;
    }
    
    /* Toggle */
    .stCheckbox label {
        color: #e2e8f0 !important;
    }
    
    /* Progress Bar */
    .stProgress>div>div>div {
        background-color: #3b82f6 !important;
    }
""" if st.session_state.dark_mode else ""

light_mode_css = """
    /* Light Mode Enhancements */
    [data-testid="stAppViewContainer"] {
        background-color: #ffffff !important;
    }
    
    [data-testid="stSidebar"] {
        background-color: #f8fafc !important;
        border-right: 1px solid #e2e8f0;
    }
    
    .citation-box {
        background-color: #f1f5f9 !important;
        border-left: 4px solid #3b82f6 !important;
    }
    
    .thought-bubble {
        background-color: #dbeafe !important;
        border-left: 4px solid #3b82f6 !important;
    }
""" if not st.session_state.dark_mode else ""

st.markdown(f"""
<style>
    /* Base Styles */
    .main-header {{
        font-size: 2.5rem;
        font-weight: bold;
        color: #1f77b4;
        margin-bottom: 1rem;
    }}
    
    .stButton>button {{
        border-radius: 8px;
        transition: all 0.3s ease;
        font-weight: 500;
    }}
    
    .stButton>button:hover {{
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }}
    
    .citation-box {{
        padding: 1rem;
        border-radius: 8px;
        margin: 0.5rem 0;
        transition: all 0.3s ease;
    }}
    
    .citation-box:hover {{
        transform: translateX(4px);
    }}
    
    .confidence-high {{
        color: #10b981;
        font-weight: 600;
    }}
    
    .confidence-medium {{
        color: #f59e0b;
        font-weight: 600;
    }}
    
    .confidence-low {{
        color: #ef4444;
        font-weight: 600;
    }}
    
    .thought-bubble {{
        padding: 1rem;
        border-radius: 12px;
        margin: 0.5rem 0;
        font-style: italic;
        animation: fadeIn 0.5s ease-in;
    }}
    
    @keyframes fadeIn {{
        from {{ opacity: 0; transform: translateY(-10px); }}
        to {{ opacity: 1; transform: translateY(0); }}
    }}
    
    .loading-step {{
        padding: 0.5rem;
        margin: 0.25rem 0;
        border-left: 3px solid #3b82f6;
        animation: slideIn 0.3s ease-out;
    }}
    
    @keyframes slideIn {{
        from {{ transform: translateX(-10px); opacity: 0; }}
        to {{ transform: translateX(0); opacity: 1; }}
    }}
    
    .perspective-tab {{
        padding: 0.5rem 1rem;
        margin: 0.25rem;
        border-radius: 5px;
        cursor: pointer;
        display: inline-block;
        transition: all 0.2s ease;
    }}
    
    .perspective-active {{
        background-color: #3b82f6;
        color: white;
    }}
    
    /* Smooth Transitions */
    * {{
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    }}
    
    /* Dark Mode Styles */
    {dark_mode_css}
    
    /* Light Mode Styles */
    {light_mode_css}
</style>
""", unsafe_allow_html=True)

# Show loading animation on first load only
if 'app_initialized' not in st.session_state:
    st.session_state.app_initialized = False
    st.session_state.show_loading = True
    
    # Show beautiful loading screen
    st.markdown("""
    <style>
        .loading-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
            transition: opacity 0.6s ease-out;
        }
        
        .loading-screen.hidden {
            opacity: 0;
            pointer-events: none;
        }
        
        .loading-logo {
            font-size: 4rem;
            margin-bottom: 2rem;
            animation: pulse 2s ease-in-out infinite;
        }
        
        .loading-text {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            animation: fadeInOut 2s ease-in-out infinite;
        }
        
        .loading-spinner {
            width: 60px;
            height: 60px;
            border: 5px solid rgba(255, 255, 255, 0.3);
            border-top: 5px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-top: 2rem;
        }
        
        .loading-dots {
            display: flex;
            gap: 10px;
            margin-top: 1rem;
        }
        
        .loading-dot {
            width: 12px;
            height: 12px;
            background: white;
            border-radius: 50%;
            animation: bounce 1.4s ease-in-out infinite;
        }
        
        .loading-dot:nth-child(1) { animation-delay: 0s; }
        .loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dot:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }
        
        @keyframes fadeInOut {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @keyframes bounce {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.7; }
            40% { transform: translateY(-20px); opacity: 1; }
        }
    </style>
    
    <div class="loading-screen" id="loadingScreen">
        <div class="loading-logo">📚</div>
        <div class="loading-text">Ask Your Document</div>
        <div class="loading-spinner"></div>
        <div class="loading-dots">
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
        </div>
        <div style="margin-top: 2rem; font-size: 0.9rem; opacity: 0.8;">Initializing AI pipeline...</div>
    </div>
    
    <script>
        // Hide loading screen after initialization
        function hideLoadingScreen() {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                setTimeout(function() {
                    loadingScreen.style.display = 'none';
                }, 600);
            }
        }
        
        // Hide after Streamlit is ready (check for Streamlit elements)
        function checkStreamlitReady() {
            const streamlitElements = document.querySelectorAll('[data-testid="stAppViewContainer"]');
            if (streamlitElements.length > 0 && streamlitElements[0].children.length > 1) {
                // Streamlit has rendered content
                setTimeout(hideLoadingScreen, 500);
                return true;
            }
            return false;
        }
        
        // Check immediately
        if (checkStreamlitReady()) {
            // Already ready
        } else {
            // Poll for Streamlit to be ready
            let attempts = 0;
            const checkInterval = setInterval(function() {
                attempts++;
                if (checkStreamlitReady() || attempts > 20) {
                    clearInterval(checkInterval);
                    if (attempts > 20) {
                        // Fallback: hide after max time
                        setTimeout(hideLoadingScreen, 1000);
                    }
                }
            }, 200);
        }
        
        // Fallback: hide after maximum time
        setTimeout(hideLoadingScreen, 3000);
    </script>
    """, unsafe_allow_html=True)
elif st.session_state.get('show_loading', False):
    # Hide loading screen if it was shown
    st.markdown("""
    <script>
        (function() {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                setTimeout(function() {
                    loadingScreen.style.display = 'none';
                }, 600);
            }
        })();
    </script>
    """, unsafe_allow_html=True)
    st.session_state.show_loading = False

# Initialize MongoDB storage
if 'mongodb' not in st.session_state:
    st.session_state.mongodb = MongoDBStorage()

# Initialize all session state variables
if 'rag_pipeline' not in st.session_state:
    try:
        st.session_state.rag_pipeline = RAGPipeline()
        st.session_state.document_processed = False
        st.session_state.chat_history = []
        st.session_state.conversation_context = []  # For conversational memory
        st.session_state.answer_perspective = "normal"  # For multi-perspective answers
        # Quiz state - cleared on new quiz generation
        st.session_state.quiz_mode = False
        st.session_state.quiz_questions = None
        st.session_state.quiz_answers = {}
        st.session_state.quiz_submitted = False
        st.session_state.current_quiz_id = None
        # Initialize voice input/output states
        if 'voice_input' not in st.session_state:
            st.session_state.voice_input = False
        if 'voice_output' not in st.session_state:
            st.session_state.voice_output = False
        
        # Mark app as initialized
        st.session_state.app_initialized = True
    except Exception as e:
        st.error(f"Error initializing RAG pipeline: {str(e)}")
        st.info("""
        **Setup Required:**
        
        Please create a `.env` file with one of these options:
        
        **Option 1 - Groq (Recommended, FREE):**
        ```
        AI_PROVIDER=groq
        GROQ_API_KEY=your_key_here
        USE_LOCAL_EMBEDDINGS=true
        ```
        Get free key: https://console.groq.com/keys
        
        **Option 2 - OpenRouter (FREE):**
        ```
        AI_PROVIDER=openrouter
        OPENROUTER_API_KEY=your_key_here
        USE_LOCAL_EMBEDDINGS=true
        ```
        
        See `FREE_SETUP.md` for detailed instructions!
        """)
        st.stop()

# Title
st.title("📄 Ask Your Document")
st.markdown("Upload a document and ask questions about its content!")

# Sidebar for document upload
with st.sidebar:
    # Theme Toggle
    st.markdown("### ⚙️ Appearance")
    st.session_state.dark_mode = st.toggle("🌙 Dark Mode", value=st.session_state.get('dark_mode', False), help="Toggle between light and dark theme")
    
    st.markdown("---")
    
    st.header("📤 Upload Document")
    
    uploaded_file = st.file_uploader(
        "Choose a .txt file or drag & drop here",
        type=['txt'],
        help="Upload a text file to start asking questions. You can also drag and drop files directly onto this area.",
        accept_multiple_files=False
    )

    if uploaded_file is not None:
        # Check file size (limit to 5MB to prevent memory issues)
        file_size_mb = len(uploaded_file.getvalue()) / (1024 * 1024)
        if file_size_mb > 5:
            st.error(f"❌ File too large! Maximum size is 5MB. Your file is {file_size_mb:.2f}MB")
            st.info("💡 Tip: Split large documents into smaller files or use a text editor to reduce the size.")
        else:
            st.info(f"📄 File size: {file_size_mb:.2f}MB")
            
        if st.button("Process Document", type="primary"):
            # Create progress containers
            progress_container = st.empty()
            status_container = st.empty()
            
            try:
                with st.spinner("Reading file..."):
                    # Read file content with encoding error handling
                    try:
                        text = uploaded_file.read().decode('utf-8')
                    except UnicodeDecodeError:
                        text = uploaded_file.read().decode('utf-8', errors='ignore')
                
                # Check text length (limit to 1MB of text to prevent memory issues)
                text_size_kb = len(text.encode('utf-8')) / 1024
                if text_size_kb > 1024:  # 1MB limit
                    st.warning(f"⚠️ Large document detected ({text_size_kb:.2f}KB). Processing may take longer.")
                    st.info("💡 Tip: Very large documents will be processed in chunks. This is normal.")
                    # Don't truncate - let the chunking handle it
                
                # Process document with progress
                status_container.info("🔄 Processing document... This may take a moment.")
                result = st.session_state.rag_pipeline.process_document(
                    text, 
                    progress_callback=lambda current, total, msg: progress_container.progress(
                        current / total, 
                        text=f"{msg} ({current}/{total})"
                    ) if total > 0 else None
                )
                
                progress_container.empty()
                status_container.empty()
                
                if result['success']:
                    st.session_state.document_processed = True
                    st.session_state.document_text = text  # Store for insights
                    st.success(f"✅ {result['message']}")
                    st.session_state.chat_history = []  # Clear chat history
                    
                    # Generate document summary
                    with st.spinner("📝 Generating document summary..."):
                        try:
                            st.session_state.document_summary = st.session_state.rag_pipeline.generate_document_summary(text)
                        except Exception as e:
                            error_msg = str(e)
                            if "API_KEY" in error_msg or "not found" in error_msg:
                                st.session_state.document_summary = {
                                    "summary": "Summary could not be generated. Please configure your API keys in Streamlit Cloud secrets.",
                                    "key_points": [],
                                    "suggested_questions": []
                                }
                                st.warning("⚠️ API key not configured. Summary generation requires an API key. See deployment guide for setup instructions.")
                            else:
                                st.session_state.document_summary = {
                                    "summary": f"Summary could not be generated: {error_msg}",
                                    "key_points": [],
                                    "suggested_questions": []
                                }
                else:
                    st.error(f"❌ {result['message']}")
            except Exception as e:
                progress_container.empty()
                status_container.empty()
                st.error(f"❌ Error processing document: {str(e)}")
                st.info("💡 Try uploading a smaller file or check your internet connection if using API embeddings.")

    if st.session_state.document_processed:
        st.success("✅ Document ready!")
        
        # Action buttons
        col1, col2 = st.columns(2)
        with col1:
            if st.button("🗑️ Clear Document"):
                st.session_state.document_processed = False
                st.session_state.chat_history = []
                if 'document_summary' in st.session_state:
                    del st.session_state.document_summary
                if 'document_text' in st.session_state:
                    del st.session_state.document_text
                st.rerun()
        
        with col2:
            if st.session_state.chat_history and len(st.session_state.chat_history) > 0:
                # Export chat history - wrap in try-except to handle media file storage errors
                try:
                    chat_json = json.dumps(st.session_state.chat_history, indent=2)
                    st.download_button(
                        label="💾 Export Chat",
                        data=chat_json,
                        file_name=f"chat_history_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                        mime="application/json",
                        key=f"export_chat_{len(st.session_state.chat_history)}"  # Unique key to prevent stale references
                    )
                except Exception as e:
                    # Silently handle media file storage errors - they're usually harmless
                    # The error occurs when Streamlit tries to access old file references
                    pass
        
        # Show document summary if available
        if 'document_summary' in st.session_state and st.session_state.document_summary:
            with st.expander("📋 Document Summary", expanded=True):
                summary = st.session_state.document_summary
                summary_text = summary.get('summary', 'No summary available.')
                
                st.markdown("### Executive Summary")
                # Check if summary indicates API key issue
                if "could not be generated" in summary_text.lower() or "api key" in summary_text.lower():
                    st.warning(summary_text)
                    with st.container():
                        st.markdown("""
                        **To enable document summaries and quiz generation:**
                        
                        1. Go to your Streamlit Cloud app dashboard
                        2. Click **"Manage app"** (bottom right)
                        3. Go to **"Secrets"** tab
                        4. Add your API key:
                        ```toml
                        GROQ_API_KEY = "your_key_here"
                        ```
                        5. Get a free key at: https://console.groq.com/keys
                        6. The app will automatically redeploy
                        
                        See `DEPLOYMENT.md` for detailed instructions.
                        """)
                else:
                    st.info(summary_text)
                
                if summary.get('key_points'):
                    st.markdown("### Key Points")
                    for point in summary['key_points']:
                        st.markdown(f"- {point}")
                
                if summary.get('suggested_questions'):
                    st.markdown("### 💡 Suggested Questions")
                    for i, question in enumerate(summary['suggested_questions'], 1):
                        if st.button(f"❓ {question}", key=f"summary_q_{i}", use_container_width=True):
                            st.session_state.auto_question = question
                            st.rerun()
        
        # Document Insights
        if 'document_text' in st.session_state:
            with st.expander("📊 Document Insights"):
                text = st.session_state.document_text
                
                # Basic stats
                col1, col2, col3, col4 = st.columns(4)
                with col1:
                    st.metric("Words", f"{len(text.split()):,}")
                with col2:
                    st.metric("Characters", f"{len(text):,}")
                with col3:
                    st.metric("Sentences", f"{text.count('.') + text.count('!') + text.count('?'):,}")
                with col4:
                    reading_time = len(text.split()) / 200  # Average reading speed
                    st.metric("Reading Time", f"{reading_time:.1f} min")
                
                # Word frequency (simplified)
                words = text.lower().split()
                # Remove common words
                common_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how'}
                meaningful_words = [w.strip('.,!?;:()[]{}"\'-') for w in words if w.strip('.,!?;:()[]{}"\'-') not in common_words and len(w.strip('.,!?;:()[]{}"\'-')) > 3]
                
                from collections import Counter
                word_freq = Counter(meaningful_words)
                top_words = word_freq.most_common(10)
                
                if top_words:
                    st.markdown("### Top Keywords")
                    word_list = ", ".join([f"**{word}** ({count})" for word, count in top_words])
                    st.markdown(word_list)
                
                # Sentiment Analysis
                if 'document_sentiment' in st.session_state and st.session_state.document_sentiment:
                    sentiment = st.session_state.document_sentiment
                    st.markdown("### 📊 Sentiment Analysis")
                    col1, col2 = st.columns(2)
                    with col1:
                        sentiment_emoji = "😊" if sentiment.get('sentiment') == 'positive' else "😐" if sentiment.get('sentiment') == 'neutral' else "😟"
                        st.metric("Overall Sentiment", f"{sentiment_emoji} {sentiment.get('sentiment', 'neutral').title()}")
                    with col2:
                        score = sentiment.get('score', 50)
                        st.metric("Sentiment Score", f"{score}/100")
                    
                    if sentiment.get('themes'):
                        st.markdown("**Emotional Themes:** " + ", ".join(sentiment['themes'][:5]))
                
                # Document Personality
                if 'document_personality' in st.session_state and st.session_state.document_personality:
                    personality = st.session_state.document_personality
                    st.markdown("### 🎭 Document Personality")
                    st.info(f"**Tone:** {personality.get('tone', 'neutral').title()} | **Style:** {personality.get('style', 'descriptive').title()} | **Audience:** {personality.get('audience', 'general').title()}")
                
                # Document Heatmap
                if st.session_state.chat_history:
                    heatmap_data = st.session_state.rag_pipeline.create_document_heatmap(st.session_state.chat_history)
                    if heatmap_data.get('most_referenced'):
                        st.markdown("### 🗺️ Document Heatmap (Most Referenced Sections)")
                        st.caption("Sections referenced in your questions:")
                        for chunk_idx, count in heatmap_data['most_referenced'][:5]:
                            st.progress(count / max(heatmap_data['chunk_usage'].values()) if heatmap_data['chunk_usage'] else 0, 
                                      text=f"Chunk {chunk_idx}: Referenced {count} time(s)")
                
                # Quiz Mode
                col1, col2 = st.columns(2)
                with col1:
                    if st.button("🎯 Generate Quiz Questions"):
                        with st.spinner("Generating quiz questions..."):
                            try:
                                quiz_questions = st.session_state.rag_pipeline.generate_quiz_questions(text, num_questions=5)
                                if quiz_questions:
                                    # Clear previous quiz state
                                    st.session_state.quiz_mode = True
                                    st.session_state.quiz_questions = quiz_questions
                                    st.session_state.quiz_answers = {}
                                    st.session_state.quiz_submitted = False
                                    st.session_state.current_quiz_id = None
                                    st.rerun()
                                else:
                                    st.error("❌ Failed to generate quiz questions. Please check your API key configuration in Streamlit Cloud secrets.")
                            except Exception as e:
                                error_msg = str(e)
                                if "API_KEY" in error_msg or "not found" in error_msg:
                                    st.error("❌ API key not configured. Please set GROQ_API_KEY in Streamlit Cloud secrets. See deployment guide for instructions.")
                                else:
                                    st.error(f"❌ Error generating quiz: {error_msg}")
                with col2:
                    if st.button("📜 Quiz History"):
                        st.session_state.show_quiz_history = True
                        st.rerun()

# Quiz History View
if st.session_state.get('show_quiz_history', False):
    st.header("📜 Quiz History")
    
    if st.button("🔙 Back"):
        st.session_state.show_quiz_history = False
        st.rerun()
    
    if st.session_state.mongodb.is_connected():
        quiz_history = st.session_state.mongodb.get_quiz_history(limit=20)
        
        if quiz_history:
            for quiz in quiz_history:
                with st.expander(f"Quiz from {quiz.get('timestamp', 'Unknown date')} - Score: {quiz.get('score', 0):.1f}% ({quiz.get('correct', 0)}/{quiz.get('total', 0)})"):
                    st.markdown(f"**Document:** {quiz.get('document_name', 'Unknown')}")
                    st.markdown(f"**Date:** {quiz.get('timestamp', 'Unknown')}")
                    
                    questions = quiz.get('questions', [])
                    user_answers = quiz.get('user_answers', {})
                    
                    for i, q in enumerate(questions):
                        st.markdown(f"### Question {i+1}")
                        st.markdown(f"**{q.get('question', '')}**")
                        
                        # Handle both string and integer keys
                        user_answer_idx = user_answers.get(str(i)) or user_answers.get(i)
                        user_answer_letter = None
                        if user_answer_idx is not None:
                            option_keys = list(q.get('options', {}).keys())
                            if user_answer_idx < len(option_keys):
                                user_answer_letter = option_keys[user_answer_idx]
                        
                        is_correct = user_answer_letter == q.get('correct')
                        
                        for letter, option in q.get('options', {}).items():
                            marker = ""
                            if letter == q.get('correct'):
                                marker = "✅ Correct Answer"
                            elif letter == user_answer_letter:
                                marker = "❌ Your Answer"
                            st.markdown(f"{marker} {letter}) {option}")
                        
                        if q.get('explanation'):
                            st.info(f"**Explanation:** {q.get('explanation', '')}")
        else:
            st.info("No quiz history found.")
    else:
        # Only show warning if MongoDB was attempted but failed
        # Don't show warning if MongoDB is simply not configured
        mongodb_uri_set = os.getenv('MONGODB_URI') is not None and os.getenv('MONGODB_URI') != ''
        if mongodb_uri_set:
            error_msg = st.session_state.mongodb.connection_error or "Connection failed"
            st.warning(f"⚠️ MongoDB connection failed. Quiz history will not be saved.\n\n**Error:** {error_msg}\n\nPlease check your MONGODB_URI in the .env file.")
        # If MONGODB_URI is not set, MongoDB is optional - don't show warning

# Quiz Mode Interface
elif 'quiz_mode' in st.session_state and st.session_state.quiz_mode and st.session_state.quiz_questions:
    st.header("🎯 Document Quiz Mode")
    st.info("Test your knowledge of the document!")
    
    quiz_questions = st.session_state.quiz_questions
    quiz_answers = st.session_state.get('quiz_answers', {})
    
    # Only show questions if not submitted
    if not st.session_state.get('quiz_submitted', False):
        for i, q in enumerate(quiz_questions):
            st.markdown(f"### Question {i+1}")
            st.markdown(f"**{q.get('question', '')}**")
            
            options = q.get('options', {})
            option_keys = list(options.keys())
            option_values = list(options.values())
            
            selected_idx = st.radio(
                "Select your answer:",
                options=option_values,
                key=f"quiz_q_{i}",
                index=quiz_answers.get(i) if i in quiz_answers else None
            )
            
            if selected_idx is not None:
                quiz_answers[i] = option_values.index(selected_idx) if selected_idx in option_values else None
                st.session_state.quiz_answers = quiz_answers
        
        col1, col2 = st.columns(2)
        with col1:
            if st.button("✅ Submit Quiz"):
                # Calculate score
                correct = 0
                total = len(quiz_questions)
                for i, q in enumerate(quiz_questions):
                    user_answer_idx = quiz_answers.get(i)
                    correct_answer = q.get('correct')
                    if user_answer_idx is not None and correct_answer:
                        user_answer_letter = list(q['options'].keys())[user_answer_idx]
                        if user_answer_letter == correct_answer:
                            correct += 1
                
                score = (correct / total * 100) if total > 0 else 0
                
                # Save to MongoDB
                document_name = st.session_state.get('document_name', 'Unknown Document')
                # Convert integer keys to strings for MongoDB compatibility
                user_answers_str = {str(k): v for k, v in quiz_answers.items()}
                quiz_data = {
                    "questions": quiz_questions,
                    "user_answers": user_answers_str,
                    "score": score,
                    "correct": correct,
                    "total": total,
                    "document_name": document_name
                }
                st.session_state.quiz_score = score
                st.session_state.quiz_correct = correct
                st.session_state.quiz_total = total
                st.session_state.quiz_submitted = True
                try:
                    st.session_state.current_quiz_id = st.session_state.mongodb.save_quiz(quiz_data)
                except Exception:
                    st.session_state.current_quiz_id = None
                st.rerun()
        
        with col2:
            if st.button("🔙 Back to Chat"):
                # Clear quiz state
                st.session_state.quiz_mode = False
                st.session_state.quiz_questions = None
                st.session_state.quiz_answers = {}
                st.session_state.quiz_submitted = False
                st.rerun()
    
    # Show results after submission
    if st.session_state.get('quiz_submitted', False):
        st.success(f"🎉 Quiz Complete! Your Score: {st.session_state.quiz_score:.1f}% ({st.session_state.quiz_correct}/{st.session_state.quiz_total})")
        
        if st.session_state.current_quiz_id:
            st.caption("✅ Quiz saved to history")
        
        # Show answers
        for i, q in enumerate(quiz_questions):
            user_answer_idx = quiz_answers.get(i)
            user_answer_letter = list(q['options'].keys())[user_answer_idx] if user_answer_idx is not None else None
            is_correct = user_answer_letter == q.get('correct')
            
            with st.expander(f"Question {i+1} - {'✅ Correct' if is_correct else '❌ Incorrect'}"):
                st.markdown(f"**{q.get('question', '')}**")
                for letter, option in q.get('options', {}).items():
                    marker = ""
                    if letter == q.get('correct'):
                        marker = "✅ Correct Answer"
                    elif letter == user_answer_letter:
                        marker = "❌ Your Answer"
                    st.markdown(f"{marker} {letter}) {option}")
                if q.get('explanation'):
                    st.info(f"**Explanation:** {q.get('explanation', '')}")
        
        col1, col2 = st.columns(2)
        with col1:
            if st.button("🔄 New Quiz"):
                # Clear quiz state for new quiz
                st.session_state.quiz_mode = False
                st.session_state.quiz_questions = None
                st.session_state.quiz_answers = {}
                st.session_state.quiz_submitted = False
                st.session_state.current_quiz_id = None
                st.rerun()
        with col2:
            if st.button("📜 View History"):
                st.session_state.show_quiz_history = True
                st.rerun()

# Main chat interface
elif not st.session_state.document_processed:
    st.info("👈 Please upload and process a document in the sidebar to start asking questions.")
else:
    # Initialize settings variables if not exists
    if 'answer_perspective' not in st.session_state:
        st.session_state.answer_perspective = "normal"
    if 'show_thoughts' not in st.session_state:
        st.session_state.show_thoughts = False
    if 'show_chunk_viz' not in st.session_state:
        st.session_state.show_chunk_viz = False
    
    # Settings panel
    with st.expander("⚙️ Settings", expanded=False):
        col1, col2 = st.columns(2)
        with col1:
            perspective_index = {
                "normal": 0,
                "eli5": 1,
                "expert": 2,
                "lawyer": 3,
                "poet": 4
            }.get(st.session_state.answer_perspective, 0)
            
            st.session_state.answer_perspective = st.selectbox(
                "Answer Perspective",
                ["normal", "eli5", "expert", "lawyer", "poet"],
                index=perspective_index
            )
        with col2:
            st.session_state.show_thoughts = st.checkbox("💭 Show AI Thoughts", value=st.session_state.show_thoughts)
            st.session_state.show_chunk_viz = st.checkbox("🔍 Show Chunking Visualization", value=st.session_state.show_chunk_viz)
    
    # Show chunking visualization if enabled
    if st.session_state.show_chunk_viz and st.session_state.document_processed:
        chunk_info = st.session_state.rag_pipeline.get_chunk_visualization()
        with st.expander("🔍 Document Chunking Info", expanded=False):
            st.metric("Total Chunks", chunk_info.get('total_chunks', 0))
            st.info(f"Chunk Size: {chunk_info.get('chunk_size', 1500)} characters")
            st.info(f"Overlap: {chunk_info.get('chunk_overlap', 300)} characters")
    
    # Display chat history
    st.header("💬 Chat")
    
    for msg_idx, message in enumerate(st.session_state.chat_history):
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
            
            # Show sources if available with improved citation display
            if message["role"] == "assistant" and "sources" in message and message["sources"]:
                with st.expander("📚 View Sources & Citations", expanded=False):
                    for i, source in enumerate(message["sources"], 1):
                        similarity = source.get('similarity', 'N/A')
                        similarity_num = similarity if isinstance(similarity, (int, float)) else 0
                        
                        # Color code by similarity
                        if isinstance(similarity_num, (int, float)):
                            if similarity_num >= 70:
                                sim_color = "🟢"
                            elif similarity_num >= 50:
                                sim_color = "🟡"
                            else:
                                sim_color = "🔴"
                        else:
                            sim_color = "⚪"
                        
                        st.markdown(f"**{sim_color} Source {i}** - Similarity: {similarity}%")
                        
                        # Show exact quote with context
                        source_text = source.get('text', '')
                        if source_text:
                            # Highlight the most relevant part (first 200 chars as "quote")
                            quote = source_text[:200] + "..." if len(source_text) > 200 else source_text
                            
                            st.markdown("**Exact Quote:**")
                            st.markdown(f'<div class="citation-box">{quote}</div>', unsafe_allow_html=True)
                            
                            # Show full chunk
                            with st.container():
                                st.text_area(
                                    f"Full text",
                                    source_text,
                                    height=150,
                                    key=f"full_source_{msg_idx}_{i}_{source.get('chunk_index', i)}",
                                    disabled=True
                                )

                        if i < len(message["sources"]):
                            st.markdown("---")

    # Always show chat input (it will be available for follow-up questions)
    # Handle auto-question from follow-up button click or suggested questions
    auto_prompt = None
    if 'auto_question' in st.session_state:
        # Get the auto question
        auto_prompt = st.session_state.auto_question
        del st.session_state.auto_question  # Clear it immediately
    
    # Speech-to-Text and Text-to-Speech controls
    col1, col2 = st.columns([4, 1])
    with col1:
        # Check for voice transcript from previous interaction
        voice_text_input = None
        if 'voice_transcript' in st.session_state:
            voice_text_input = st.session_state.voice_transcript
            del st.session_state.voice_transcript
        
        user_prompt = st.chat_input("Ask a question about your document...", key="chat_input_main")
        
        # If we have voice text, use it as the prompt
        if voice_text_input and not user_prompt:
            user_prompt = voice_text_input
    with col2:
        use_voice_input = st.checkbox("🎤 Voice", key="voice_input")
    
    # Speech-to-Text using browser API - inject into chat input
    if use_voice_input:
        st.markdown("""
        <div style="margin-bottom: 10px;">
            <button id="start-recording" style="padding: 10px 20px; background: #1f77b4; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; width: 100%;">
                🎤 Click to Record Voice
            </button>
            <p id="transcription" style="margin-top: 10px; font-weight: bold; color: #28a745;"></p>
        </div>
        <script>
            (function() {
                // Wait for DOM to be ready
                function initVoiceRecognition() {
                    const button = document.getElementById('start-recording');
                    if (!button) {
                        setTimeout(initVoiceRecognition, 100);
                        return;
                    }
                    
                    let recognition = null;
                    let isRecording = false;
                    
                    function startVoiceRecognition() {
                        if (isRecording && recognition) {
                            recognition.stop();
                            isRecording = false;
                            button.innerHTML = '🎤 Click to Record Voice';
                            return;
                        }
                        
                        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                            const transcription = document.getElementById('transcription');
                            if (transcription) {
                                transcription.innerHTML = '<span style="color: red;">Speech recognition not supported in this browser.</span>';
                            }
                            return;
                        }
                        
                        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                        recognition = new SpeechRecognition();
                        recognition.continuous = false;
                        recognition.interimResults = false;
                        recognition.lang = 'en-US';
                        
                        recognition.onresult = function(event) {
                            const transcript = event.results[0][0].transcript.trim();
                            const transcription = document.getElementById('transcription');
                            if (transcription) {
                                transcription.innerHTML = '<strong>✓ You said:</strong> ' + transcript;
                            }
                            
                            // Store transcript and trigger Streamlit rerun
                            // Use window.location to pass data to Streamlit
                            const url = new URL(window.location);
                            url.searchParams.set('voice_text', encodeURIComponent(transcript));
                            window.location.href = url.toString();
                        };
                        
                        recognition.onerror = function(event) {
                            const transcription = document.getElementById('transcription');
                            if (transcription) {
                                transcription.innerHTML = '<span style="color: red;">Error: ' + event.error + '</span>';
                            }
                            button.innerHTML = '🎤 Click to Record Voice';
                            button.disabled = false;
                            isRecording = false;
                        };
                        
                        recognition.onend = function() {
                            button.innerHTML = '🎤 Click to Record Voice';
                            button.disabled = false;
                            isRecording = false;
                        };
                        
                        try {
                            recognition.start();
                            isRecording = true;
                            button.innerHTML = '🎤 Listening... (Click to stop)';
                            button.disabled = false;
                        } catch (e) {
                            const transcription = document.getElementById('transcription');
                            if (transcription) {
                                transcription.innerHTML = '<span style="color: red;">Error starting recognition. Please try again.</span>';
                            }
                            isRecording = false;
                        }
                    }
                    
                    // Remove any existing listeners
                    button.replaceWith(button.cloneNode(true));
                    const newButton = document.getElementById('start-recording');
                    newButton.addEventListener('click', startVoiceRecognition);
                }
                
                // Initialize when DOM is ready
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', initVoiceRecognition);
                } else {
                    initVoiceRecognition();
                }
                
                // Also try after a short delay to ensure Streamlit has rendered
                setTimeout(initVoiceRecognition, 500);
            })();
        </script>
        """, unsafe_allow_html=True)
    
    # Check for voice transcript from URL query params (from voice input)
    query_params = st.query_params.to_dict() if hasattr(st.query_params, 'to_dict') else dict(st.query_params)
    voice_text_from_url = None
    if 'voice_text' in query_params:
        voice_text_from_url = query_params['voice_text']
        # Clear the query param to avoid reprocessing
        st.query_params.clear()
    
    # Use auto_prompt if available, then voice_text_from_url, then user_prompt
    prompt = auto_prompt if auto_prompt else (voice_text_from_url if voice_text_from_url else user_prompt)
    
    # Process the question (either from input, auto-question, or voice input)
    if prompt and prompt.strip():  # Ensure prompt is not empty
        # Simple duplicate check: only skip if we JUST processed this exact question
        should_process = True
        if st.session_state.chat_history and len(st.session_state.chat_history) >= 2:
            # Check if last message is user message with same content
            last_msg = st.session_state.chat_history[-1]
            if (last_msg.get("role") == "user" and 
                last_msg.get("content") == prompt.strip()):
                # Check if there's already an assistant response right before it
                prev_msg = st.session_state.chat_history[-2]
                if prev_msg.get("role") == "assistant":
                    # Already fully processed, skip to avoid duplicate
                    should_process = False
        
        if should_process:
        # Add user message to history
            user_message = {"role": "user", "content": prompt}
            st.session_state.chat_history.append(user_message)
            
            # Save to MongoDB
            document_name = st.session_state.get('document_name', 'Unknown Document')
            user_message["document_name"] = document_name
            st.session_state.mongodb.save_chat_message(user_message)
        
        # Display user message
        with st.chat_message("user"):
            st.markdown(prompt)
        
            # Get answer with enhanced features
        with st.chat_message("assistant"):
                # Animated loading states
                loading_steps = [
                    "🔍 Searching document...",
                    "📚 Finding relevant sections...",
                    "🧠 Analyzing context...",
                    "✍️ Generating answer..."
                ]
                
                loading_container = st.empty()
                for i, step in enumerate(loading_steps):
                    loading_container.markdown(f'<div class="loading-step">{step}</div>', unsafe_allow_html=True)
                    import time
                    time.sleep(0.3)  # Small delay for animation effect
                
                # Get conversation context for memory
                recent_context = []
                if st.session_state.chat_history:
                    for msg in st.session_state.chat_history[-4:]:  # Last 4 messages
                        if msg.get("role") == "user":
                            recent_context.append({"question": msg.get("content")})
                        elif msg.get("role") == "assistant":
                            recent_context.append({"answer": msg.get("content")})
                
                # Get settings with defaults
                perspective = st.session_state.get('answer_perspective', 'normal')
                show_thoughts_flag = st.session_state.get('show_thoughts', False)
                
                # Adjust perspective based on document personality if available
                if 'document_personality' in st.session_state and perspective == "normal":
                    personality = st.session_state.document_personality
                    # Auto-adjust to match document style
                    if personality.get('formality') == 'very formal' or personality.get('formality') == 'formal':
                        perspective = "expert"  # More formal responses
                    elif personality.get('tone') == 'casual' or personality.get('tone') == 'friendly':
                        perspective = "normal"  # Keep normal for casual docs
                
                # Clarification questions removed - proceed directly to answer
                
                # Check if document is processed before answering
                if not st.session_state.get('document_processed', False):
                    loading_container.empty()
                    st.error("❌ Please upload and process a document first!")
                    st.info("💡 Go to the sidebar and upload a document to get started.")
                    st.stop()
                
                # Ensure RAG pipeline is initialized
                if 'rag_pipeline' not in st.session_state:
                    loading_container.empty()
                    st.error("❌ RAG pipeline not initialized. Please refresh the page.")
                    st.stop()
                
                try:
                    result = st.session_state.rag_pipeline.answer_question(
                        prompt, 
                        include_sources=True,
                        conversation_context=recent_context,
                        perspective=perspective,
                        show_thoughts=show_thoughts_flag
                    )
                
                    # Ensure result has an answer
                    if not result or 'answer' not in result or not result.get('answer'):
                        loading_container.empty()
                        st.error("❌ Failed to generate answer. The RAG pipeline returned an empty result.")
                        st.info("💡 Try rephrasing your question or check if the document was processed correctly.")
                        st.stop()
                        
                except Exception as e:
                    loading_container.empty()
                    st.error(f"❌ Error generating answer: {str(e)}")
                    import traceback
                    with st.expander("🔍 Error Details"):
                        st.code(traceback.format_exc())
                    st.stop()
                
                loading_container.empty()
                
                # Show thought bubbles if enabled
                if result.get('thoughts'):
                    for thought in result['thoughts']:
                        st.markdown(f'<div class="thought-bubble">{thought}</div>', unsafe_allow_html=True)
                
                # Display answer - ensure it's always shown
                answer_text = result.get("answer", "")
                if answer_text:
                    st.markdown(answer_text)
                else:
                    st.warning("⚠️ No answer was generated. Please try again.")
                
                # Text-to-Speech button - Always show after answer
                if answer_text:
                    # Clean and escape text for JavaScript
                    import re
                    # Remove markdown formatting for cleaner speech
                    clean_text = answer_text
                    # Remove markdown links [text](url) -> text
                    clean_text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', clean_text)
                    # Remove markdown bold/italic
                    clean_text = re.sub(r'\*\*([^\*]+)\*\*', r'\1', clean_text)
                    clean_text = re.sub(r'\*([^\*]+)\*', r'\1', clean_text)
                    # Remove code blocks
                    clean_text = re.sub(r'```[^`]*```', '', clean_text)
                    clean_text = re.sub(r'`([^`]+)`', r'\1', clean_text)
                    # Remove extra whitespace
                    clean_text = ' '.join(clean_text.split())
                    
                    # Escape for JavaScript template literal
                    escaped_text = clean_text.replace('\\', '\\\\').replace('`', '\\`').replace('$', '\\$').replace('{', '\\{').replace('}', '\\}')
                    
                    # Generate unique ID for this button
                    button_id = f"tts_button_{len(st.session_state.chat_history)}"
                    
                    st.markdown(f"""
                        <div style="margin-top: 15px; margin-bottom: 10px;">
                            <button id="{button_id}" onclick="speakText_{button_id}()" style="padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s;">
                                🔊 Listen to Answer
                            </button>
                        </div>
                        <script>
                            function speakText_{button_id}() {{
                                const button = document.getElementById('{button_id}');
                                const text = `{escaped_text}`;
                                
                                if (!('speechSynthesis' in window)) {{
                                    alert('Text-to-speech not supported in this browser.');
                                    return;
                                }}
                                
                                // Stop any ongoing speech
                                window.speechSynthesis.cancel();
                                
                                const utterance = new SpeechSynthesisUtterance(text);
                                utterance.lang = 'en-US';
                                utterance.rate = 0.9;
                                utterance.pitch = 1.0;
                                utterance.volume = 1.0;
                                
                                utterance.onstart = function() {{
                                    button.innerHTML = '🔊 Speaking...';
                                    button.disabled = true;
                                    button.style.opacity = '0.7';
                                }};
                                
                                utterance.onend = function() {{
                                    button.innerHTML = '🔊 Listen to Answer';
                                    button.disabled = false;
                                    button.style.opacity = '1';
                                }};
                                
                                utterance.onerror = function(event) {{
                                    button.innerHTML = '🔊 Listen to Answer';
                                    button.disabled = false;
                                    button.style.opacity = '1';
                                    console.error('Speech synthesis error:', event.error);
                                }};
                                
                                window.speechSynthesis.speak(utterance);
                            }}
                        </script>
                        """, unsafe_allow_html=True)
                
                # Show confidence and verification
                confidence = result.get('confidence', 0)
                if confidence >= 70:
                    conf_class = "confidence-high"
                elif confidence >= 50:
                    conf_class = "confidence-medium"
                else:
                    conf_class = "confidence-low"
                
                verification = result.get('verification', {})
                if verification.get('consistent'):
                    st.success(f"✅ Verified: {verification.get('message', 'Answer is consistent with document')}")
                else:
                    st.warning(f"⚠️ {verification.get('message', 'Answer may need verification')}")
                
                st.markdown(f'<p class="{conf_class}">Confidence: {confidence}%</p>', unsafe_allow_html=True)
                
                # Query rewriting for low confidence
                if confidence < 50:
                    rewritten_queries = st.session_state.rag_pipeline.rewrite_query(prompt, confidence)
                    if rewritten_queries:
                        st.markdown("---")
                        st.markdown("### 💡 Try rephrasing your question:")
                        for i, rewritten in enumerate(rewritten_queries):
                            if st.button(f"🔄 {rewritten[:70]}..." if len(rewritten) > 70 else f"🔄 {rewritten}", 
                                       key=f"rewrite_{len(st.session_state.chat_history)}_{i}"):
                                # Add rewritten question to auto_question for next iteration
                                st.session_state.auto_question = rewritten
                                st.rerun()
                
                # Generate and display follow-up questions (always show, not just for low confidence)
                followup_questions = st.session_state.rag_pipeline.generate_followup_questions(
                    prompt, 
                    result["answer"]
                )
                
                if followup_questions:
                    st.markdown("---")
                    st.markdown("### 💡 You might also want to ask:")
                    # Create columns for better layout
                    cols = st.columns(min(3, len(followup_questions)))
                    for idx, question in enumerate(followup_questions):
                        col_idx = idx % len(cols)
                        with cols[col_idx]:
                            if st.button(f"❓ {question[:60]}..." if len(question) > 60 else f"❓ {question}", 
                                       key=f"followup_{len(st.session_state.chat_history)}_{idx}",
                                       use_container_width=True):
                                # Set auto-question for next rerun
                                st.session_state.auto_question = question
                                st.rerun()
                
                # Add to history with sources (always, regardless of followup questions)
                assistant_message = {
                    "role": "assistant",
                    "content": result["answer"],
                    "sources": result.get("sources", []),
                    "confidence": result.get("confidence", 0),
                    "followup_questions": followup_questions,
                    "verification": result.get("verification", {}),
                    "chunks_used": result.get("chunks_used", 0)
                }
                st.session_state.chat_history.append(assistant_message)
                
                # Save to MongoDB
                document_name = st.session_state.get('document_name', 'Unknown Document')
                assistant_message["document_name"] = document_name
                st.session_state.mongodb.save_chat_message(assistant_message)
                
                # Update conversation context for memory
                st.session_state.conversation_context.append({
                    "question": prompt,
                    "answer": result["answer"]
                })
                # Keep only last 10 exchanges
                if len(st.session_state.conversation_context) > 10:
                    st.session_state.conversation_context = st.session_state.conversation_context[-10:]

