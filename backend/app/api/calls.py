from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.database import get_db
from app.models.user import User
from app.models.call_verification import CallVerification, CallStatus, UserReputation, UserReport
from app.models.audit_log import AuditLog, AuditAction
from app.core.security import generate_call_verification_code, generate_secure_id
from app.api.dependencies import get_current_active_user
from pydantic import BaseModel

class CallInitiate(BaseModel):
    recipient_id: int

router = APIRouter(prefix="/calls", tags=["Calls"])

@router.post("/initiate")
async def initiate_call(
    body: CallInitiate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Initiate a call with another user"""
    
    recipient_id = body.recipient_id
    
    recipient = db.query(User).filter(User.id == recipient_id).first()
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient not found"
        )
    
    call_id = generate_secure_id()
    verification_code = generate_call_verification_code()
    expires_at = datetime.utcnow() + timedelta(minutes=30)
    
    call = CallVerification(
        call_id=call_id,
        caller_id=current_user.id,
        receiver_id=recipient_id,
        verification_code=verification_code,
        status=CallStatus.INITIATING,
        expires_at=expires_at
    )
    
    db.add(call)
    db.commit()
    
    return {
        "call_id": call_id,
        "verification_code": verification_code,
        "expires_at": expires_at.isoformat()
    }
