/**
 * Account page functionality
 */

// Require authentication
if (!API.requireAuth()) {
  // User will be redirected
}

let currentUser = null;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  Utils.updateNavigation();
  loadProfile();
  loadUserListings();
  attachEventListeners();
});

// Attach event listeners
function attachEventListeners() {
  document.getElementById('editProfileBtn').addEventListener('click', showEditForm);
  document.getElementById('cancelEditBtn').addEventListener('click', hideEditForm);
  document.getElementById('editProfileForm').addEventListener('submit', handleProfileUpdate);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  document.getElementById('deleteAccountBtn').addEventListener('click', handleDeleteAccount);
}

// Load user profile
async function loadProfile() {
  try {
    const result = await API.getProfile();
    currentUser = result.data;

    // Update profile display
    const fullName = `${currentUser.firstName} ${currentUser.lastName}`;
    const initials = `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase();

    document.getElementById('profileName').textContent = fullName;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profilePhone').textContent = currentUser.phone || 'No phone number';
    document.getElementById('profileAvatar').textContent = initials;

    // Populate edit form
    document.getElementById('editFirstName').value = currentUser.firstName;
    document.getElementById('editLastName').value = currentUser.lastName;
    document.getElementById('editEmail').value = currentUser.email;
    document.getElementById('editPhone').value = currentUser.phone || '';

  } catch (error) {
    console.error('Failed to load profile:', error);
    Utils.showToast('Failed to load profile. Please try logging in again.', 'error');
    setTimeout(() => API.logout(), 2000);
  }
}

// Load user's listings
async function loadUserListings() {
  const container = document.getElementById('userListings');
  const emptyState = document.getElementById('emptyListings');
  const countElement = document.getElementById('listingsCount');

  try {
    const result = await API.getUserListings();
    const listings = result.data || [];

    countElement.textContent = `${listings.length} listing${listings.length !== 1 ? 's' : ''}`;

    if (listings.length === 0) {
      container.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    container.innerHTML = listings.map(listing => {
      const price = Utils.formatPrice(listing.price);
      const category = Utils.formatCategory(listing.category);
      const condition = Utils.formatCondition(listing.condition);
      
      // Get image or use placeholder
      const hasImage = listing.images && listing.images.length > 0;
      const imageUrl = hasImage ? listing.images[0] : '';

      return `
        <div class="user-listing-card">
          ${hasImage ? `
            <div class="listing-image-preview">
              <img src="${imageUrl}" alt="${escapeHtml(listing.title)}" style="width: 100%; max-height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;">
            </div>
          ` : ''}
          
          <div class="listing-header">
            <div class="listing-title-group">
              <h4>${escapeHtml(listing.title)}</h4>
              <div class="listing-meta">
                <span class="badge">${category}</span>
                <span class="badge">${condition}</span>
                ${listing.isAvailable ? 
                  '<span class="badge success">Available</span>' : 
                  '<span class="badge danger">Sold</span>'
                }
              </div>
            </div>
            <div class="listing-price" style="font-size: 20px; font-weight: 700; color: var(--brand);">
              $${price}
            </div>
          </div>
          
          ${listing.description ? `
            <div class="listing-description">${escapeHtml(listing.description)}</div>
          ` : ''}
          
          <div class="listing-actions">
            <button class="btn btn-small" onclick="editListing(${listing.id})">Edit</button>
            <button class="btn btn-small" onclick="toggleAvailability(${listing.id}, ${listing.isAvailable})" 
                    style="background: #f59e0b;">
              Mark as ${listing.isAvailable ? 'Sold' : 'Available'}
            </button>
            <button class="btn btn-small danger" onclick="deleteListing(${listing.id})">Delete</button>
          </div>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Failed to load listings:', error);
    countElement.textContent = 'Failed to load';
    container.innerHTML = `
      <div class="text-center" style="padding: 20px;">
        <p class="text-muted">${API.getErrorMessage(error)}</p>
      </div>
    `;
  }
}

