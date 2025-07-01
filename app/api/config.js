// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? '/api/proxy'  // Use proxy in development
  : (process.env.API_BASE_URL || 'http://localhost:8000'); // Direct URL in production

// Helper function to make API requests
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    mode: 'cors', // Enable CORS
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    console.log(`Making API request to: ${url}`); // Debug log
    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`API response from ${endpoint}:`, data); // Debug log
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    
    // Provide more specific error messages
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Network error: Unable to connect to ${API_BASE_URL}. Please check if the API server is running and accessible.`);
    }
    
    throw error;
  }
}

