export const registerUser = async (userData: {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
}): Promise<any> => {  
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

    // The server response (result) will contain:
    // - user details
    // - registration status
    // - any other relevant information from the server
    return result; 
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

    // The response from the server is returned directly as an object containing:
    // - access_token
    // - refresh_token
    // - is_verified
    // - email
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

export const uploadImage = async (
  file: File,
  adId: number, 
  token: string
): Promise<{ url: string; public_id: string }> => {
  try {
    console.log('Creating form data with:', { file, adId });
    const formData = new FormData();
    formData.append('file', file);

    console.log('Making API request to upload image...');
    const response = await fetch(`http://localhost:8000/user/upload-image/${adId}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData,
    });

    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response data:', result);

    if (!response.ok) {
      throw new Error(result.detail?.message || result.detail || "Image upload failed");
    }

    if (!result.data?.url || !result.data?.public_id) {
      throw new Error("Invalid response format from server");
    }

    return {
      url: result.data.url,
      public_id: result.data.public_id
    };
  } catch (error: any) {
    console.error("Image Upload Error:", error.message);
    throw error;
  }
};

export const fetchAnalytics = async (
  userId: number, 
  token: string
): Promise<any> => {
  try {
    const response = await fetch(`/api/analytics/${userId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch analytics data");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Analytics Fetch Error:", error.message);
    throw error;
  }
};
