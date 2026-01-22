from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime
from app.core.security import validate_password_strength

# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    
    @validator('password')
    def validate_password(cls, v):
        is_valid, message = validate_password_strength(v)
        if not is_valid:
            raise ValueError(message)
        return v
    
    @validator('name')
    def validate_name(cls, v):
        if len(v) < 2:
            raise ValueError("Name must be at least 2 characters")
        if len(v) > 100:
            raise ValueError("Name must be less than 100 characters")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    plan: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[int] = None

# Connection Schemas
class ConnectionCreate(BaseModel):
    ssid: Optional[str] = None
    bssid: Optional[str] = None
    network_type: str
    connected_at: datetime
    signal_strength: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ConnectionEnd(BaseModel):
    disconnected_at: datetime

class ConnectionResponse(BaseModel):
    id: int
    ssid: Optional[str]
    network_type: str
    connected_at: datetime
    disconnected_at: Optional[datetime]
    duration: Optional[int]
    quality_score: Optional[float]
    location_name: Optional[str]
    
    class Config:
        from_attributes = True

# Error Response
class ErrorResponse(BaseModel):
    code: str
    message: str
    details: Optional[dict] = None
