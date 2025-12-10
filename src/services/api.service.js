class ApiService {
  constructor() {
    // OLD: this.baseURL = 'https://estela-hookier-rusticly.ngrok-free.dev';
    
    // NEW: Backend developer ichina IP address ikkada pettandi
    this.baseURL = 'http://72.61.233.104:9000'; 
    
    this.endpoints = {
      // Endpoint path already correct ga undi '/login/users'
      login: '/login/users',
      getAllUsers: '/users/allusers'
    };
  }

  // Method to update base URL easily
  setBaseURL(newBaseURL) {
    this.baseURL = newBaseURL;
  }

  // Method to update specific endpoint
  updateEndpoint(key, newPath) {
    this.endpoints[key] = newPath;
  }

  // Get complete URL
  getURL(endpointKey) {
    return `${this.baseURL}${this.endpoints[endpointKey]}`;
  }

  // Generic request handler
  async request(endpointKey, options = {}) {
    const url = this.getURL(endpointKey);
    const token = localStorage.getItem('access_token');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      return { success: true, data };
    } catch (error) {
      console.error("API Error:", error);
      return { success: false, error: error.message };
    }
  }
}

export const apiService = new ApiService();