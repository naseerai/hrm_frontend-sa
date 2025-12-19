import { apiService } from './api.service';

class UserService {
  async getProfile() {
    return await apiService.request('getProfile', { method: 'GET' });
  }

  async getAllUsers() {
    return await apiService.request('getAllUsers', { method: 'GET' });
  }

  // UPDATED: Now accepts FormData directly (No JSON.stringify)
  async createUser(formData) {
    return await apiService.request('createUser', {
      method: 'POST',
      body: formData 
    });
  }

  async deleteUser(userId) {
    return await apiService.request('deleteUser', {
      method: 'DELETE',
      urlOverride: `/users/delete/${userId}`
    });
  }

  // UPDATED: Now accepts FormData directly
  async updateUser(userId, formData) {
    return await apiService.request('updateUser', {
      method: 'PUT',
      body: formData, 
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

  async resetUserPassword(userId) {
    return await apiService.request('resetUserPassword', {
      method: 'PUT',
      urlOverride: `/users/reset_password/${userId}`
    });
  }
}

export const userService = new UserService();