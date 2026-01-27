"""
Updated User Model with Security Fields
Includes email verification, device tracking, and privacy settings
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Text
from sqlalchemy.sql import func
from app.models.database import Base
import enum

class PlanType(str, enum.Enum):
    FREE = "free"
    PREMIUM = "premium"

class User(Base):
    __tablename__ = "users"
    
    # Core identity
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    
    # Account status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    plan = Column(Enum(PlanType), default=PlanType.FREE)
    
    # Email verification (prevents account takeover)
    email_verification_token = Column(String(255), nullable=True)
    email_verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Two-factor authentication
    two_fa_enabled = Column(Boolean, default=False)
    two_fa_secret = Column(String(255), nullable=True)  # Encrypted TOTP secret
    
    # Password security
    last_password_change = Column(DateTime(timezone=True), nullable=True)
    password_reset_token = Column(String(255), nullable=True)
    password_reset_expires = Column(DateTime(timezone=True), nullable=True)
    
    # Device tracking (for detecting unauthorized access)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    last_login_ip = Column(String(45), nullable=True)
    last_login_device = Column(String(500), nullable=True)
    
    # Privacy settings
    allow_unknown_calls = Column(Boolean, default=True)
    auto_delete_call_logs = Column(Boolean, default=True)
    call_logs_retention_days = Column(Integer, default=30)  # Auto-delete after 30 days
    show_verification_code = Column(Boolean, default=True)  # Show call verification code
    
    # Compliance
    gdpr_accepted = Column(Boolean, default=False)
    data_processing_consent = Column(Boolean, default=False)
    marketing_consent = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)  # Soft delete
    
    def __repr__(self):
        return f"<User {self.email}>"
