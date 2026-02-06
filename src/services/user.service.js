import { apiService } from './api.service';

class UserService {
  async getProfile() {
    return await apiService.request('getProfile', { method: 'GET' });
  }

  async getAllUsers() {
    return await apiService.request('getAllUsers', { method: 'GET' });
  }

  // --- UPDATED: Create User uses specific IP ---
  async createUser(formData) {
    return await apiService.request('createUser', {
      method: 'POST',
      body: formData,
      // Direct IP Address Override
      urlOverride: 'https://hrm-backend.wapsend.in/users/create/user'
    });
  }

  async deleteUser(userId) {
    return await apiService.request('deleteUser', {
      method: 'DELETE',
      urlOverride: `/users/delete/${userId}`
    });
  }

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