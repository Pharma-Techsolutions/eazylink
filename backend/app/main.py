from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from slowapi.errors import RateLimitExceeded
import logging
from app.core.config import settings
from app.api import auth, users, calls
from app.routers import agora
from app.middleware.rate_limit import limiter, rate_limit_exceeded_handler
from app.models.database import engine, Base
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.audit_log import AuditLog, AuditAction
from app.models.call_verification import CallVerification, UserReputation


# Configure logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.DEBUG else None,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(calls.router, prefix="/api/v1")
app.include_router(agora.router, prefix="/api/v1")

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "1.0.0", "environment": settings.ENVIRONMENT}

@app.get("/")
async def root():
    return {"message": "Private API is running"}
