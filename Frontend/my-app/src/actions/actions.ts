export const registerUser = async (userData: {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
}): Promise<any> => {  // Changed return type to any to match backend response
  try {
    const requestData = {
      first_name: userData.first_name,
      last_name: userData.last_name,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      is_verified: false
    };

    const response = await fetch("http://localhost:8000/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail?.message || result.detail || "Registration failed");
    }

    if (!result) {
      throw new Error("No response data received");
    }

    return result; // This will now return the complete response from backend
  } catch (error: any) {
    console.error("Registration Error:", error.message);
    throw error;
  }
};

export const signInUser = async (credentials: {
  username: string;
  password: string;
}): Promise<{ 
  access_token: string | null; 
  refresh_token: string | null;
  is_verified: boolean;
  email: string;
  detail?: string;
}> => {
  try {
    const response = await fetch("http://localhost:8000/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(credentials),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.detail || "Something went wrong.");
    }

    return result;
  } catch (error: any) {
    console.error("Sign In Error:", error.message);
    throw error;
  }
};

export const verifyEmail = async (data: {
  verification_code: string;
}): Promise<{ message: string }> => {
  try {
    const formData = new FormData();
    formData.append('verification_code', data.verification_code);

    const response = await fetch("http://localhost:8000/user/verify-email", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Verification failed");
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error("Verification Error:", error.message);
    throw error;
  }
};

export const resendVerification = async (email: string): Promise<{ message: string }> => {
  try {
    const response = await fetch("http://localhost:8000/user/resend-verification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to resend verification code");
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error("Resend Verification Error:", error.message);
    throw error;
  }
};

export const analyzeMarket = async (
  data: {
    product: string;
    product_type: string;
    category: string;
    description: string;
  },
  token: string,
  onChunk: (chunk: string) => void
): Promise<void> => {
  try {
    const response = await fetch("http://localhost:8000/content/analyze-market", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to analyze market');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          onChunk(data);
        }
      }
    }
  } catch (error: any) {
    console.error("Market Analysis Error:", error.message);
    throw error;
  }
};
