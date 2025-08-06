// src/services/api.ts

// IMPORTANT: Replace this with your actual n8n webhook URL
const N8N_WEBHOOK_URL = "https://smartopd-agent.onrender.com/webhook/chat";

// const N8N_WEBHOOK_URL = "https://aswinasokan.app.n8n.cloud/webhook-test/send-message";

interface AgentResponse {
  reply: string;
}

// --- CHANGE #1: The function now accepts userId as a second argument ---
export async function sendToAgent(message: string, userId: string | undefined): Promise<AgentResponse> {
  try {
    // --- CHANGE #2: Add a check to ensure the user is logged in ---
    if (!userId) {
      // This prevents sending requests for logged-out users.
      throw new Error("Cannot send message: User is not authenticated.");
    }

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // --- CHANGE #3: Add the userId to the JSON body ---
      body: JSON.stringify({ message, userId }), 
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`n8n webhook failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (typeof data.reply !== 'string') {
        throw new Error("Invalid response format from agent. Expected a 'reply' field.");
    }

    return data;

  } catch (error) {
    console.error("Error sending message to agent:", error);
    throw error;
  }
}