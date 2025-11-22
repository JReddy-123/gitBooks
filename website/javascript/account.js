// Check authentication
if (!API.requireAuth()) {
  // User will be redirected to signup page
}

// DOM Elements
const editBtn = document.getElementById("edit-btn");
const editForm = document.getElementById("edit-form");
const cancelEdit = document.getElementById("cancel-edit");
const profileView = document.getElementById("profile-view");
const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");
const welcomeText = document.getElementById("welcome-text");
const editName = document.getElementById("edit-name");
const editEmail = document.getElementById("edit-email");
const logoutBtn = document.getElementById("logout-btn");

// Store current user data
let currentUser = null;

// Load user profile from backend
async function loadProfile() {
  try {
    const result = await API.getProfile();
    currentUser = result.data;
    
    // Update UI with user data
    const fullName = `${currentUser.firstName} ${currentUser.lastName}`;
    profileName.textContent = fullName;
    profileEmail.textContent = currentUser.email;
    welcomeText.textContent = `Welcome back, ${currentUser.firstName}`;
    
    // Set edit form values
    editName.value = fullName;
    editEmail.value = currentUser.email;
    
    // Load user's listings
    await loadUserListings();
    
  } catch (error) {
    console.error('Failed to load profile:', error);
    alert('Failed to load profile. Please try logging in again.');
    API.logout();
  }
}

// Load user's listings
async function loadUserListings() {
  try {
    const result = await API.getUserListings();
    const listings = result.data || [];
    
    const listingGrid = document.querySelector('.listing-grid');
    if (!listingGrid) return;
    
    if (listings.length === 0) {
      listingGrid.innerHTML = '<p class="muted-text">You haven\'t posted any listings yet.</p>';
      return;
    }
    
    listingGrid.innerHTML = listings.map(listing => {
      const price = parseFloat(listing.price).toFixed(2);
      const categoryDisplay = listing.category.replace(/_/g, ' ').toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase());
      
      return `
        <div class="listing-card" style="cursor: pointer;" data-id="${listing.id}">
          <h3 class="listing-title">${listing.title}</h3>
          <p class="listing-desc">${categoryDisplay} - ${listing.condition.replace(/_/g, ' ')}</p>
          <p class="listing-price">$${price}</p>
          <div style="margin-top: 10px;">
            <button class="btn-edit" data-id="${listing.id}" style="margin-right: 8px;">Edit</button>
            <button class="btn-delete" data-id="${listing.id}" style="background: #dc2626; color: white;">Delete</button>
          </div>
        </div>
      `;
    }).join('');
    
    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        editListing(btn.dataset.id);
      });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteListing(btn.dataset.id);
      });
    });
    
  } catch (error) {
    console.error('Failed to load listings:', error);
  }
}

// Edit listing
function editListing(id) {
  // For now, redirect to edit page (you'd need to create this)
  alert(`Edit functionality for listing ${id} coming soon!`);
  // window.location.href = `edit-listing.html?id=${id}`;
}

// Delete listing
async function deleteListing(id) {
  if (!confirm('Are you sure you want to delete this listing?')) {
    return;
  }
  
  try {
    await API.deleteListing(id);
    alert('Listing deleted successfully!');
    await loadUserListings(); // Reload listings
  } catch (error) {
    alert('Failed to delete listing. Please try again.');
  }
}

// Show edit form
editBtn.addEventListener("click", (e) => {
  e.preventDefault();
  profileView.style.display = "none";
  editForm.style.display = "flex";
  editBtn.style.display = "none";
  
  // Add password fields if not present
  if (!document.getElementById('edit-password')) {
    const passwordFields = `
      <label>
        <span>New Password (leave blank to keep current)</span>
        <input type="password" id="edit-password" minlength="8">
      </label>
      <label>
        <span>Phone Number</span>
        <input type="tel" id="edit-phone" value="${currentUser.phone || ''}">
      </label>
    `;
    editEmail.parentElement.insertAdjacentHTML('afterend', passwordFields);
  }
});

// Cancel editing
cancelEdit.addEventListener("click", () => {
  editForm.style.display = "none";
  profileView.style.display = "flex";
  editBtn.style.display = "inline-block";
});

// Save profile changes
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const nameParts = editName.value.trim().split(' ');
  const firstName = nameParts[0] || currentUser.firstName;
  const lastName = nameParts.slice(1).join(' ') || currentUser.lastName;
  const newEmail = editEmail.value.trim();
  const newPassword = document.getElementById('edit-password')?.value;
  const newPhone = document.getElementById('edit-phone')?.value.trim();
  
  // Build update object
  const updates = {};
  
  if (firstName !== currentUser.firstName) updates.firstName = firstName;
  if (lastName !== currentUser.lastName) updates.lastName = lastName;
  if (newEmail !== currentUser.email) updates.email = newEmail;
  if (newPassword) updates.password = newPassword;
  if (newPhone !== currentUser.phone) updates.phone = newPhone || null;
  
  // Check if there are any changes
  if (Object.keys(updates).length === 0) {
    editForm.style.display = "none";
    profileView.style.display = "flex";
    editBtn.style.display = "inline-block";
    return;
  }
  
  try {
    // Show loading state
    const saveBtn = editForm.querySelector('button[type="submit"]');
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
    
    // Update profile
    const result = await API.updateProfile(updates);
    
    // Update local user data
    currentUser = result.data;
    
    // Update UI
    const fullName = `${currentUser.firstName} ${currentUser.lastName}`;
    profileName.textContent = fullName;
    profileEmail.textContent = currentUser.email;
    welcomeText.textContent = `Welcome back, ${currentUser.firstName}`;
    
    // Update stored user data
    localStorage.setItem('gbm_user', JSON.stringify(currentUser));
    
    // Hide edit form
    editForm.style.display = "none";
    profileView.style.display = "flex";
    editBtn.style.display = "inline-block";
    
    // Reset button state
    saveBtn.textContent = 'Save Changes';
    saveBtn.disabled = false;
    
    alert('Profile updated successfully!');
    
  } catch (error) {
    console.error('Failed to update profile:', error);
    alert(error.message || 'Failed to update profile. Please try again.');
    
    // Reset button state
    const saveBtn = editForm.querySelector('button[type="submit"]');
    saveBtn.textContent = 'Save Changes';
    saveBtn.disabled = false;
  }
});

// Logout functionality
logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (confirm("Are you sure you want to log out?")) {
    API.logout();
  }
});

// Update the Recently Viewed section title to "My Listings"
document.addEventListener('DOMContentLoaded', () => {
  const viewedSection = document.querySelector('.viewed-section h2');
  if (viewedSection) {
    viewedSection.textContent = 'My Listings';
  }
  
  // Load profile on page load
  loadProfile();
});

// Add some CSS for the buttons
const style = document.createElement('style');
style.textContent = `
  .btn-edit, .btn-delete {
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: opacity 0.2s;
  }
  .btn-edit {
    background: var(--brand);
    color: white;
  }
  .btn-edit:hover, .btn-delete:hover {
    opacity: 0.9;
  }
`;
document.head.appendChild(style);