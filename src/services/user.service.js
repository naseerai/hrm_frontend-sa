import { apiService } from './api.service';

class UserService {
  async getAllUsers() {
    return await apiService.request('getAllUsers', {
      method: 'GET'
    });
  }

  // Add more user-related methods here
  async getUserById(userId) {
    // Example for future implementation
    return await apiService.request('getUserById', {
      method: 'GET'
    });
  }

  async updateUser(userId, userData) {
    // Example for future implementation
    return await apiService.request('updateUser', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }
}

// Export singleton instance
export const userService = new UserService();