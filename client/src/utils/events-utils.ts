const API_BASE = "http://causeconnectbackend.onrender.com:5001/api";

// Utility function to make API calls with authentication token
const makeRequest = async (url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: any) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const requestOptions: RequestInit = {
    method,
    headers,
    credentials: 'include', 
    body: data ? JSON.stringify(data) : undefined,
  };

  try {
    const response = await fetch(url, requestOptions);

    // Handle non-200 status codes
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

// Function to get opportunities near a location (without authentication for students)
export const getNearbyOpportunities = async (location: string, radius: number = 25) => {
  try {
    const url = `${API_BASE}/opportunities/nearby?location=${encodeURIComponent(location)}&radius=${radius}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
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