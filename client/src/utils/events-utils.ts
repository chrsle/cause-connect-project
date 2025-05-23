const API_BASE = "http://localhost:5001/api";



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
export const createOpportunity = async (nonprofitName: string, title: string, description: string, date: string, time: string, location: string) => {
  const opportunityData = {
    nonprofit_name: nonprofitName,
    title,
    description,
    date,
    time,
    location
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
export const updateOpportunity = async (id: number, nonprofitName: string, title: string, description: string, date: string, time: string, location: string) => {
  const opportunityData = {
    nonprofit_name: nonprofitName,
    title,
    description,
    date,
    time,
    location
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
