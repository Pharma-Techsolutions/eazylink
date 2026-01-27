"""
Call Verification Model
Implements call verification codes and fraud detection
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum, ForeignKey
from sqlalchemy.sql import func
from app.models.database import Base
import enum

class CallStatus(str, enum.Enum):
    INITIATING = "initiating"
    RINGING = "ringing"
    CONNECTED = "connected"
    ENDED = "ended"
    MISSED = "missed"
    REJECTED = "rejected"
    FAILED = "failed"

class CallVerification(Base):
    """
    Stores call verification data
    
    Security Features:
    1. Both parties see same 6-digit code - prevents spoofing
    2. Code changes with each call - prevents replay attacks
    3. Code valid only during active call - prevents reuse
    4. Verification is optional but recommended for privacy assurance
    """
    __tablename__ = "call_verifications"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Call identifiers
    call_id = Column(String(255), unique=True, index=True, nullable=False)
    
    # Participants (using anonymous IDs to maintain privacy)
    caller_id = Column(String(255), index=True, nullable=False)
    receiver_id = Column(String(255), index=True, nullable=False)
    
    # Verification code (shown to both parties)
    verification_code = Column(String(6), nullable=False)
    code_verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Status tracking
    status = Column(Enum(CallStatus), default=CallStatus.INITIATING, index=True)
    
    # Security flags
    is_verified = Column(Boolean, default=False)  # Both parties confirmed code
    caller_code_confirmed = Column(Boolean, default=False)
    receiver_code_confirmed = Column(Boolean, default=False)
    
    # Call duration
    started_at = Column(DateTime(timezone=True), nullable=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    
    # Fraud indicators
    is_flagged = Column(Boolean, default=False, index=True)
    flag_reason = Column(String(255), nullable=True)  # "repeated_caller", "rapid_calls", etc.
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Privacy: Auto-delete after 30 days (set cleanup job)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<CallVerification {self.call_id} - {self.status}>"


class UserReputation(Base):
    """
    User reputation and fraud score
    
    Used to detect:
    - Repeat scammers
    - Spam callers
    - Suspicious patterns
    """
    __tablename__ = "user_reputation"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, index=True, nullable=False)
    
    # Reputation metrics
    total_calls = Column(Integer, default=0)
    call_rejections = Column(Integer, default=0)  # People hanging up on them
    user_reports = Column(Integer, default=0)  # Times reported as scammer
    blocks = Column(Integer, default=0)  # Times blocked by other users
    
    # Score (0-100, lower is riskier)
    reputation_score = Column(Integer, default=100)
    is_flagged = Column(Boolean, default=False, index=True)  # Flagged for manual review
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<UserReputation user={self.user_id} score={self.reputation_score}>"


class BlockedUser(Base):
    """
    Track blocked users to prevent harassment
    """
    __tablename__ = "blocked_users"
    
    id = Column(Integer, primary_key=True, index=True)
    blocker_id = Column(Integer, index=True, nullable=False)
    blocked_id = Column(Integer, index=True, nullable=False)
    
    reason = Column(String(255), nullable=True)  # Why they blocked
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<BlockedUser {self.blocker_id} blocked {self.blocked_id}>"


class UserReport(Base):
    """
    Track user-reported suspicious behavior
    """
    __tablename__ = "user_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, nullable=False)
    reported_user_id = Column(Integer, nullable=False)
    call_id = Column(String(255), nullable=True)  # Related call, if any
    
    reason = Column(String(255), nullable=False)  # "scam", "harassment", "spam"
    description = Column(String(1000), nullable=True)
    
    status = Column(String(50), default="pending")  # pending, investigating, resolved
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    def __repr__(self):
        return f"<UserReport {self.reason} against user {self.reported_user_id}>"
