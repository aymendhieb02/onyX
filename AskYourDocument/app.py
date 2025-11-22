"""Streamlit frontend for Ask Your Document."""

import streamlit as st
import sys
import os
from datetime import datetime
import json

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.rag_pipeline import RAGPipeline

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

# Theme toggle in sidebar
with st.sidebar:
    st.session_state.dark_mode = st.toggle("🌙 Dark Mode", value=st.session_state.get('dark_mode', False))

# Custom CSS for better styling with dark mode support
dark_mode_css = """
    [data-testid="stAppViewContainer"] {
        background-color: #0e1117;
        color: #fafafa;
    }
    .stMarkdown {
        color: #fafafa;
    }
    .citation-box {
        background-color: #1e1e1e;
        color: #fafafa;
    }
""" if st.session_state.dark_mode else ""

st.markdown(f"""
<style>
    .main-header {{
        font-size: 2.5rem;
        font-weight: bold;
        color: #1f77b4;
        margin-bottom: 1rem;
    }}
    .stButton>button {{
        border-radius: 8px;
        transition: all 0.3s;
    }}
    .stButton>button:hover {{
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }}
    .citation-box {{
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 8px;
        border-left: 4px solid #1f77b4;
        margin: 0.5rem 0;
    }}
    .confidence-high {{
        color: #28a745;
        font-weight: bold;
    }}
    .confidence-medium {{
        color: #ffc107;
        font-weight: bold;
    }}
    .confidence-low {{
        color: #dc3545;
        font-weight: bold;
    }}
    .thought-bubble {{
        background-color: #e3f2fd;
        padding: 1rem;
        border-radius: 20px;
        margin: 0.5rem 0;
        border-left: 4px solid #2196f3;
        font-style: italic;
        animation: fadeIn 0.5s;
    }}
    @keyframes fadeIn {{
        from {{ opacity: 0; }}
        to {{ opacity: 1; }}
    }}
    .loading-step {{
        padding: 0.5rem;
        margin: 0.25rem 0;
        border-left: 3px solid #1f77b4;
        animation: slideIn 0.3s;
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
    }}
    .perspective-active {{
        background-color: #1f77b4;
        color: white;
    }}
    {dark_mode_css}
</style>
""", unsafe_allow_html=True)

# Initialize all session state variables
if 'rag_pipeline' not in st.session_state:
    try:
        st.session_state.rag_pipeline = RAGPipeline()
        st.session_state.document_processed = False
        st.session_state.chat_history = []
        st.session_state.conversation_context = []  # For conversational memory
        st.session_state.answer_perspective = "normal"  # For multi-perspective answers
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
    st.header("📤 Upload Document")
    
    uploaded_file = st.file_uploader(
        "Choose a .txt file",
        type=['txt'],
        help="Upload a text file to start asking questions"
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
                            st.session_state.document_summary = st.session_state.rag_pipeline.generate_document_summary(text)
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
            if st.session_state.chat_history:
                # Export chat history
                chat_json = json.dumps(st.session_state.chat_history, indent=2)
                st.download_button(
                    label="💾 Export Chat",
                    data=chat_json,
                    file_name=f"chat_history_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                    mime="application/json"
                )
        
        # Show document summary if available
        if 'document_summary' in st.session_state and st.session_state.document_summary:
            with st.expander("📋 Document Summary", expanded=True):
                summary = st.session_state.document_summary
                
                st.markdown("### Executive Summary")
                st.info(summary.get('summary', 'No summary available.'))
                
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

# Main chat interface
if not st.session_state.document_processed:
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
                            with st.expander(f"📄 View Full Chunk {source.get('chunk_index', i)}"):
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
    
    # Get input from chat input field (always available)
    user_prompt = st.chat_input("Ask a question about your document...")
    
    # Use auto_prompt if available, otherwise use user_prompt
    prompt = auto_prompt if auto_prompt else user_prompt
    
    # Process the question (either from input or auto-question)
    if prompt:
        # Add user message to history
        st.session_state.chat_history.append({"role": "user", "content": prompt})
        
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
            
            result = st.session_state.rag_pipeline.answer_question(
                prompt, 
                include_sources=True,
                conversation_context=recent_context,
                perspective=perspective,
                show_thoughts=show_thoughts_flag
            )
            
            loading_container.empty()
            
            # Show thought bubbles if enabled
            if result.get('thoughts'):
                for thought in result['thoughts']:
                    st.markdown(f'<div class="thought-bubble">{thought}</div>', unsafe_allow_html=True)
            
            # Display answer
            st.markdown(result["answer"])
            
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
                            # Don't rerun immediately - let user see the current answer first
                            # The question will be processed on next interaction
                
                # Generate and display follow-up questions
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
                
                # Add to history with sources
                st.session_state.chat_history.append({
                    "role": "assistant",
                    "content": result["answer"],
                    "sources": result.get("sources", []),
                    "confidence": result.get("confidence", 0),
                    "followup_questions": followup_questions,
                    "verification": result.get("verification", {}),
                    "chunks_used": result.get("chunks_used", 0)
                })
                
                # Update conversation context for memory
                st.session_state.conversation_context.append({
                    "question": prompt,
                    "answer": result["answer"]
                })
                # Keep only last 10 exchanges
                if len(st.session_state.conversation_context) > 10:
                    st.session_state.conversation_context = st.session_state.conversation_context[-10:]

