import { apiService } from './api.service';

class AttendanceService {
  
  // 1. IMAGE VALIDATION
  async validateImage(userId, imageFile) {
    const formData = new FormData();
    formData.append('image1', imageFile);
    // userId moved to query param as per previous fix
    const url = `http://72.61.233.104:9000/attendace/validate/images?user_id=${userId}`;

    let token = localStorage.getItem('access_token');
    if (token) token = token.replace(/^"|"$/g, ''); 

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { ...(token && { 'Authorization': `Bearer ${token}` }) },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) throw new Error("Session Expired");
        throw new Error(data.detail || 'Image validation failed');
      }
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 2. CHECK IN
  async markCheckIn(userId, time) {
    return await apiService.request('checkIn', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, check_in_time: time })
    });
  }

  // 3. CHECK OUT
  async markCheckOut(userId, time) {
    return await apiService.request('checkOut', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, check_out_time: time })
    });
  }

  // 4. GET TODAY STATUS
  async getTodayStatus(userId, date) {
    return await apiService.request('getTodayAttendance', {
      method: 'GET',
      urlOverride: `/attendace/get_attendance/${userId}/${date}`
    });
  }

  // 5. GET TEAM ANALYSIS
  async getTeamAnalysis(date) {
    return await apiService.request('getTeamAttendanceAnalysis', {
      method: 'GET',
      urlOverride: `/attendace/hr/attendance/analysis/${date}`
    });
  }

  // 6. NEW: UPDATE ATTENDANCE (HR Correction)
  async updateAttendance(payload) {
    return await apiService.request('updateAttendance', {
      method: 'PATCH', // or PATCH depending on backend, keeping POST as per user input
      body: JSON.stringify(payload)
    });
  }
}

export const attendanceService = new AttendanceService();