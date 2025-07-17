const API_BASE = "http://causeconnectbackend.onrender.com/api";

// Utility function to make API calls with authentication token (reuse your existing function)
const makeRequest = async (url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: any) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const requestOptions: RequestInit = {
    method,
    headers,
    credentials: 'include', // send cookies for auth
    body: data ? JSON.stringify(data) : undefined,
  };

  try {
    const response = await fetch(url, requestOptions);

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