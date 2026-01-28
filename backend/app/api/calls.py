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

class CallConfirmCode(BaseModel):
    code: str

class CallEnd(BaseModel):
    duration_seconds: int

class CallReport(BaseModel):
    reason: str
    description: str = None

router = APIRouter(prefix="/calls", tags=["Calls"])

@router.post("/initiate")
async def initiate_call(
    body: CallInitiate,
    current_user: User = Depends(get_current_active_user),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Initiate a call with another user"""
    recipient_id = body.recipient_id
    recipient = db.query(User).filter(User.id == recipient_id).first()
    if not recipient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipient not found")
    if not recipient.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Recipient account is inactive")
    
    call_id = generate_secure_id()
    verification_code = generate_call_verification_code()
    expires_at = datetime.utcnow() + timedelta(minutes=30)
    
    print(f"DEBUG initiate: caller_id type={type(current_user.id)}, value={current_user.id}")
    print(f"DEBUG initiate: receiver_id type={type(recipient_id)}, value={recipient_id}")
    
    call = CallVerification(
        call_id=call_id,
        caller_id=int(current_user.id),
        receiver_id=int(recipient_id),
        verification_code=verification_code,
        status=CallStatus.INITIATING,
        expires_at=expires_at
    )
    db.add(call)
    db.commit()
    
    audit_log = AuditLog(
        user_id=current_user.id,
        action=AuditAction.CALL_INITIATED,
        resource_type="call",
        resource_id=call_id,
        ip_address=request.client.host if request.client else None,
        success=True
    )
    db.add(audit_log)
    db.commit()
    
    reputation = db.query(UserReputation).filter(UserReputation.user_id == current_user.id).first()
    if not reputation:
        reputation = UserReputation(user_id=current_user.id)
        db.add(reputation)
    reputation.total_calls = (reputation.total_calls or 0) + 1
    db.commit()
    
    return {"call_id": call_id, "verification_code": verification_code, "expires_at": expires_at.isoformat()}

@router.get("/{call_id}/verification-code")
async def get_verification_code(call_id: str, db: Session = Depends(get_db)):
    """Get the verification code for a call"""
    call = db.query(CallVerification).filter(CallVerification.call_id == call_id).first()
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Call not found")
    if datetime.utcnow() > call.expires_at:
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Verification code expired")
    return {"code": call.verification_code, "expires_at": call.expires_at.isoformat()}

@router.post("/{call_id}/confirm-code")
async def confirm_code(
    call_id: str,
    body: CallConfirmCode,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Confirm the verification code"""
    call = db.query(CallVerification).filter(CallVerification.call_id == call_id).first()
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Call not found")
    if datetime.utcnow() > call.expires_at:
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Verification code expired")
    if call.verification_code != body.code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect verification code")
    
    print(f"DEBUG confirm: current_user.id type={type(current_user.id)}, value={current_user.id}")
    print(f"DEBUG confirm: call.caller_id type={type(call.caller_id)}, value={call.caller_id}")
    print(f"DEBUG confirm: call.receiver_id type={type(call.receiver_id)}, value={call.receiver_id}")
    print(f"DEBUG confirm: is_caller={current_user.id == call.caller_id}, is_receiver={current_user.id == call.receiver_id}")
    
    if int(current_user.id) == int(call.caller_id):
        call.caller_code_confirmed = True
    elif int(current_user.id) == int(call.receiver_id):
        call.receiver_code_confirmed = True
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not part of this call")
    
    if call.caller_code_confirmed and call.receiver_code_confirmed:
        call.is_verified = True
        call.code_verified_at = datetime.utcnow()
        call.status = CallStatus.CONNECTED
    
    db.commit()
    return {"message": "Code confirmed", "is_verified": call.is_verified, "status": call.status.value}

@router.post("/{call_id}/end")
async def end_call(
    call_id: str,
    body: CallEnd,
    current_user: User = Depends(get_current_active_user),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """End a call"""
    call = db.query(CallVerification).filter(CallVerification.call_id == call_id).first()
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Call not found")
    if int(current_user.id) not in [int(call.caller_id), int(call.receiver_id)]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not part of this call")
    
    call.status = CallStatus.ENDED
    call.ended_at = datetime.utcnow()
    call.duration_seconds = body.duration_seconds
    db.commit()
    
    audit_log = AuditLog(
        user_id=current_user.id,
        action=AuditAction.CALL_ENDED,
        resource_type="call",
        resource_id=call_id,
        ip_address=request.client.host if request.client else None,
        success=True
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "Call ended", "call_id": call_id, "duration_seconds": call.duration_seconds, "status": call.status.value}

@router.post("/{call_id}/report")
async def report_call(
    call_id: str,
    body: CallReport,
    current_user: User = Depends(get_current_active_user),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Report a call as scam/harassment/spam"""
    call = db.query(CallVerification).filter(CallVerification.call_id == call_id).first()
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Call not found")
    
    if int(current_user.id) == int(call.caller_id):
        reported_user_id = call.receiver_id
    elif int(current_user.id) == int(call.receiver_id):
        reported_user_id = call.caller_id
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not part of this call")
    
    report = UserReport(
        reporter_id=current_user.id,
        reported_user_id=reported_user_id,
        call_id=call_id,
        reason=body.reason,
        description=body.description,
        status="pending"
    )
    db.add(report)
    call.is_flagged = True
    call.flag_reason = body.reason
    
    reputation = db.query(UserReputation).filter(UserReputation.user_id == reported_user_id).first()
    if not reputation:
        reputation = UserReputation(user_id=reported_user_id)
        db.add(reputation)
    reputation.user_reports = (reputation.user_reports or 0) + 1
    if reputation.user_reports >= 5:
        reputation.is_flagged = True
        reputation.reputation_score = max(0, reputation.reputation_score - 50)
    else:
        reputation.reputation_score = max(0, reputation.reputation_score - 10)
    
    db.commit()
    
    audit_log = AuditLog(
        user_id=current_user.id,
        action=AuditAction.USER_REPORTED,
        resource_type="call",
        resource_id=call_id,
        ip_address=request.client.host if request.client else None,
        success=True
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "Call reported successfully", "report_id": report.id, "reason": body.reason, "status": "pending"}

@router.get("/history")
async def get_call_history(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get call history for current user"""
    calls = db.query(CallVerification).filter(
        (CallVerification.caller_id == current_user.id) |
        (CallVerification.receiver_id == current_user.id)
    ).order_by(CallVerification.created_at.desc()).limit(limit).offset(offset).all()
    
    return {
        "calls": [
            {
                "call_id": call.call_id,
                "caller_id": call.caller_id,
                "receiver_id": call.receiver_id,
                "status": call.status.value,
                "duration_seconds": call.duration_seconds,
                "is_verified": call.is_verified,
                "created_at": call.created_at.isoformat(),
                "ended_at": call.ended_at.isoformat() if call.ended_at else None
            }
            for call in calls
        ],
        "total": len(calls)
    }
