import { apiService } from './api.service';

class UserService {
  async getProfile() {
    return await apiService.request('getProfile', { method: 'GET' });
  }

  async getAllUsers() {
    return await apiService.request('getAllUsers', { method: 'GET' });
  }

  async createUser(userData) {
    return await apiService.request('createUser', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async deleteUser(userId) {
    return await apiService.request('deleteUser', {
      method: 'DELETE',
      urlOverride: `/users/delete/${userId}`
    });
  }

  async updateUser(userId, userData) {
    return await apiService.request('updateUser', {
      method: 'PATCH',
      body: JSON.stringify(userData),
      urlOverride: `/users/update/${userId}`
    });
  }

  async changePassword(userId, newPassword) {
    return await apiService.request('changePassword', {
      method: 'PUT',
      body: JSON.stringify({ user_id: userId, new_password: newPassword })
    });
  }

  async getTeamLeads() {
    return await apiService.request('getTeamLeads', { method: 'GET' });
  }

  // --- NEW: Admin Reset Password ---
  async resetUserPassword(userId) {
    return await apiService.request('resetUserPassword', {
      method: 'PUT', // Assuming PUT since it updates resource, check with backend if POST
      urlOverride: `/users/reset_password/${userId}`
    });
  }
}

export const userService = new UserService();