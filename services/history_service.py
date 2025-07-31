# services/history_service.py
import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
import hashlib

class HistoryService:
    """Service for tracking and managing research session history"""
    
    def __init__(self):
        self.history_dir = "data/history"
        self.history_file = os.path.join(self.history_dir, "research_history.json")
        self._ensure_history_directory()
    
    def _ensure_history_directory(self):
        """Ensure history directory exists"""
        try:
            os.makedirs(self.history_dir, exist_ok=True)
            
            # Initialize history file if it doesn't exist
            if not os.path.exists(self.history_file):
                self._save_history([])
        except Exception as e:
            print(f"Warning: Could not create history directory: {e}")
    
    def _load_history(self) -> List[Dict[str, Any]]:
        """Load history from file"""
        try:
            if os.path.exists(self.history_file):
                with open(self.history_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            return []
        except Exception as e:
            print(f"Error loading history: {e}")
            return []
    
    def _save_history(self, history: List[Dict[str, Any]]):
        """Save history to file"""
        try:
            with open(self.history_file, 'w', encoding='utf-8') as f:
                json.dump(history, f, indent=2, ensure_ascii=False, default=str)
        except Exception as e:
            print(f"Error saving history: {e}")
    
    def _generate_session_id(self, topic: str, timestamp: str) -> str:
        """Generate unique session ID"""
        content = f"{topic}_{timestamp}"
        return hashlib.md5(content.encode()).hexdigest()[:12]
    
    def create_research_session(
        self,
        topic: str,
        source: str,
        api_provider: str,
        papers_analyzed: int = 0
    ) -> str:
        """Create a new research session entry"""
        try:
            timestamp = datetime.now().isoformat()
            session_id = self._generate_session_id(topic, timestamp)
            
            session_entry = {
                "session_id": session_id,
                "topic": topic,
                "source": source,
                "api_provider": api_provider,
                "timestamp": timestamp,
                "papers_analyzed": papers_analyzed,
                "status": "started",
                "summary": None,
                "proposal": None,
                "structure_data": None,
                "documents_generated": False,
                "duration_seconds": None,
                "tags": self._extract_tags(topic)
            }
            
            history = self._load_history()
            history.insert(0, session_entry)  # Add to beginning
            
            # Keep only last 100 sessions
            if len(history) > 100:
                history = history[:100]
            
            self._save_history(history)
            return session_id
            
        except Exception as e:
            print(f"Error creating research session: {e}")
            return ""
    
    def update_research_session(
        self,
        session_id: str,
        **updates
    ) -> bool:
        """Update an existing research session"""
        try:
            history = self._load_history()
            
            for session in history:
                if session.get("session_id") == session_id:
                    # Update fields
                    for key, value in updates.items():
                        session[key] = value
                    
                    # Update timestamp for last modification
                    session["last_updated"] = datetime.now().isoformat()
                    
                    # Calculate duration if session is completed
                    if updates.get("status") == "completed" and "timestamp" in session:
                        start_time = datetime.fromisoformat(session["timestamp"])
                        end_time = datetime.now()
                        duration = (end_time - start_time).total_seconds()
                        session["duration_seconds"] = duration
                    
                    self._save_history(history)
                    return True
            
            return False
            
        except Exception as e:
            print(f"Error updating research session: {e}")
            return False
    
    def get_research_history(
        self,
        limit: int = 20,
        topic_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get research history with optional filtering"""
        try:
            history = self._load_history()
            
            # Apply topic filter if provided
            if topic_filter:
                topic_lower = topic_filter.lower()
                history = [
                    session for session in history
                    if topic_lower in session.get("topic", "").lower()
                    or any(topic_lower in tag.lower() for tag in session.get("tags", []))
                ]
            
            # Return limited results
            return history[:limit]
            
        except Exception as e:
            print(f"Error getting research history: {e}")
            return []
    
    def get_session_details(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific session"""
        try:
            history = self._load_history()
            
            for session in history:
                if session.get("session_id") == session_id:
                    return session
            
            return None
            
        except Exception as e:
            print(f"Error getting session details: {e}")
            return None
    
    def delete_session(self, session_id: str) -> bool:
        """Delete a research session from history"""
        try:
            history = self._load_history()
            original_length = len(history)
            
            history = [
                session for session in history
                if session.get("session_id") != session_id
            ]
            
            if len(history) < original_length:
                self._save_history(history)
                return True
            
            return False
            
        except Exception as e:
            print(f"Error deleting session: {e}")
            return False
    
    def get_research_statistics(self) -> Dict[str, Any]:
        """Get overall research statistics"""
        try:
            history = self._load_history()
            
            if not history:
                return {
                    "total_sessions": 0,
                    "completed_sessions": 0,
                    "total_papers_analyzed": 0,
                    "avg_papers_per_session": 0,
                    "most_common_topics": [],
                    "data_sources_used": {},
                    "ai_providers_used": {},
                    "avg_session_duration": 0
                }
            
            # Calculate statistics
            total_sessions = len(history)
            completed_sessions = len([s for s in history if s.get("status") == "completed"])
            total_papers = sum(s.get("papers_analyzed", 0) for s in history)
            avg_papers = total_papers / total_sessions if total_sessions > 0 else 0
            
            # Count topics (extract keywords)
            topic_counts = {}
            for session in history:
                for tag in session.get("tags", []):
                    topic_counts[tag] = topic_counts.get(tag, 0) + 1
            
            most_common_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:10]
            
            # Count data sources
            source_counts = {}
            for session in history:
                source = session.get("source", "unknown")
                source_counts[source] = source_counts.get(source, 0) + 1
            
            # Count AI providers
            provider_counts = {}
            for session in history:
                provider = session.get("api_provider", "unknown")
                provider_counts[provider] = provider_counts.get(provider, 0) + 1
            
            # Calculate average session duration
            durations = [s.get("duration_seconds", 0) for s in history if s.get("duration_seconds")]
            avg_duration = sum(durations) / len(durations) if durations else 0
            
            return {
                "total_sessions": total_sessions,
                "completed_sessions": completed_sessions,
                "total_papers_analyzed": total_papers,
                "avg_papers_per_session": round(avg_papers, 1),
                "most_common_topics": most_common_topics,
                "data_sources_used": source_counts,
                "ai_providers_used": provider_counts,
                "avg_session_duration": round(avg_duration, 1)
            }
            
        except Exception as e:
            print(f"Error getting research statistics: {e}")
            return {}
    
    def _extract_tags(self, topic: str) -> List[str]:
        """Extract tags/keywords from research topic"""
        try:
            # Simple keyword extraction
            common_chemistry_terms = [
                "synthesis", "catalysis", "polymer", "organic", "inorganic",
                "materials", "nanomaterials", "drug", "pharmaceutical", "battery",
                "solar", "energy", "environmental", "green", "sustainable",
                "MOF", "COF", "metal", "oxide", "carbon", "graphene",
                "photochemistry", "electrochemistry", "biochemistry"
            ]
            
            topic_lower = topic.lower()
            tags = []
            
            # Extract chemistry terms
            for term in common_chemistry_terms:
                if term in topic_lower:
                    tags.append(term)
            
            # Extract potential compound names (words with numbers or chemical patterns)
            words = topic_lower.split()
            for word in words:
                # Look for chemical-like words
                if (any(char.isdigit() for char in word) and any(char.isalpha() for char in word)) or \
                   len(word) > 6 and word.isalpha():
                    tags.append(word)
            
            # Remove duplicates and limit
            tags = list(set(tags))[:10]
            
            return tags
            
        except Exception as e:
            print(f"Error extracting tags: {e}")
            return []
    
    def export_history(self, format: str = "json") -> str:
        """Export research history in specified format"""
        try:
            history = self._load_history()
            
            if format.lower() == "json":
                return json.dumps(history, indent=2, ensure_ascii=False, default=str)
            elif format.lower() == "csv":
                # Simple CSV export
                if not history:
                    return "No history available"
                
                headers = ["session_id", "topic", "timestamp", "source", "api_provider", 
                          "papers_analyzed", "status", "duration_seconds"]
                
                csv_lines = [",".join(headers)]
                
                for session in history:
                    row = []
                    for header in headers:
                        value = session.get(header, "")
                        # Escape commas in values
                        if "," in str(value):
                            value = f'"{value}"'
                        row.append(str(value))
                    csv_lines.append(",".join(row))
                
                return "\n".join(csv_lines)
            else:
                raise ValueError(f"Unsupported export format: {format}")
                
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error exporting history: {str(e)}"
            )

# Global history service instance
history_service = HistoryService()