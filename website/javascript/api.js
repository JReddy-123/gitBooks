// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Token management
const TOKEN_KEY = 'gbm_token';
const USER_KEY = 'gbm_user';

class APIClass {
  // Get stored token
  static getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Store token and user data
  static setAuth(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  // Clear authentication
  static clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // Get current user
  static getCurrentUser() {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Base fetch wrapper with auth headers and improved error handling
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
      
      // Try to parse response as JSON
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, create a generic error object
        data = { 
          success: false, 
          error: `Server error (${response.status})` 
        };
      }

      if (!response.ok) {
        // Extract error message from different possible formats
        let errorMessage = data.error || data.message || 'Request failed';
        
        // If there are validation errors, combine them
        if (data.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors.join(', ');
        }
        
        // Add status code context for common errors
        if (response.status === 400) {
          errorMessage = `Validation error: ${errorMessage}`;
        } else if (response.status === 401) {
          errorMessage = errorMessage || 'Invalid credentials';
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
      // Log error for debugging
      console.error('API Error:', {
        endpoint,
        message: error.message,
        status: error.status,
        data: error.data
      });
      
      // Re-throw with better message if it's a network error
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

  // ============== AUTH ENDPOINTS ==============
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
    window.location.href = '/index.html';
  }

  // ============== USER ENDPOINTS ==============
  static async getProfile() {
    return await this.fetchAPI('/users/me');
  }

  static async updateProfile(updates) {
    return await this.fetchAPI('/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
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

  // ============== LISTING ENDPOINTS ==============
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

  // ============== HELPER METHODS ==============
  static isAuthenticated() {
    return !!this.getToken();
  }

  static requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/signup.html';
      return false;
    }
    return true;
  }
}

// Export for use in other files
window.API = APIClass;