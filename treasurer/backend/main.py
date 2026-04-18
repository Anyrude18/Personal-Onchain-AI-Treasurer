"""
main.py — FastAPI application entry point
AI Treasury Management System
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import logging

from routers import agent, portfolio, audit, budget

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown logic."""
    logger.info("🚀 AI Treasury backend starting up...")
    yield
    logger.info("🛑 AI Treasury backend shutting down...")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Treasury Management API",
    description=(
        "On-chain AI treasury orchestration for Hedera — "
        "portfolio analytics, yield routing, budget enforcement, and immutable audit ledger."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── Middleware ─────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"],          # Tighten in production
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(agent.router,     prefix="/api/v1/agent",     tags=["Agent"])
app.include_router(portfolio.router, prefix="/api/v1/portfolio", tags=["Portfolio"])
app.include_router(audit.router,     prefix="/api/v1/audit",     tags=["Audit"])
app.include_router(budget.router,    prefix="/api/v1/budget",    tags=["Budget"])


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "ai-treasury-backend"}


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "AI Treasury Management API",
        "docs": "/docs",
        "version": "1.0.0",
    }