from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.user import User
from app.api.schemas import UserResponse
from app.api.dependencies import get_current_active_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user profile"""
    return current_user

@router.patch("/me", response_model=UserResponse)
async def update_current_user_profile(
    name: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    current_user.name = name
    db.commit()
    db.refresh(current_user)
    return current_user
