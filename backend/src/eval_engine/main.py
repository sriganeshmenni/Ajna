from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from .api.routes import auth, sessions, websocket, reports, admin
from .events.event_bus import EventBus
from .config import settings
from .database import connect_to_mongo, close_mongo_connection, create_indexes, seed_default_accounts

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.event_bus = EventBus()
    app.state.connection_manager = websocket.manager
    
    # Initialize MongoDB connection & collections
    try:
        await connect_to_mongo()
        await create_indexes()
        await seed_default_accounts()
        logger.info("MongoDB initialized and default accounts verified.")
    except Exception as e:
        logger.error(f"Failed to initialize MongoDB: {e}")

    yield
    
    # Cleanup on shutdown
    try:
        await close_mongo_connection()
        logger.info("MongoDB connection closed cleanly.")
    except Exception as e:
        logger.error(f"Error during MongoDB shutdown: {e}")

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(sessions.router)
app.include_router(websocket.router)
app.include_router(reports.router)
app.include_router(admin.router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.app_name}
