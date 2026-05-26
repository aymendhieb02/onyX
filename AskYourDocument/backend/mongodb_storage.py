"""MongoDB storage for quiz and chat history."""

import os
import logging
from typing import List, Dict, Optional
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import uuid

# Suppress PyMongo connection warnings and errors
logging.getLogger("pymongo").setLevel(logging.CRITICAL)
logging.getLogger("pymongo.serverSelection").setLevel(logging.CRITICAL)
logging.getLogger("pymongo.connection").setLevel(logging.CRITICAL)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Try to import certifi for SSL certificate handling
try:
    import certifi
    CERTIFI_AVAILABLE = True
except ImportError:
    CERTIFI_AVAILABLE = False


class MongoDBStorage:
    """Manages MongoDB storage for quiz and chat history."""

    def __init__(self):
        """Initialize MongoDB connection."""
        self.mongo_uri = os.getenv('MONGODB_URI', '')
        self.db_name = os.getenv('MONGODB_DB_NAME', 'ask_your_document')
        self.client = None
        self.db = None
        self.connection_error = None
        self.connection_failed = False  # Flag to prevent repeated connection attempts
        # Only try to connect if MONGODB_URI is explicitly set
        # This allows the app to run without MongoDB if not configured
        if self.mongo_uri:
            self._connect()
        else:
            # MongoDB not configured - this is OK, app will work without it
            # Don't print warnings, just silently work without MongoDB
            pass

    def _connect(self):
        """Establish MongoDB connection."""
        # If connection already failed, don't try again
        if self.connection_failed:
            return
            
        try:
            # Check if using MongoDB Atlas
            is_atlas = "mongodb+srv://" in self.mongo_uri
            
            if is_atlas:
                # MongoDB Atlas connection settings
                # For mongodb+srv://, PyMongo automatically handles TLS/SSL
                # Explicitly configure TLS for better compatibility
                connection_kwargs = {
                    "serverSelectionTimeoutMS": 10000,  # Increased timeout for SSL handshake
                    "connectTimeoutMS": 10000,
                    "socketTimeoutMS": 10000,
                    "retryWrites": True,
                    "w": 'majority',
                    "tls": True,  # Explicitly enable TLS
                    "tlsAllowInvalidCertificates": False,  # Require valid certificates
                }
                
                # Use certifi if available for better SSL certificate handling
                if CERTIFI_AVAILABLE:
                    connection_kwargs["tlsCAFile"] = certifi.where()
                
                self.client = MongoClient(
                    self.mongo_uri,
                    **connection_kwargs
                )
            else:
                # Local MongoDB connection settings
                self.client = MongoClient(
                    self.mongo_uri,
                    serverSelectionTimeoutMS=5000,
                    connectTimeoutMS=5000,
                    socketTimeoutMS=5000,
                    directConnection=False
                )
            
            # Test connection with shorter timeout
            try:
                self.client.admin.command('ping', serverSelectionTimeoutMS=5000)
            except Exception as ping_error:
                # Silently fail - don't print errors
                raise ping_error
            
            self.db = self.client[self.db_name]
            
            # Test with a simple operation
            try:
                collections = self.db.list_collection_names()
                # Only print success message once, silently handle failures
            except Exception as test_error:
                raise test_error
            
            # Create indexes silently
            try:
                self.db.quiz_history.create_index([("timestamp", -1)])
                self.db.chat_history.create_index([("timestamp", -1)])
            except Exception:
                # Index creation is non-critical, fail silently
                pass
                
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            # Mark as failed to prevent future attempts
            self.connection_failed = True
            # Store error but don't print to avoid cluttering console
            error_str = str(e).lower()
            if "ssl" in error_str or "tls" in error_str or "handshake" in error_str:
                # SSL/TLS handshake error - provide helpful troubleshooting
                self.connection_error = f"SSL/TLS handshake failed"
                if "mongodb+srv://" in self.mongo_uri:
                    troubleshooting = "\n\nTroubleshooting steps:\n\n"
                    troubleshooting += "1. **Check Network Access in MongoDB Atlas:**\n"
                    troubleshooting += "   • Go to MongoDB Atlas → Network Access\n"
                    troubleshooting += "   • Click 'Add IP Address'\n"
                    troubleshooting += "   • Add your current IP or use 0.0.0.0/0 (for testing only)\n"
                    troubleshooting += "   • Wait 1-2 minutes for changes to propagate\n\n"
                    troubleshooting += "2. **Verify Connection String Format:**\n"
                    troubleshooting += "   • Format: mongodb+srv://username:password@cluster.mongodb.net/dbname\n"
                    troubleshooting += "   • URL-encode special characters in password (!@#$%^&*())\n"
                    troubleshooting += "   • Example: password 'p@ss!word' becomes 'p%40ss%21word'\n\n"
                    troubleshooting += "3. **Update SSL Certificates:**\n"
                    if not CERTIFI_AVAILABLE:
                        troubleshooting += "   • Run: pip install certifi\n"
                    troubleshooting += "   • Run: pip install --upgrade certifi pymongo\n\n"
                    troubleshooting += "4. **Check Firewall/Antivirus:**\n"
                    troubleshooting += "   • Temporarily disable to test if blocking SSL connections\n"
                    troubleshooting += "   • Add exception for Python/Streamlit\n\n"
                    troubleshooting += "5. **Test Connection String:**\n"
                    troubleshooting += "   • Verify it works in MongoDB Compass or MongoDB Shell\n"
                    troubleshooting += "   • Check if connection string has expired (some Atlas clusters expire)"
                    self.connection_error += troubleshooting
            else:
                self.connection_error = str(e)
                if "mongodb+srv://" in self.mongo_uri:
                    self.connection_error = f"Atlas connection failed. Check Network Access settings."
            self.client = None
            self.db = None
        except Exception as e:
            # Mark as failed to prevent future attempts
            self.connection_failed = True
            error_msg = str(e).lower()
            # Store error for debugging but don't print
            if "authentication" in error_msg or "bad auth" in error_msg:
                self.connection_error = "Authentication failed - check username/password in MONGODB_URI"
            elif "dns" in error_msg:
                self.connection_error = "DNS resolution failed - check cluster URL in MONGODB_URI"
            elif "ssl" in error_msg or "tls" in error_msg:
                self.connection_error = f"SSL/TLS error. Check Network Access in MongoDB Atlas and verify connection string."
            else:
                self.connection_error = "Connection failed"
            self.client = None
            self.db = None

    def is_connected(self) -> bool:
        """Check if MongoDB is connected."""
        # If connection already failed, don't try again
        if self.connection_failed:
            return False
        if self.client is None or self.db is None:
            return False
        # Verify connection is still alive (but don't print errors)
        try:
            self.client.admin.command('ping', serverSelectionTimeoutMS=2000)
            return True
        except Exception:
            # Connection lost, reset and mark as failed
            self.connection_failed = True
            self.client = None
            self.db = None
            return False

    def save_quiz(self, quiz_data: Dict, user_id: Optional[str] = None) -> Optional[str]:
        """Save quiz to MongoDB.
        
        Args:
            quiz_data: Dictionary containing quiz questions, answers, score, etc.
            user_id: Optional user ID for user-specific storage.
            
        Returns:
            Quiz ID if successful, None otherwise.
        """
        if not self.is_connected():
            return None
        
        try:
            quiz_id = str(uuid.uuid4())
            quiz_doc = {
                "_id": quiz_id,
                "timestamp": datetime.utcnow(),
                "questions": quiz_data.get("questions", []),
                "user_answers": quiz_data.get("user_answers", {}),
                "score": quiz_data.get("score", 0),
                "correct": quiz_data.get("correct", 0),
                "total": quiz_data.get("total", 0),
                "document_name": quiz_data.get("document_name", "Unknown"),
                "user_id": user_id  # Add user_id for user-specific storage
            }
            self.db.quiz_history.insert_one(quiz_doc)
            return quiz_id
        except Exception:
            # Silently fail - MongoDB is optional
            return None

    def get_quiz_history(self, limit: int = 10, user_id: Optional[str] = None) -> List[Dict]:
        """Get quiz history from MongoDB.
        
        Args:
            limit: Maximum number of quizzes to retrieve.
            user_id: Optional user ID to filter by user.
            
        Returns:
            List of quiz documents.
        """
        if not self.is_connected():
            return []
        
        try:
            query = {}
            if user_id:
                query["user_id"] = user_id
            
            quizzes = list(self.db.quiz_history.find(query).sort("timestamp", -1).limit(limit))
            # Convert ObjectId to string and datetime to ISO format
            for quiz in quizzes:
                quiz["_id"] = str(quiz["_id"])
                quiz["timestamp"] = quiz["timestamp"].isoformat()
            return quizzes
        except Exception:
            # Silently fail - MongoDB is optional
            return []

    def get_quiz_by_id(self, quiz_id: str) -> Optional[Dict]:
        """Get a specific quiz by ID.
        
        Args:
            quiz_id: Quiz ID.
            
        Returns:
            Quiz document or None.
        """
        if not self.is_connected():
            return None
        
        try:
            quiz = self.db.quiz_history.find_one({"_id": quiz_id})
            if quiz:
                quiz["_id"] = str(quiz["_id"])
                quiz["timestamp"] = quiz["timestamp"].isoformat()
            return quiz
        except Exception:
            # Silently fail - MongoDB is optional
            return None

    def save_chat_message(self, message: Dict, user_id: Optional[str] = None) -> Optional[str]:
        """Save a chat message to MongoDB.
        
        Args:
            message: Dictionary containing role, content, sources, etc.
            user_id: Optional user ID for user-specific storage.
            
        Returns:
            Message ID if successful, None otherwise.
        """
        if not self.is_connected():
            return None
        
        try:
            message_id = str(uuid.uuid4())
            message_doc = {
                "_id": message_id,
                "timestamp": datetime.utcnow(),
                "role": message.get("role"),
                "content": message.get("content"),
                "sources": message.get("sources", []),
                "confidence": message.get("confidence"),
                "document_name": message.get("document_name", "Unknown"),
                "user_id": user_id  # Add user_id for user-specific storage
            }
            self.db.chat_history.insert_one(message_doc)
            return message_id
        except Exception:
            # Silently fail - MongoDB is optional
            return None

    def get_chat_history(self, limit: int = 50, user_id: Optional[str] = None) -> List[Dict]:
        """Get chat history from MongoDB.
        
        Args:
            limit: Maximum number of messages to retrieve.
            user_id: Optional user ID to filter by user.
            
        Returns:
            List of chat messages.
        """
        if not self.is_connected():
            return []
        
        try:
            query = {}
            if user_id:
                query["user_id"] = user_id
            
            messages = list(self.db.chat_history.find(query).sort("timestamp", -1).limit(limit))
            # Convert ObjectId to string and datetime to ISO format
            for msg in messages:
                msg["_id"] = str(msg["_id"])
                msg["timestamp"] = msg["timestamp"].isoformat()
            return messages
        except Exception:
            # Silently fail - MongoDB is optional
            return []

    def clear_quiz_history(self) -> bool:
        """Clear all quiz history.
        
        Returns:
            True if successful, False otherwise.
        """
        if not self.is_connected():
            return False
        
        try:
            self.db.quiz_history.delete_many({})
            return True
        except Exception:
            # Silently fail - MongoDB is optional
            return False

    def clear_chat_history(self) -> bool:
        """Clear all chat history.
        
        Returns:
            True if successful, False otherwise.
        """
        if not self.is_connected():
            return False
        
        try:
            self.db.chat_history.delete_many({})
            return True
        except Exception:
            # Silently fail - MongoDB is optional
            return False

    def close(self):
        """Close MongoDB connection."""
        if self.client:
            self.client.close()

