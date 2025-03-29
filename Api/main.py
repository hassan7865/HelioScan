# main.py
from contextlib import asynccontextmanager
import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from utils.database import engine, Base
from routes.auth import router as auth_router
from routes.user import router as user_router
from routes.uploadresult import initialize_collections, router as upload_results
from utils.chromaDB import client
from fastapi.middleware.cors import CORSMiddleware

# Create tables
Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI()





# Include routes
# chroma_collection = None

@asynccontextmanager
async def lifespan(app: FastAPI):
   
    global chroma_collection
    try:
        chroma_collection = initialize_collections()
        if chroma_collection:
            print("✅ ChromaDB collection initialized successfully.")
        else:
            print("⚠️ Failed to initialize ChromaDB collection.")

        yield  # Application runs here

    except Exception as e:
        print(f"❌ Error during startup: {str(e)}")

    finally:
        # Cleanup logic (if needed)
        print("🛑 FastAPI app shutting down...")

# Initialize FastAPI with the new lifespan handler
app = FastAPI(lifespan=lifespan)


app.mount("/static", StaticFiles(directory="static"), name="static")
origins = [
    "http://localhost:5173",
]

# Add CORSMiddleware to your app
app.add_middleware(
    CORSMiddleware,
    allow_origins="*",  # Or use "*" to allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)


app.include_router(auth_router, prefix="/api/auth",tags=["auth"])
app.include_router(upload_results,prefix="/api/result",tags=["result"])
app.include_router(user_router,prefix="/api/user",tags=["user"])

# Run the app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)