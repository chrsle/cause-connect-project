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

// Utility function for authenticated API requests
const makeRequest = async (url: string, method: 'GET' | 'POST' | 'DELETE', data?: any) => {
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

// Sign up (volunteer) for an opportunity
export const volunteerForOpportunity = async (opportunityId: number) => {
  try {
    const data = await makeRequest(`${API_BASE}/events/volunteer`, 'POST', {
      opportunity_id: opportunityId,
    });

    console.log('Volunteer signup response:', data);
    return data;
  } catch (error) {
    console.error('Error signing up for opportunity:', error);
    throw error;
  }
};

// Get all opportunities a user has signed up for
export const getVolunteeredOpportunities = async () => {
  try {
    const data = await makeRequest(`${API_BASE}/events/volunteered`, 'GET');
    return data;
  } catch (error) {
    console.error('Error fetching volunteered opportunities:', error);
    throw error;
  }
};

// Cancel signup for an opportunity
export const cancelVolunteerSignup = async (opportunityId: number) => {
  try {
    const data = await makeRequest(`${API_BASE}/events/volunteer/cancel/${opportunityId}`, 'DELETE');
    return data;
  } catch (error) {
    console.error('Error canceling signup:', error);
    throw error;
  }
};

// Get all volunteers for a specific opportunity (admin/nonprofit view)
export const getVolunteersForOpportunity = async (opportunityId: number) => {
  try {
    const data = await makeRequest(`${API_BASE}/events/opportunity/${opportunityId}/volunteers`, 'GET');
    return data;
  } catch (error) {
    console.error('Error fetching volunteers for opportunity:', error);
    throw error;
  }
};