// API Configuration
function getAPIBaseURL() {
  // In development, use proxy
  if (process.env.NODE_ENV === 'development') {
    return '/api/proxy';
  }
  
  // In production, use the public environment variable or fallback
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://3.37.138.131:8000';
}

const API_BASE_URL = getAPIBaseURL();

console.log('API Configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  API_BASE_URL,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL
});

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
    
    // In production, if the primary API fails, we might want to provide fallback data
    if (process.env.NODE_ENV === 'production' && error.message.includes('Network error')) {
      console.warn(`Primary API (${API_BASE_URL}) failed in production. Error:`, error.message);
      // You could implement fallback logic here if needed
    }
    
    throw error;
  }
}

