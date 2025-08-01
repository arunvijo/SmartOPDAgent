# In main.py

from fastapi import FastAPI
from api.router import route_request
from api.schemas import ChatRequest
import uvicorn

# Initialize the FastAPI application
app = FastAPI(
    title="SmartOPD Agent API",
    description="The main API gateway for the multi-agent hospital OPD system."
)

@app.get("/", tags=["Status"])
def health_check():
    """A simple endpoint to confirm the API is running."""
    return {"status": "ok", "message": "API is running"}


@app.post("/chat", tags=["Chatbot"])
def handle_chat(request: ChatRequest) -> dict:
    """
    This is the main endpoint that the frontend will call.
    It receives a user message and returns the agent's response.
    """
    # The route_request function does all the heavy lifting.
    agent_reply = route_request(user_message=request.message)
    
    # Your frontend expects a 'reply' key in the JSON response.
    return {"reply": agent_reply}


# This allows you to run the app directly using `python main.py`
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)