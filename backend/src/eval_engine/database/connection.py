import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from ..config import settings

logger = logging.getLogger(__name__)

class MongoDBManager:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None

db_manager = MongoDBManager()

async def connect_to_mongo() -> AsyncIOMotorDatabase:
    """Connect to MongoDB and initialize database handle."""
    if db_manager.client is None:
        logger.info(f"Connecting to MongoDB at {settings.mongodb_uri} (database: {settings.mongodb_db_name})")
        db_manager.client = AsyncIOMotorClient(
            settings.mongodb_uri,
            maxPoolSize=50,
            minPoolSize=5,
            serverSelectionTimeoutMS=5000
        )
        db_manager.db = db_manager.client[settings.mongodb_db_name]
        # Verify connection
        await db_manager.client.admin.command('ping')
        logger.info("Successfully established connection to MongoDB.")
    return db_manager.db

async def close_mongo_connection():
    """Close MongoDB client connection pool."""
    if db_manager.client is not None:
        logger.info("Closing MongoDB connection pool.")
        db_manager.client.close()
        db_manager.client = None
        db_manager.db = None

def get_database() -> AsyncIOMotorDatabase:
    """Retrieve the current database handle."""
    if db_manager.db is None:
        raise RuntimeError("MongoDB connection is not initialized. Call connect_to_mongo() first.")
    return db_manager.db
