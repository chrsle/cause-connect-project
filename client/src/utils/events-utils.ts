// opportunity-utils.ts - Updated to use JWT token authentication
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

// Function to get the current organization's profile
export const getOrganizationProfile = async () => {
  try {
    const data = await makeRequest(`${API_BASE}/me`, 'GET');
    
    // Check if user is a nonprofit and has profile data
    if (data.user_type !== 'nonprofit') {
      throw new Error('User is not a nonprofit organization');
    }
    
    if (!data.profile) {
      throw new Error('Nonprofit profile not found');
    }
    
    return data.profile;
  } catch (error) {
    console.error('Error fetching organization profile:', error);
    throw error;
  }
};

// Function to get all opportunities
export const getAllOpportunities = async () => {
  try {
    const data = await makeRequest(`${API_BASE}/opportunities/all`, 'GET');
    return data;
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    throw error;
  }
};

// Function to get opportunities for the logged-in user
export const getUserOpportunities = async () => {
  try {
    const data = await makeRequest(`${API_BASE}/opportunities`, 'GET');
    console.log('User opportunities:', data);
    return data;
  } catch (error) {
    console.error('Error fetching user opportunities:', error);
    throw error;
  }
};

// Function to create a new opportunity
export const createOpportunity = async (nonprofitName: string, title: string, description: string, date: string, time: string, location: string, endTime?: string) => {
  const opportunityData = {
    nonprofit_name: nonprofitName,
    title,
    description,
    date,
    time,
    location,
    end_time: endTime
  };

  try {
    const data = await makeRequest(`${API_BASE}/opportunities`, 'POST', opportunityData);
    return data;
  } catch (error) {
    console.error('Error creating opportunity:', error);
    throw error;
  }
};

// Function to update an existing opportunity
export const updateOpportunity = async (id: number, nonprofitName: string, title: string, description: string, date: string, time: string, location: string, endTime?: string) => {
  const opportunityData = {
    nonprofit_name: nonprofitName,
    title,
    description,
    date,
    time,
    location,
    end_time: endTime
  };

  try {
    const data = await makeRequest(`${API_BASE}/opportunities/${id}`, 'PUT', opportunityData);
    return data;
  } catch (error) {
    console.error('Error updating opportunity:', error);
    throw error;
  }
};

// Function to delete an opportunity
export const deleteOpportunity = async (id: number) => {
  try {
    const data = await makeRequest(`${API_BASE}/opportunities/${id}`, 'DELETE');
    return data;
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    throw error;
  }
};

// Function to get opportunities near a location (updated to use JWT auth)
export const getNearbyOpportunities = async (location: string, radius: number = 25) => {
  try {
    const url = `${API_BASE}/opportunities/nearby?location=${encodeURIComponent(location)}&radius=${radius}`;
    const response = await fetchWithAuth(url, {
      method: 'GET',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'An error occurred');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching nearby opportunities:', error);
    throw error;
  }
};

// Function to get volunteers for a specific event
export const getEventVolunteers = async (eventId: number) => {
  try {
    const data = await makeRequest(`${API_BASE}/opportunities/${eventId}/volunteers`, 'GET');
    return data;
  } catch (error) {
    console.error('Error fetching event volunteers:', error);
    throw error;
  }
};

// Function to remove a volunteer from an event - using user ID as identifier
export const removeVolunteerFromEvent = async (eventId: number, userId: number) => {
  try {
    const data = await makeRequest(`${API_BASE}/opportunities/${eventId}/volunteers/${userId}`, 'DELETE');
    return data;
  } catch (error) {
    console.error('Error removing volunteer from event:', error);
    throw error;
  }
};