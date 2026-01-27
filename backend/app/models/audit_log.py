"""
Audit Log Model
Tracks all sensitive operations for security, compliance, and fraud detection
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Enum
from sqlalchemy.sql import func
from app.models.database import Base
import enum

class AuditAction(str, enum.Enum):
    """Types of auditable actions"""
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    USER_REGISTER = "user_register"
    USER_EMAIL_VERIFIED = "user_email_verified"
    PASSWORD_CHANGED = "password_changed"
    CALL_INITIATED = "call_initiated"
    CALL_ACCEPTED = "call_accepted"
    CALL_ENDED = "call_ended"
    CALL_REJECTED = "call_rejected"
    USER_BLOCKED = "user_blocked"
    USER_REPORTED = "user_reported"
    TOKEN_REFRESHED = "token_refreshed"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    FAILED_LOGIN = "failed_login"
    ENCRYPTION_ERROR = "encryption_error"

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Actor information
    user_id = Column(Integer, nullable=True, index=True)  # None for registration events
    
    # Action details
    action = Column(Enum(AuditAction), index=True, nullable=False)
    resource_type = Column(String(50), nullable=False)  # "user", "call", "contact"
    resource_id = Column(String(255), nullable=True)  # ID of affected resource
    
    # Context
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    user_agent = Column(String(500), nullable=True)
    success = Column(Boolean, default=True)
    
    # Details
    details = Column(Text, nullable=True)  # JSON details
    error_message = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    def __repr__(self):
        return f"<AuditLog {self.action} by user {self.user_id}>"
