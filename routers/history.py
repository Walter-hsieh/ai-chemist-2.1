# routers/history.py
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any

from services.history_service import history_service

router = APIRouter()

@router.get("/history/sessions")
async def get_research_history(
    limit: int = Query(default=20, ge=1, le=100, description="Maximum number of sessions to return"),
    topic_filter: Optional[str] = Query(default=None, description="Filter by topic keywords")
) -> List[Dict[str, Any]]:
    """Get research session history"""
    try:
        history = history_service.get_research_history(limit=limit, topic_filter=topic_filter)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving history: {str(e)}")

@router.get("/history/sessions/{session_id}")
async def get_session_details(session_id: str) -> Dict[str, Any]:
    """Get detailed information about a specific research session"""
    try:
        session = history_service.get_session_details(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving session: {str(e)}")

@router.delete("/history/sessions/{session_id}")
async def delete_session(session_id: str) -> Dict[str, str]:
    """Delete a research session from history"""
    try:
        success = history_service.delete_session(session_id)
        if not success:
            raise HTTPException(status_code=404, detail="Session not found")
        return {"message": "Session deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting session: {str(e)}")

@router.get("/history/statistics")
async def get_research_statistics() -> Dict[str, Any]:
    """Get overall research statistics and analytics"""
    try:
        stats = history_service.get_research_statistics()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving statistics: {str(e)}")

@router.get("/history/export")
async def export_history(
    format: str = Query(default="json", regex="^(json|csv)$", description="Export format: json or csv")
) -> Dict[str, str]:
    """Export research history in specified format"""
    try:
        exported_data = history_service.export_history(format=format)
        return {
            "format": format,
            "data": exported_data,
            "timestamp": history_service._load_history()[0].get("timestamp") if history_service._load_history() else None
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error exporting history: {str(e)}")