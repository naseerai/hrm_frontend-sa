class ApiService {
  constructor() {
    this.baseURL = 'http://72.61.233.104:9000';
    this.endpoints = {
      login: '/login/users',
      getAllUsers: '/users/allusers',
      getProfile: '/users/user/profile',
      createUser: '/users/create/user',
      deleteUser: '/users/delete',
      updateUser: '/users/update',
      changePassword: '/users/change_password',
      getTeamLeads: '/users/team/leads',
      createJob: '/careers/create/job',
      getInternalJobs: '/careers/list/internal/jobs',
      getExternalJobs: '/careers/list/external/jobs',
      resetUserPassword: '/users/reset_password'
    };
  }

  getURL(endpointKey) {
    return `${this.baseURL}${this.endpoints[endpointKey]}`;
  }

  async request(endpointKey, options = {}) {
    const url = options.urlOverride 
      ? `${this.baseURL}${options.urlOverride}` 
      : this.getURL(endpointKey);

    let token = localStorage.getItem('access_token');
    if (token) token = token.replace(/^"|"$/g, '');

    const { urlOverride, ...fetchOptions } = options;

    const headers = {
      ...options.headers
    };

    // FIX: If body is FormData (Image Upload), DO NOT set Content-Type to JSON
    // Browser will automatically set 'multipart/form-data' with boundary
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { ...fetchOptions, headers };

    try {
      const response = await fetch(url, config);

      if (response.status === 204) {
        return { success: true };
      }

      if (response.status === 401) {
        if (endpointKey !== 'login') {
            console.warn("Session Expired. Auto logging out...");
            localStorage.clear(); 
            window.location.href = '/'; 
            return { success: false, error: 'Session Expired' };
        }
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Request failed');
      }
      return { success: true, data };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export const apiService = new ApiService();