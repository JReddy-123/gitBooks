// Check authentication
if (!API.requireAuth()) {
  // User will be redirected to signup page
}

// Helper function for user-friendly error messages
function getErrorMessage(error) {
  const message = error.message || 'An error occurred';
  
  const errorMappings = {
    'Listing not found': 'This listing no longer exists',
    'Forbidden': 'You do not have permission to modify this listing',
    'Not authenticated': 'Please log in again',
    'Cannot connect to server': 'Unable to connect to the server. Please check if the backend is running.',
    'Title must be between 3 and 200 characters': 'Title must be between 3 and 200 characters',
    'Description must be between 10 and 2000 characters': 'Description must be between 10 and 2000 characters',
    'Price must be 0 or greater': 'Price must be a positive number',
  };
  
  for (const [pattern, friendlyMessage] of Object.entries(errorMappings)) {
    if (message.includes(pattern)) {
      return friendlyMessage;
    }
  }
  
  return message;
}

// DOM elements
const listEl = document.getElementById('list');
const emptyEl = document.getElementById('empty');
const countEl = document.getElementById('count');

// Load user's listings from backend
async function loadMyListings() {
  try {
    countEl.textContent = 'Loading...';
    emptyEl.style.display = 'none';
    
    const result = await API.getUserListings();
    const listings = result.data || [];
    
    // Update count
    countEl.textContent = `${listings.length} listing${listings.length !== 1 ? 's' : ''}`;
    
    if (listings.length === 0) {
      emptyEl.style.display = 'block';
      emptyEl.textContent = 'You have no listings yet. Create your first listing!';
      listEl.innerHTML = '';
      return;
    }
    
    emptyEl.style.display = 'none';
    
    // Render listings
    listEl.innerHTML = listings.map(listing => {
      const price = parseFloat(listing.price).toFixed(2);
      const categoryDisplay = listing.category.replace(/_/g, ' ').toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase());
      
      return `
        <article class="card">
          <div class="thumb">${categoryDisplay}</div>
          <div class="content">
            <div style="font-weight:600">${listing.title}</div>
            <div class="row">
              <span class="chip">${categoryDisplay}</span>
              <span class="chip">${listing.condition.replace(/_/g, ' ')}</span>
              ${listing.isAvailable ? 
                '<span class="chip" style="background: #10b981; color: white;">Available</span>' : 
                '<span class="chip" style="background: #ef4444; color: white;">Sold</span>'
              }
            </div>
            <div class="price">$${price}</div>
            <div class="description" style="color: #666; font-size: 0.9rem; margin: 8px 0;">
              ${listing.description.substring(0, 100)}${listing.description.length > 100 ? '...' : ''}
            </div>
            <div class="actions">
              <button class="btn btn-edit" data-id="${listing.id}">Edit</button>
              <button class="btn btn-toggle" data-id="${listing.id}" data-available="${listing.isAvailable}">
                Mark as ${listing.isAvailable ? 'Sold' : 'Available'}
              </button>
              <button class="btn danger btn-delete" data-id="${listing.id}">Delete</button>
            </div>
          </div>
        </article>
      `;
    }).join('');
    
    // Add event listeners
    attachEventListeners();
    
  } catch (error) {
    console.error('Failed to load listings:', error);
    countEl.textContent = 'Failed to load listings';
    emptyEl.style.display = 'block';
    emptyEl.textContent = getErrorMessage(error);
    listEl.innerHTML = '';
  }
}

// Attach event listeners to buttons
function attachEventListeners() {
  // Edit buttons
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => editListing(btn.dataset.id));
  });
  
  // Toggle availability buttons
  document.querySelectorAll('.btn-toggle').forEach(btn => {
    btn.addEventListener('click', () => toggleAvailability(btn.dataset.id, btn.dataset.available === 'true'));
  });
  
  // Delete buttons
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => deleteListing(btn.dataset.id));
  });
}

