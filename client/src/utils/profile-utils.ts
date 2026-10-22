const API_BASE = "https://causeconnectbackend.onrender.com/api";

// Token management functions (reuse from user-utils)
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Generic fetch function with authentication
const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
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
      localStorage.removeItem('token');
      // Optionally redirect to login page or trigger a logout
      // window.location.href = '/login';
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Utility function to make API calls with authentication token
const makeRequest = async (url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: any) => {
  const requestOptions: RequestInit = {
    method,
    body: data ? JSON.stringify(data) : undefined,
  };

  try {
    const response = await fetchWithAuth(url, requestOptions);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'An error occurred');
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Fetch user profile (student or nonprofit depending on token userType)
export const getUserProfile = async () => {
  try {
    const data = await makeRequest(`${API_BASE}/profile`, 'GET');
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile (student or nonprofit, pass relevant fields based on userType)
export const updateUserProfile = async (profileData: Record<string, any>) => {
  try {
    const data = await makeRequest(`${API_BASE}/profile`, 'PUT', profileData);
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// PUT (create or update) the user's profile
export const saveUserProfile = async (profileData: Record<string, any>) => {
    try {
    const data = await makeRequest(`${API_BASE}/profile`, 'PUT', profileData);
    return data;
  } catch (error) {
    console.error('Error adding user profile:', error);
    throw error;
  } 
};