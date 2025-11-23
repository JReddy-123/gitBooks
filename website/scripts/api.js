/**
 * API Client for GitBooks & More
 * Handles all communication with the backend API
 */

const API_BASE_URL = 'http://localhost:3001/api';

const TOKEN_KEY = 'gbm_token';
const USER_KEY = 'gbm_user';

class APIClient {
  // ==================== Token Management ====================
  
  static getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  static setAuth(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  static clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  static getCurrentUser() {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static isAuthenticated() {
    return !!this.getToken();
  }

  // ==================== Base Fetch Method ====================
  
  static async fetchAPI(endpoint, options = {}) {
    const token = this.getToken();
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    };

    // Add auth token if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        data = { 
          success: false, 
          error: `Server error (${response.status})` 
        };
      }

      if (!response.ok) {
        let errorMessage = data.error || data.message || 'Request failed';
        
        if (data.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors.join(', ');
        }
        
        // Add status code context
        if (response.status === 400) {
          errorMessage = `Validation error: ${errorMessage}`;
        } else if (response.status === 401) {
          errorMessage = errorMessage || 'Invalid credentials';
          // Clear auth on 401
          this.clearAuth();
        } else if (response.status === 403) {
          errorMessage = errorMessage || 'Access denied';
        } else if (response.status === 404) {
          errorMessage = errorMessage || 'Not found';
        } else if (response.status === 409) {
          errorMessage = errorMessage || 'Conflict - item already exists';
        } else if (response.status === 429) {
          errorMessage = 'Too many requests - please wait and try again';
        } else if (response.status >= 500) {
          errorMessage = `Server error: ${errorMessage}`;
        }
        
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API Error:', {
        endpoint,
        message: error.message,
        status: error.status,
        data: error.data
      });
      
      if (error.message === 'Failed to fetch') {
        const networkError = new Error(
          'Cannot connect to server. Please check if the backend is running on port 3001.'
        );
        networkError.originalError = error;
        throw networkError;
      }
      
      throw error;
    }
  }

  // ==================== Auth Endpoints ====================
  
  static async signup(email, password, firstName, lastName, phone = null) {
    const result = await this.fetchAPI('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName, phone })
    });
    
    if (result.data?.accessToken) {
      this.setAuth(result.data.accessToken, result.data.user);
    }
    return result;
  }

  static async login(email, password) {
    const result = await this.fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (result.data?.accessToken) {
      this.setAuth(result.data.accessToken, result.data.user);
    }
    return result;
  }

  static logout() {
    this.clearAuth();
    window.location.href = '/pages/index.html';
  }

  // ==================== User Endpoints ====================
  
  static async getProfile() {
    return await this.fetchAPI('/users/me');
  }

  static async updateProfile(updates) {
    const result = await this.fetchAPI('/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    
    // Update stored user data
    if (result.data) {
      const currentToken = this.getToken();
      this.setAuth(currentToken, result.data);
    }
    
    return result;
  }

  static async deleteAccount() {
    await this.fetchAPI('/users/me', {
      method: 'DELETE'
    });
    this.clearAuth();
  }

  static async getUserListings() {
    return await this.fetchAPI('/users/me/listings');
  }

  // ==================== Listing Endpoints ====================
  
  static async getListings(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.condition) params.append('condition', filters.condition);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const queryString = params.toString();
    const endpoint = queryString ? `/listings?${queryString}` : '/listings';
    
    return await this.fetchAPI(endpoint);
  }

  static async getListing(id) {
    return await this.fetchAPI(`/listings/${id}`);
  }

  static async createListing(listingData) {
    return await this.fetchAPI('/listings', {
      method: 'POST',
      body: JSON.stringify(listingData)
    });
  }

  static async updateListing(id, updates) {
    return await this.fetchAPI(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  static async deleteListing(id) {
    return await this.fetchAPI(`/listings/${id}`, {
      method: 'DELETE'
    });
  }

  // ==================== Helper Methods ====================
  
  static requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/pages/signup.html';
      return false;
    }
    return true;
  }

  static getErrorMessage(error) {
    const message = error.message || 'An error occurred';
    
    const errorMappings = {
      'Listing not found': 'This listing no longer exists',
      'Forbidden': 'You do not have permission to perform this action',
      'Not authenticated': 'Please log in again',
      'Cannot connect to server': 'Unable to connect to the server. Please check if the backend is running.',
      'Email already in use': 'This email is already registered',
      'Invalid credentials': 'Incorrect email or password',
    };
    
    for (const [pattern, friendlyMessage] of Object.entries(errorMappings)) {
      if (message.includes(pattern)) {
        return friendlyMessage;
      }
    }
    
    return message;
  }
}

// Export for use in other files
window.API = APIClient;