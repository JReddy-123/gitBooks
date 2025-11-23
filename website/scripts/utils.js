const Utils = {
  // Format price to 2 decimal places
  formatPrice(price) {
    return parseFloat(price).toFixed(2);
  },

  // Format category for display
  formatCategory(category) {
    return category.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  },

  // Format condition for display
  formatCondition(condition) {
    return condition.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  },

  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Show toast notification
  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // Category mapping (frontend to backend)
  categoryMap: {
    'Textbooks': 'TEXTBOOKS',
    'Electronics': 'ELECTRONICS',
    'Furniture': 'FURNITURE',
    'Clothing': 'CLOTHING',
    'School Supplies': 'SCHOOL_SUPPLIES',
    'Other': 'OTHER'
  },

  // Reverse category mapping (backend to frontend)
  categoryMapReverse: {
    'TEXTBOOKS': 'Textbooks',
    'ELECTRONICS': 'Electronics',
    'FURNITURE': 'Furniture',
    'CLOTHING': 'Clothing',
    'SCHOOL_SUPPLIES': 'School Supplies',
    'OTHER': 'Other'
  },

  // Condition options
  conditions: ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'USED'],

  // Update navigation based on auth state
  updateNavigation() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    const accountLink = nav.querySelector('a[href*="signup.html"]');
    
    if (API.isAuthenticated()) {
      const user = API.getCurrentUser();
      if (user && accountLink) {
        accountLink.textContent = `Hi, ${user.firstName}`;
        accountLink.href = '/pages/account.html';
      }
    } else {
      if (accountLink) {
        accountLink.textContent = 'Account';
        accountLink.href = '/pages/signup.html';
      }
    }
  },

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /@(uncc\.edu|charlotte\.edu|student\.edu)$/i;
    return emailRegex.test(email);
  },

  // Convert file to data URL
  async fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Create modal
  createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
      </div>
    `;

    // Close on X button
    modal.querySelector('.modal-close').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });

    return modal;
  }
};

// Add toast animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .modal-content {
    background: white;
    border-radius: 14px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: #6b7280;
    line-height: 1;
    padding: 0;
    width: 32px;
    height: 32px;
  }

  .modal-close:hover {
    color: #111;
  }

  .modal-body {
    padding: 24px;
  }
`;
document.head.appendChild(style);

window.Utils = Utils;