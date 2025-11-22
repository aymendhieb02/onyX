"""MongoDB storage for quiz and chat history."""

import os
from typing import List, Dict, Optional
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import uuid

load_dotenv()


class MongoDBStorage:
    """Manages MongoDB storage for quiz and chat history."""

    def __init__(self):
        """Initialize MongoDB connection."""
        self.mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
        self.db_name = os.getenv('MONGODB_DB_NAME', 'ask_your_document')
        self.client = None
        self.db = None
        self._connect()

    def _connect(self):
        """Establish MongoDB connection."""
        try:
            # Check if using MongoDB Atlas
            is_atlas = "mongodb+srv://" in self.mongo_uri
            
            if is_atlas:
                # MongoDB Atlas connection settings
                self.client = MongoClient(
                    self.mongo_uri,
                    serverSelectionTimeoutMS=10000,
                    connectTimeoutMS=10000,
                    socketTimeoutMS=10000,
                    retryWrites=True,
                    w='majority'
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
            
            # Test connection
            try:
                self.client.admin.command('ping')
            except Exception as ping_error:
                error_msg = str(ping_error).lower()
                if "wire version" in error_msg or "configuration" in error_msg:
                    print(f"[WARNING] MongoDB version compatibility warning: {ping_error}")
                elif not is_atlas:
                    raise ping_error
            
            self.db = self.client[self.db_name]
            
            # Test with a simple operation
            try:
                collections = self.db.list_collection_names()
                print(f"[OK] Connected to MongoDB (found {len(collections)} collections)")
            except Exception as test_error:
                if is_atlas:
                    print(f"[ERROR] MongoDB Atlas connection test failed: {test_error}")
                    print("[WARNING] Check Network Access in MongoDB Atlas dashboard")
                raise test_error
            
            # Create indexes
            try:
                self.db.quiz_history.create_index([("timestamp", -1)])
                self.db.chat_history.create_index([("timestamp", -1)])
            except Exception as idx_error:
                print(f"[WARNING] Index creation warning (non-critical): {idx_error}")
                
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            print(f"[ERROR] MongoDB connection failed: {e}")
            if "mongodb+srv://" in self.mongo_uri:
                print("[ERROR] MongoDB Atlas connection failed - check Network Access settings")
            print("[WARNING] Running without MongoDB - history will not be persisted")
            self.client = None
            self.db = None
        except Exception as e:
            error_msg = str(e).lower()
            print(f"[ERROR] MongoDB connection error: {e}")
            if "authentication" in error_msg or "bad auth" in error_msg:
                print("[ERROR] Authentication failed - check username/password")
            elif "dns" in error_msg:
                print("[ERROR] DNS resolution failed - check cluster URL")
            print("[WARNING] Running without MongoDB - history will not be persisted")
            self.client = None
            self.db = None

    def is_connected(self) -> bool:
        """Check if MongoDB is connected."""
        return self.client is not None and self.db is not None

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
        except Exception as e:
            print(f"Error saving quiz to MongoDB: {e}")
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
        except Exception as e:
            print(f"Error retrieving quiz history: {e}")
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
        except Exception as e:
            print(f"Error retrieving quiz: {e}")
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
        except Exception as e:
            print(f"Error saving chat message to MongoDB: {e}")
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
        except Exception as e:
            print(f"Error retrieving chat history: {e}")
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
        except Exception as e:
            print(f"Error clearing quiz history: {e}")
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
        except Exception as e:
            print(f"Error clearing chat history: {e}")
            return False

    def close(self):
        """Close MongoDB connection."""
        if self.client:
            self.client.close()

