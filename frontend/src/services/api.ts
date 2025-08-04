// src/services/api.ts

// IMPORTANT: Replace this with your actual n8n webhook URL
const N8N_WEBHOOK_URL = "https://your-n8n-instance.com/webhook/your-webhook-id";

interface AgentResponse {
  reply: string;
}

export async function sendToAgent(message: string): Promise<AgentResponse> {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }), // Send the user's message in the body
    });

    if (!response.ok) {
      // If the server responds with an error status (e.g., 404, 500)
      const errorText = await response.text();
      throw new Error(`n8n webhook failed with status ${response.status}: ${errorText}`);
    }

    // n8n webhooks typically return the data from the last node.
    // Ensure your n8n workflow is set up to return a JSON object like { "reply": "..." }
    const data = await response.json();
    
    // It's good practice to check if the expected 'reply' field exists
    if (typeof data.reply !== 'string') {
        throw new Error("Invalid response format from agent. Expected a 'reply' field.");
    }

    return data;

  } catch (error) {
    console.error("Error sending message to agent:", error);
    // Re-throw the error so the component can handle it
    throw error;
  }
}
