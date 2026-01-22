from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from app.models.database import Base

class Connection(Base):
    __tablename__ = "connections"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Network details
    ssid = Column(String)
    bssid = Column(String)
    network_type = Column(String)  # wifi, cellular, etc.
    
    # Connection timing
    connected_at = Column(DateTime(timezone=True), nullable=False)
    disconnected_at = Column(DateTime(timezone=True))
    duration = Column(Integer)  # seconds
    
    # Quality metrics
    signal_strength = Column(Float)
    quality_score = Column(Float)
    
    # Location (optional)
    latitude = Column(Float)
    longitude = Column(Float)
    location_name = Column(String)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
