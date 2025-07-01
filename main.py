from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="School Forum API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/post-list")
async def get_posts():
    return {
        "status": "success",
        "posts": [
            {
                "post_id": 1,
                "title": "Welcome to the Forum",
                "content": "This is a sample post from the API",
                "author_id": "admin",
                "upload_time": "2024-01-01T00:00:00",
                "category": "General",
                "anonymous": 0
            }
        ]
    }

# Add other endpoints as needed...