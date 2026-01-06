class ApiService {
  constructor() {
    this.baseURL = 'https://hrm-backend-q7xc.onrender.com';
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
      resetUserPassword: '/users/reset_password',
      
      // Leave Endpoints
      getYearlyStats: '/leaves/users', 
      getMonthlyStats: '/leaves/users',
      applyLeave: '/leaves/apply',
      getAllApplications: '/leaves/all/applications',
      getLeaveDetails: '/leaves/get/leave_application/details/',
      getUserLeaveHistory: '/leaves/get/user/leaves/',
      reviewLeave: '/leaves/applications',

      // --- PERMISSION ENDPOINTS ---
      applyPermission: '/leaves/permission/apply/', 
      reviewPermission: '/leaves/permission/review/', 

      // ATTENDANCE
      checkIn: '/attendace/checkin',
      checkOut: '/attendace/checkout',
      getTodayAttendance: '/attendace/get_attendance',
      getTeamAttendanceAnalysis: '/attendace/hr/attendance/analysis/',
      updateAttendance: '/attendace/hr/attendance/update' 
    };
  }

  getURL(endpointKey) {
    return `${this.baseURL}${this.endpoints[endpointKey]}`;
  }

  async request(endpointKey, options = {}) {
    // --- CHANGED LOGIC START ---
    // If urlOverride starts with 'http', use it directly. Otherwise, append to baseURL.
    let url;
    if (options.urlOverride && options.urlOverride.startsWith('http')) {
        url = options.urlOverride;
    } else {
        url = options.urlOverride 
        ? `${this.baseURL}${options.urlOverride}` 
        : this.getURL(endpointKey);
    }
    // --- CHANGED LOGIC END ---

    let token = localStorage.getItem('access_token');
    if (token) token = token.replace(/^"|"$/g, '');

    const { urlOverride, ...fetchOptions } = options;

    const headers = { ...options.headers };

    // Handle FormData vs JSON content type automatically
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { ...fetchOptions, headers };

    try {
      const response = await fetch(url, config);

      if (response.status === 204) return { success: true };

      if (response.status === 401 && endpointKey !== 'login') {
         localStorage.clear(); 
         window.location.href = '/'; 
         return { success: false, error: 'Session Expired' };
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || 'Request failed');
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export const apiService = new ApiService();