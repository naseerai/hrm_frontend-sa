import { apiService } from './api.service';

class LeaveService {
  async getYearlyStats(userId, year) {
    return await apiService.request('getYearlyStats', {
      method: 'GET',
      urlOverride: `/leaves/users/${userId}/year/${year}/` 
    });
  }

  async getMonthlyStats(userId) {
    return await apiService.request('getMonthlyStats', {
      method: 'GET',
      urlOverride: `/leaves/users/${userId}/month/` 
    });
  }

  async applyLeave(payload) {
    return await apiService.request('applyLeave', {
      method: 'POST',
      body: JSON.stringify(payload),
      urlOverride: '/leaves/apply'
    });
  }

  // --- NEW: Apply Permission ---
  async applyPermission(userId, payload) {
    return await apiService.request('applyPermission', {
      method: 'POST',
      body: JSON.stringify(payload),
      urlOverride: `/leaves/permission/apply/${userId}`
    });
  }

  async getAllApplications() {
    return await apiService.request('getAllApplications', {
      method: 'GET',
      urlOverride: '/leaves/all/applications' 
    });
  }

  async reviewLeave(applicationId, reviewerId, decisions) {
    const payload = {
        reviewer_id: reviewerId,
        decisions: decisions 
    };
    return await apiService.request('reviewLeave', {
      method: 'POST',
      body: JSON.stringify(payload),
      urlOverride: `/leaves/applications/${applicationId}/bulk-review`
    });
  }

  // --- NEW: Review Permission ---
  async reviewPermission(reviewerId, permissionId, action, comment) {
    const payload = {
        permission_id: permissionId,
        action: action, // 'approve' or 'reject'
        reviewer_comment: comment
    };
    return await apiService.request('reviewPermission', {
      method: 'POST',
      body: JSON.stringify(payload),
      urlOverride: `/leaves/permission/review/${reviewerId}`
    });
  }

  async getLeaveApplicationDetails(applicationId) {
    return await apiService.request('getLeaveDetails', {
      method: 'GET',
      urlOverride: `/leaves/get/leave_application/details/?leave_application_id=${applicationId}`
    });
  }

  async getUserLeaveHistory(userId) {
    return await apiService.request('getUserLeaveHistory', {
      method: 'GET',
      urlOverride: `/leaves/get/user/leaves/${userId}`
    });
  }
}

export const leaveService = new LeaveService();