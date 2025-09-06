// API Configuration
function getAPIBaseURL() {
  // Always use the Next.js API proxy to avoid CORS issues
  return '/api/proxy';
}

const API_BASE_URL = getAPIBaseURL();

console.log('API Configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  API_BASE_URL,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL
});

// Helper function to make API requests
export async function apiRequest(endpoint, options = {}) {
  // Use the proxy route with endpoint as query parameter
  const url = `${API_BASE_URL}?endpoint=${encodeURIComponent(endpoint)}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    console.log(`Making API request via proxy to: ${endpoint}`, { options: mergedOptions }); // Debug log
    
    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(url, {
      ...mergedOptions,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`API Error ${response.status}:`, errorData);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
    }
    
    const data = await response.json();
    console.log(`API response from ${endpoint}:`, data); // Debug log
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    
    // Handle different types of errors
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout: The API server did not respond within 15 seconds.`);
    }
    
    if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      throw new Error(`Network error: Unable to connect to the API server. Please check your internet connection.`);
    }
    
    // Provide fallback data for specific endpoints in case of persistent errors
    if (endpoint === '/my-post-list') {
      console.log('API failed for my-post-list, returning fallback empty data');
      return {
        status: 'success',
        posts: [],
        message: 'Using fallback data - API server temporarily unavailable'
      };
    }
    
    if (endpoint === '/post-list') {
      console.log('API failed for post-list, returning fallback empty data');
      return {
        status: 'success',
        posts: [],
        message: 'Using fallback data - API server temporarily unavailable'
      };
    }
    
    throw error;
  }
}