// Edit listing
async function editListing(id) {
  try {
    const result = await API.getListing(id);
    const listing = result.data;
    
    // Create edit modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>Edit Listing</h2>
        <form id="edit-listing-form">
          <label>
            Title *
            <input type="text" id="edit-title" value="${listing.title}" required minlength="3" maxlength="200">
          </label>
          <label>
            Description *
            <textarea id="edit-description" required minlength="10" maxlength="2000">${listing.description}</textarea>
          </label>
          <label>
            Price *
            <input type="number" id="edit-price" value="${listing.price}" min="0" step="0.01" required>
          </label>
          <label>
            Condition *
            <select id="edit-condition" required>
              <option value="NEW" ${listing.condition === 'NEW' ? 'selected' : ''}>New</option>
              <option value="LIKE_NEW" ${listing.condition === 'LIKE_NEW' ? 'selected' : ''}>Like New</option>
              <option value="GOOD" ${listing.condition === 'GOOD' ? 'selected' : ''}>Good</option>
              <option value="FAIR" ${listing.condition === 'FAIR' ? 'selected' : ''}>Fair</option>
              <option value="USED" ${listing.condition === 'USED' ? 'selected' : ''}>Used</option>
            </select>
          </label>
          <div class="modal-actions">
            <button type="submit" class="btn">Save Changes</button>
            <button type="button" class="btn btn-cancel">Cancel</button>
          </div>
          <div class="modal-message"></div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('edit-listing-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const messageDiv = modal.querySelector('.modal-message');
      const submitBtn = modal.querySelector('button[type="submit"]');
      
      const updates = {
        title: document.getElementById('edit-title').value.trim(),
        description: document.getElementById('edit-description').value.trim(),
        price: parseFloat(document.getElementById('edit-price').value),
        condition: document.getElementById('edit-condition').value
      };
      
      // Validation
      if (updates.title.length < 3 || updates.title.length > 200) {
        messageDiv.textContent = 'Title must be between 3 and 200 characters';
        messageDiv.style.color = '#dc2626';
        return;
      }
      
      if (updates.description.length < 10 || updates.description.length > 2000) {
        messageDiv.textContent = 'Description must be between 10 and 2000 characters';
        messageDiv.style.color = '#dc2626';
        return;
      }
      
      if (updates.price < 0) {
        messageDiv.textContent = 'Price must be a positive number';
        messageDiv.style.color = '#dc2626';
        return;
      }
      
      try {
        messageDiv.textContent = 'Saving...';
        messageDiv.style.color = '#666';
        submitBtn.disabled = true;
        
        await API.updateListing(id, updates);
        
        messageDiv.textContent = 'Saved! Refreshing...';
        messageDiv.style.color = '#059669';
        
        setTimeout(async () => {
          document.body.removeChild(modal);
          await loadMyListings();
        }, 1000);
        
      } catch (error) {
        console.error('Failed to update listing:', error);
        messageDiv.textContent = getErrorMessage(error);
        messageDiv.style.color = '#dc2626';
        submitBtn.disabled = false;
      }
    });
    
    // Handle cancel
    modal.querySelector('.btn-cancel').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
    
  } catch (error) {
    console.error('Failed to load listing details:', error);
    alert(`Unable to load listing: ${getErrorMessage(error)}`);
  }
}

// Toggle listing availability
async function toggleAvailability(id, currentlyAvailable) {
  const newStatus = !currentlyAvailable;
  const statusText = newStatus ? 'available' : 'sold';
  
  try {
    await API.updateListing(id, { isAvailable: newStatus });
    await loadMyListings();
    
    // Show success message briefly
    const tempMsg = document.createElement('div');
    tempMsg.textContent = `Listing marked as ${statusText}!`;
    tempMsg.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
    `;
    document.body.appendChild(tempMsg);
    setTimeout(() => tempMsg.remove(), 3000);
    
  } catch (error) {
    console.error('Failed to update listing status:', error);
    alert(`Failed to update status: ${getErrorMessage(error)}`);
  }
}

// Delete listing
async function deleteListing(id) {
  if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
    return;
  }
  
  try {
    await API.deleteListing(id);
    await loadMyListings();
    
    // Show success message briefly
    const tempMsg = document.createElement('div');
    tempMsg.textContent = 'Listing deleted successfully!';
    tempMsg.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #059669;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
    `;
    document.body.appendChild(tempMsg);
    setTimeout(() => tempMsg.remove(), 3000);
    
  } catch (error) {
    console.error('Failed to delete listing:', error);
    alert(`Failed to delete listing: ${getErrorMessage(error)}`);
  }
}

// Add modal styles
const style = document.createElement('style');
style.textContent = `
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
    z-index: 1000;
  }
  
  .modal-content {
    background: white;
    border-radius: 14px;
    padding: 24px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
  }
  
  .modal-content h2 {
    margin-top: 0;
  }
  
  .modal-content label {
    display: block;
    margin-bottom: 12px;
    font-weight: 600;
  }
  
  .modal-content input,
  .modal-content textarea,
  .modal-content select {
    width: 100%;
    padding: 8px;
    margin-top: 4px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
  }
  
  .modal-content textarea {
    min-height: 100px;
    resize: vertical;
  }
  
  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 20px;
  }
  
  .btn-cancel {
    background: #e5e7eb;
    color: #111;
  }
  
  .btn-toggle {
    background: #f59e0b;
    color: white;
  }
  
  .description {
    margin: 8px 0;
  }
  
  .chip {
    display: inline-block;
    margin-right: 8px;
    margin-bottom: 8px;
  }
  
  .modal-message {
    margin-top: 12px;
    font-size: 0.9rem;
  }
`;
document.head.appendChild(style);

// Load listings on page load
document.addEventListener('DOMContentLoaded', loadMyListings);