// Show edit profile form
function showEditForm() {
  document.getElementById('profileView').classList.add('hidden');
  document.getElementById('editProfileForm').classList.remove('hidden');
  document.getElementById('editProfileBtn').classList.add('hidden');
}

// Hide edit profile form
function hideEditForm() {
  document.getElementById('profileView').classList.remove('hidden');
  document.getElementById('editProfileForm').classList.add('hidden');
  document.getElementById('editProfileBtn').classList.remove('hidden');
  document.getElementById('profileMsg').className = 'msg hidden';
  
  // Reset form to current values
  if (currentUser) {
    document.getElementById('editFirstName').value = currentUser.firstName;
    document.getElementById('editLastName').value = currentUser.lastName;
    document.getElementById('editEmail').value = currentUser.email;
    document.getElementById('editPhone').value = currentUser.phone || '';
    document.getElementById('editPassword').value = '';
  }
}

// Handle profile update
async function handleProfileUpdate(e) {
  e.preventDefault();

  const firstName = document.getElementById('editFirstName').value.trim();
  const lastName = document.getElementById('editLastName').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  const phone = document.getElementById('editPhone').value.trim();
  const password = document.getElementById('editPassword').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const msgElement = document.getElementById('profileMsg');

  // Build updates object
  const updates = {};
  if (firstName !== currentUser.firstName) updates.firstName = firstName;
  if (lastName !== currentUser.lastName) updates.lastName = lastName;
  if (email !== currentUser.email) updates.email = email;
  if (phone !== (currentUser.phone || '')) updates.phone = phone || null;
  if (password) updates.password = password;

  // Check if anything changed
  if (Object.keys(updates).length === 0) {
    hideEditForm();
    return;
  }

  // Validate
  if (password && password.length < 8) {
    msgElement.textContent = 'Password must be at least 8 characters';
    msgElement.className = 'msg error';
    return;
  }

  try {
    msgElement.textContent = 'Saving changes...';
    msgElement.className = 'msg info';
    submitBtn.disabled = true;

    const result = await API.updateProfile(updates);
    currentUser = result.data;

    msgElement.textContent = 'Profile updated successfully!';
    msgElement.className = 'msg success';

    // Update display
    const fullName = `${currentUser.firstName} ${currentUser.lastName}`;
    const initials = `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase();
    document.getElementById('profileName').textContent = fullName;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profilePhone').textContent = currentUser.phone || 'No phone number';
    document.getElementById('profileAvatar').textContent = initials;

    setTimeout(() => {
      hideEditForm();
      submitBtn.disabled = false;
    }, 1500);

  } catch (error) {
    console.error('Failed to update profile:', error);
    msgElement.textContent = API.getErrorMessage(error);
    msgElement.className = 'msg error';
    submitBtn.disabled = false;
  }
}

// Edit listing
async function editListing(id) {
  try {
    const result = await API.getListing(id);
    const listing = result.data;

    const modalContent = `
      <form id="editListingForm" class="edit-listing-form">
        <div class="form-group">
          <label for="editTitle">Title *</label>
          <input type="text" id="editTitle" value="${escapeHtml(listing.title)}" 
                 required minlength="3" maxlength="200">
        </div>

        <div class="form-group">
          <label for="editDescription">Description *</label>
          <textarea id="editDescription" required minlength="10" maxlength="2000" rows="4"
          >${escapeHtml(listing.description)}</textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="editPrice">Price ($) *</label>
            <input type="number" id="editPrice" value="${listing.price}" 
                   required min="0" step="0.01">
          </div>

          <div class="form-group">
            <label for="editCondition">Condition *</label>
            <select id="editCondition" required>
              <option value="NEW" ${listing.condition === 'NEW' ? 'selected' : ''}>New</option>
              <option value="LIKE_NEW" ${listing.condition === 'LIKE_NEW' ? 'selected' : ''}>Like New</option>
              <option value="GOOD" ${listing.condition === 'GOOD' ? 'selected' : ''}>Good</option>
              <option value="FAIR" ${listing.condition === 'FAIR' ? 'selected' : ''}>Fair</option>
              <option value="USED" ${listing.condition === 'USED' ? 'selected' : ''}>Used</option>
            </select>
          </div>

          <div class="form-group">
            <label for="editCategory">Category *</label>
            <select id="editCategory" required>
              <option value="TEXTBOOKS" ${listing.category === 'TEXTBOOKS' ? 'selected' : ''}>Textbooks</option>
              <option value="ELECTRONICS" ${listing.category === 'ELECTRONICS' ? 'selected' : ''}>Electronics</option>
              <option value="FURNITURE" ${listing.category === 'FURNITURE' ? 'selected' : ''}>Furniture</option>
              <option value="CLOTHING" ${listing.category === 'CLOTHING' ? 'selected' : ''}>Clothing</option>
              <option value="SCHOOL_SUPPLIES" ${listing.category === 'SCHOOL_SUPPLIES' ? 'selected' : ''}>School Supplies</option>
              <option value="OTHER" ${listing.category === 'OTHER' ? 'selected' : ''}>Other</option>
            </select>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn">Save Changes</button>
          <button type="button" class="btn btn-outline" onclick="this.closest('.modal').remove()">Cancel</button>
        </div>

        <div id="editListingMsg" class="msg hidden"></div>
      </form>
    `;

    const modal = Utils.createModal('Edit Listing', modalContent);
    document.body.appendChild(modal);

    // Handle form submission
    document.getElementById('editListingForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const updates = {
        title: document.getElementById('editTitle').value.trim(),
        description: document.getElementById('editDescription').value.trim(),
        price: parseFloat(document.getElementById('editPrice').value),
        condition: document.getElementById('editCondition').value,
        category: document.getElementById('editCategory').value
      };

      const msgElement = document.getElementById('editListingMsg');
      const submitBtn = e.target.querySelector('button[type="submit"]');

      try {
        msgElement.textContent = 'Saving...';
        msgElement.className = 'msg info';
        submitBtn.disabled = true;

        await API.updateListing(id, updates);

        msgElement.textContent = 'Saved! Refreshing...';
        msgElement.className = 'msg success';

        setTimeout(async () => {
          document.body.removeChild(modal);
          await loadUserListings();
        }, 1000);

      } catch (error) {
        console.error('Failed to update listing:', error);
        msgElement.textContent = API.getErrorMessage(error);
        msgElement.className = 'msg error';
        submitBtn.disabled = false;
      }
    });

  } catch (error) {
    console.error('Failed to load listing:', error);
    Utils.showToast(API.getErrorMessage(error), 'error');
  }
}

// Toggle listing availability
async function toggleAvailability(id, currentlyAvailable) {
  const newStatus = !currentlyAvailable;

  try {
    await API.updateListing(id, { isAvailable: newStatus });
    Utils.showToast(`Listing marked as ${newStatus ? 'available' : 'sold'}!`, 'success');
    await loadUserListings();
  } catch (error) {
    console.error('Failed to update listing:', error);
    Utils.showToast(API.getErrorMessage(error), 'error');
  }
}

// Delete listing
async function deleteListing(id) {
  if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
    return;
  }

  try {
    await API.deleteListing(id);
    Utils.showToast('Listing deleted successfully!', 'success');
    await loadUserListings();
  } catch (error) {
    console.error('Failed to delete listing:', error);
    Utils.showToast(API.getErrorMessage(error), 'error');
  }
}

// Handle logout
function handleLogout() {
  if (confirm('Are you sure you want to log out?')) {
    API.logout();
  }
}

// Handle account deletion
async function handleDeleteAccount() {
  const confirmation = prompt(
    'This will permanently delete your account and all your listings. ' +
    'Type "DELETE" to confirm:'
  );

  if (confirmation !== 'DELETE') {
    return;
  }

  try {
    await API.deleteAccount();
    Utils.showToast('Account deleted successfully', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  } catch (error) {
    console.error('Failed to delete account:', error);
    Utils.showToast(API.getErrorMessage(error), 'error');
  }
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Make functions globally available
window.editListing = editListing;
window.toggleAvailability = toggleAvailability;
window.deleteListing = deleteListing;