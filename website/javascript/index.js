// Update navigation based on auth status
function updateNavigation() {
  const accountLink = document.getElementById('account-link');
  const nav = document.getElementById('main-nav');
  
  if (API && API.isAuthenticated && API.isAuthenticated()) {
    const user = API.getCurrentUser();
    if (user) {
      accountLink.textContent = `Hi, ${user.firstName}`;
      accountLink.href = 'account.html';
      
      // Add logout link
      const logoutLink = document.createElement('a');
      logoutLink.href = '#';
      logoutLink.textContent = 'Logout';
      logoutLink.style.color = '#ef4444';
      logoutLink.onclick = (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
          API.logout();
        }
      };
      nav.appendChild(logoutLink);
    }
  }
}

// Load featured listings from backend
async function loadFeaturedListings() {
  const featuredContainer = document.getElementById('featured-listings');
  
  try {
    // Get 3 most recent listings
    const result = await API.getListings({
      limit: 3,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    
    const listings = result.data || [];
    
    if (listings.length === 0) {
      featuredContainer.innerHTML = '<p class="muted-text" style="grid-column: 1/-1; text-align: center;">No listings yet. Be the first to post!</p>';
      return;
    }
    
    // Render listings
    featuredContainer.innerHTML = listings.map(listing => {
      const price = parseFloat(listing.price).toFixed(2);
      const category = listing.category.replace(/_/g, ' ').toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase());
      
      return `
        <article class="item" style="cursor: pointer;" onclick="window.location.href='marketplace.html'">
          <div class="thumb">${category}</div>
          <div class="content">
            <div>${listing.title}</div>
            <div class="price">$${price}</div>
          </div>
        </article>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Failed to load featured listings:', error);
    featuredContainer.innerHTML = `
      <p class="muted-text" style="grid-column: 1/-1; text-align: center; color: #dc2626;">
        Unable to load listings. Please try again later.
      </p>
    `;
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  updateNavigation();
  loadFeaturedListings();
});