# In api/schemas.py

from pydantic import BaseModel

class ChatRequest(BaseModel):
    """Defines the shape of the incoming request body for the /chat endpoint."""
    message: str