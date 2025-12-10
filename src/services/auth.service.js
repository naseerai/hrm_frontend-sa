import { apiService } from './api.service';

class AuthService {
  // 1. LOGIN METHOD
  async login(email, password) {
    const result = await apiService.request('login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (result.success) {
      // Backend response nundi data teesukuntunnam
      const data = result.data;
      
      // Token key backend batti maarochu (access_token, token, access etc.)
      // Manam anni check chestunnam safe side ki
      const accessToken = data.access_token || data.token || data.access;
      const user = data.user || { email }; // User object lekapote email tho create chestam

      if (accessToken) {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user };
      }
    }
    
    return result;
  }

  // 2. LOGOUT METHOD
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('token_type');
    localStorage.removeItem('expires_in');
  }

  // 3. GET CURRENT USER
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // 4. IS AUTHENTICATED (Idi missing valla error vachindi)
  isAuthenticated() {
    const token = localStorage.getItem('access_token');
    return !!token; // Token unte true, lekapote false return chestundi
  }

  // 5. GET TOKEN
  getToken() {
    return localStorage.getItem('access_token');
  }
}

// Export singleton instance
export const authService = new AuthService();