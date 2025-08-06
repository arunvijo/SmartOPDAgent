// src/services/otpService.ts

// Your existing webhook for sending the OTP
const SEND_OTP_WEBHOOK_URL = "https://smartopd-agent.onrender.com/webhook/send-otp";

// IMPORTANT: Create a second, new webhook in n8n for verification
const VERIFY_OTP_WEBHOOK_URL = "https://smartopd-agent.onrender.com/webhook/verify-otp";


interface ApiResponse {
  success: boolean;
  message: string;
}

/**
 * Calls an n8n webhook to send a One-Time Password (OTP) to the user's email.
 * @param email The email address to send the OTP to.
 * @returns A promise that resolves if the request was successful.
 */
export async function sendOtp(email: string): Promise<ApiResponse> {
  try {
    const response = await fetch(SEND_OTP_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }), // Send the user's email to the webhook
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`n8n OTP webhook failed with status ${response.status}: ${errorText}`);
    }

    return await response.json();

  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, message: (error as Error).message };
  }
}

/**
 * NEW: Calls an n8n webhook to verify the submitted OTP.
 * @param email The user's email.
 * @param otp The 6-digit OTP entered by the user.
 * @returns A promise that resolves with the verification result.
 */
export async function verifyOtp(email: string, otp: string): Promise<ApiResponse> {
    try {
        const response = await fetch(VERIFY_OTP_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`n8n OTP verification failed: ${errorText}`);
        }

        return await response.json(); // Expect { success: boolean, message: string }
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return { success: false, message: (error as Error).message };
    }
}
