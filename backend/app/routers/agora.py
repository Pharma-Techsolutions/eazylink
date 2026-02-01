from fastapi import APIRouter, HTTPException
from agora_token_builder import RtcTokenBuilder
import time

from app.core.config import settings

router = APIRouter(prefix="/agora", tags=["agora"])


@router.post("/token")
async def get_agora_token(channel_name: str, uid: int):
    """Generate Agora RTC token for joining a voice call."""
    try:
        token = RtcTokenBuilder.buildTokenWithUid(
            appId=settings.AGORA_APP_ID,
            appCertificate=settings.AGORA_APP_CERTIFICATE,
            channelName=channel_name,
            uid=uid,
            role=1,
            privilegeExpiredTs=int(time.time()) + 3600
        )
        
        return {
            "token": token,
            "app_id": settings.AGORA_APP_ID,
            "channel_name": channel_name,
            "uid": uid
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/test")
async def test_token():
    """Test token generation."""
    try:
        token = RtcTokenBuilder.buildTokenWithUid(
            appId=settings.AGORA_APP_ID,
            appCertificate=settings.AGORA_APP_CERTIFICATE,
            channelName="test_channel",
            uid=123,
            role=1,
            privilegeExpiredTs=int(time.time()) + 3600
        )
        return {"status": "ok", "message": "Token generated"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
