"""
NeoEngine Backend - Aries AI Server
Main entry point for the FastAPI backend that bridges the Web Editor with Aries AI.
"""

import os
import json
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.routes import router as api_router
from bridge.websocket_bridge import ConnectionManager
from aries.brain import AriesBrain


# Global instances
aries_brain: AriesBrain
connection_manager: ConnectionManager


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown."""
    global aries_brain, connection_manager
    
    # Startup
    print("=" * 60)
    print("  NeoEngine Backend - Aries AI Server")
    print("  Fauzan Engine v1.0")
    print("=" * 60)
    
    connection_manager = ConnectionManager()
    aries_brain = AriesBrain()
    await aries_brain.initialize()
    
    app.state.aries_brain = aries_brain
    app.state.connection_manager = connection_manager
    
    print("[ARIES] Brain initialized and ready")
    print("[SERVER] Backend running on http://localhost:8000")
    print("[WS] WebSocket bridge ready on ws://localhost:8000/ws")
    print("=" * 60)
    
    yield
    
    # Shutdown
    print("[SERVER] Shutting down...")
    await aries_brain.shutdown()


app = FastAPI(
    title="NeoEngine - Aries AI Backend",
    description="Backend server for Fauzan Engine's NeoEngine Editor with Aries AI integration",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(api_router, prefix="/api")


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time editor communication."""
    manager: ConnectionManager = app.state.connection_manager
    brain: AriesBrain = app.state.aries_brain
    
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            msg_type = message.get("type", "")
            
            if msg_type == "scene_update":
                # Broadcast scene updates to all connected clients
                await manager.broadcast(data, exclude=websocket)
                
            elif msg_type == "ai_command":
                # Process AI command through Aries
                response = await brain.process_command(
                    message.get("command", ""),
                    message.get("context", {})
                )
                await websocket.send_json({
                    "type": "ai_response",
                    "response": response
                })
                
            elif msg_type == "engine_state":
                # Engine runtime state update
                await manager.broadcast(data)
                
            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.get("/")
async def root():
    return {
        "engine": "NeoEngine",
        "version": "1.0.0",
        "ai": "Aries Brain v3.0",
        "status": "running",
        "endpoints": {
            "api": "/api",
            "websocket": "/ws",
            "docs": "/docs",
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
