"""
Security module for EazyLink
Handles: password hashing, JWT tokens, encryption, and secure utilities
"""

from datetime import datetime, timedelta
from typing import Optional, Tuple
from jose import JWTError, jwt
from passlib.context import CryptContext
from cryptography.fernet import Fernet
import os
from app.core.config import settings

# Password hashing context
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
    argon2__memory_cost=65536,  # 64MB
    argon2__time_cost=3,
    argon2__parallelism=4,
)

class EncryptionManager:
    """Handles field-level encryption for sensitive data"""
    
    def __init__(self):
        # Generate or load encryption key
        key_path = os.getenv("ENCRYPTION_KEY_PATH", ".encryption_key")
        if os.path.exists(key_path):
            with open(key_path, 'rb') as f:
                self.key = f.read()
        else:
            self.key = Fernet.generate_key()
            # Store key securely (in production: use KMS like AWS KMS)
            with open(key_path, 'wb') as f:
                f.write(self.key)
            os.chmod(key_path, 0o600)
        
        self.cipher = Fernet(self.key)
    
    def encrypt(self, data: str) -> str:
        """Encrypt sensitive data"""
        if not data:
            return ""
        return self.cipher.encrypt(data.encode()).decode()
    
    def decrypt(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
        if not encrypted_data:
            return ""
        try:
            return self.cipher.decrypt(encrypted_data.encode()).decode()
        except Exception as e:
            raise ValueError(f"Decryption failed: {str(e)}")

# Initialize encryption
encryption_manager = EncryptionManager()

def validate_password_strength(password: str) -> Tuple[bool, str]:
    """
    Validate password strength requirements
    Returns: (is_valid, message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least 1 uppercase letter"
    if not any(c.islower() for c in password):
        return False, "Password must contain at least 1 lowercase letter"
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least 1 digit"
    return True, "Password is valid"

def get_password_hash(password: str) -> str:
    """Hash a password using argon2"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    """Create JWT access token with short expiry"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)  # Default 15 minutes
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    """Create long-lived refresh token (14 days)"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=14)
    to_encode.update({"exp": expire, "iat": datetime.utcnow(), "type": "refresh"})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt

def verify_token(token: str) -> dict:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None

def generate_call_verification_code() -> str:
    """
    Generate a unique call verification code
    Both caller and receiver see the same 6-digit code
    Prevents spoofing and proves connection authenticity
    """
    import random
    return f"{random.randint(0, 999999):06d}"

def generate_secure_id() -> str:
    """Generate a cryptographically secure random ID"""
    import secrets
    return secrets.token_urlsafe(16)

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and return payload from access token"""
    return verify_token(token)

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and return payload from access token"""
    return verify_token(token)
