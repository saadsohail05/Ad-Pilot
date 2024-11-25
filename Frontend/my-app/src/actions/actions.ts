export const registerUser = async (userData: {
  username: string;
  email: string;
  password: string;
}): Promise<{ message: string }> => {
  try {
    const response = await fetch("http://localhost:8000/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Something went wrong.");
    }

    const result = await response.json();
    return result; // Successful response
  } catch (error: any) {
    console.error("Registration Error:", error.message);
    throw error;
  }
};

export const signInUser = async (credentials: {
  username: string;
  password: string;
}): Promise<{ access_token: string; refresh_token: string }> => {
  try {
    const response = await fetch("http://localhost:8000/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Something went wrong.");
    }

    const result = await response.json();
    return result; // Successful response
  } catch (error: any) {
    console.error("Sign In Error:", error.message);
    throw error;
  }
};
