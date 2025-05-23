const API_BASE = "http://localhost:5001/api";

export interface AuthResponse {
  success: boolean;
  message: string;
  userType?: string;
  nextRoute?: string;
}

export const signup = async (username: string, password: string, usertype: string): Promise<AuthResponse> => {
  try {
    console.log(username, password, usertype);
    const res = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, usertype}),
      credentials: "include",
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
      credentials: "include",
    });

    if (!res.ok) {
      const message = await res.text();
      return { success: false, message };
    }

    const data = await res.json();
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
    const res = await fetch(`${API_BASE}/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      return { success: false, message: "Logout failed" };
    }

    return { success: true, message: "Logged out" };
  } catch (err) {
    return { success: false, message: "Network error" };
  }
};

export const getSession = async (): Promise<{ email: string } | null> => {
  try {
    const res = await fetch(`${API_BASE}/session`, {
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

export const fetchProtectedData = async (): Promise<string | null> => {
  try {
    const res = await fetch(`${API_BASE}/protected`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) return null;

    const text = await res.text();
    return text;
  } catch {
    return null;
  }
};
