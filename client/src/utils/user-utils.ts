const API_BASE = "https://causeconnectbackend.onrender.com/api";

export interface AuthResponse {
  success: boolean;
  message: string;
  userType?: string;
  nextRoute?: string;
}

// Token management functions
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

const removeAuthToken = (): void => {
  localStorage.removeItem('token');
};

// Generic fetch function with authentication
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // If we get a 401, the token is likely expired
    if (response.status === 401) {
      removeAuthToken();
      // Optionally redirect to login page or trigger a logout
      // window.location.href = '/login';
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export const signup = async (email: string, password: string, usertype: string): Promise<AuthResponse> => {
  try {
    console.log(email, password, usertype);
    const res = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, usertype}),
      credentials: "include", // Keep for cookie fallback
    });

    if (!res.ok) {
      const message = await res.text();
      return { success: false, message };
    }

    return { success: true, message: "User created" };
  } catch (err) {
    return { success: false, message: "Network error" };
  }
};

export const login = async (email: any, password: any): Promise<AuthResponse> => {
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include", // Keep for cookie fallback
    });

    if (!res.ok) {
      const message = await res.text();
      return { success: false, message };
    }

    const data = await res.json();
    
    // Store token in localStorage if provided
    if (data.token) {
      setAuthToken(data.token);
    }
    
    return {
      success: true,
      message: "Logged in",
      userType: data.userType,
      nextRoute: data.nextRoute,
    };
  } catch (err) {
    return { success: false, message: "Network error" };
  }
};

export const logout = async (): Promise<AuthResponse> => {
  try {
    const res = await fetchWithAuth(`${API_BASE}/logout`, {
      method: "POST",
      credentials: "include", // Keep for cookie fallback
    });

    // Always remove token from localStorage, regardless of response
    removeAuthToken();

    if (!res.ok) {
      console.warn('Logout request failed, but token removed locally');
      return { success: false, message: "Logout failed" };
    }

    return { success: true, message: "Logged out" };
  } catch (err) {
    // Still remove token even if request fails
    removeAuthToken();
    return { success: false, message: "Network error" };
  }
};

export const getSession = async (): Promise<{ email: string } | null> => {
  try {
    const res = await fetchWithAuth(`${API_BASE}/session`, {
      method: "GET",
      credentials: "include", // Keep for cookie fallback
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};

export const fetchProtectedData = async (): Promise<string | null> => {
  try {
    const res = await fetchWithAuth(`${API_BASE}/protected`, {
      method: "GET",
      credentials: "include", // Keep for cookie fallback
    });

    if (!res.ok) return null;

    const text = await res.text();
    return text;
  } catch {
    return null;
  }
};

// Additional utility functions for token management
export const auth = {
  getToken: getAuthToken,
  setToken: setAuthToken,
  removeToken: removeAuthToken,
  isLoggedIn: () => !!getAuthToken(),
};

// Function to get current user info (you might need this)
export const getCurrentUser = async (): Promise<any | null> => {
  try {
    const res = await fetchWithAuth(`${API_BASE}/me`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};