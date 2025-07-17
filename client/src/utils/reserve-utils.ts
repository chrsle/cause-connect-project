const API_BASE = "http://causeconnectbackend.onrender.com/api";

// Utility function for authenticated API requests
const makeRequest = async (url: string, method: 'GET' | 'POST' | 'DELETE', data?: any) => {
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
