/**
 * Marketplace page functionality
 */

// DOM elements
const elements = {
  searchInput: document.getElementById('searchInput'),
  categorySelect: document.getElementById('categorySelect'),
  conditionSelect: document.getElementById('conditionSelect'),
  minPrice: document.getElementById('minPrice'),
  maxPrice: document.getElementById('maxPrice'),
  sortBy: document.getElementById('sortBy'),
  clearFilters: document.getElementById('clearFilters'),
  listingsGrid: document.getElementById('listingsGrid'),
  listingCount: document.getElementById('listingCount'),
  emptyState: document.getElementById('emptyState')
};

// Current filters
let currentFilters = {
  search: '',
  category: '',
  condition: '',
  minPrice: '',
  maxPrice: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  limit: 50
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  Utils.updateNavigation();
  loadListings();
  attachEventListeners();
});

// Attach event listeners
function attachEventListeners() {
  // Search with debounce
  elements.searchInput.addEventListener('input', 
    Utils.debounce(() => {
      currentFilters.search = elements.searchInput.value.trim();
      loadListings();
    }, 500)
  );

  // Filter changes
  elements.categorySelect.addEventListener('change', () => {
    currentFilters.category = elements.categorySelect.value;
    loadListings();
  });

  elements.conditionSelect.addEventListener('change', () => {
    currentFilters.condition = elements.conditionSelect.value;
    loadListings();
  });

  elements.minPrice.addEventListener('input', 
    Utils.debounce(() => {
      currentFilters.minPrice = elements.minPrice.value;
      loadListings();
    }, 500)
  );

  elements.maxPrice.addEventListener('input', 
    Utils.debounce(() => {
      currentFilters.maxPrice = elements.maxPrice.value;
      loadListings();
    }, 500)
  );

  elements.sortBy.addEventListener('change', () => {
    const value = elements.sortBy.value;
    if (value === 'price') {
      currentFilters.sortBy = 'price';
      currentFilters.sortOrder = 'asc';
    } else {
      currentFilters.sortBy = value;
      currentFilters.sortOrder = value === 'title' ? 'asc' : 'desc';
    }
    loadListings();
  });

  // Clear filters
  elements.clearFilters.addEventListener('click', clearAllFilters);
}

// Load listings from API
async function loadListings() {
  try {
    elements.listingCount.textContent = 'Loading...';
    elements.emptyState.classList.add('hidden');
    
    // Build filter object
    const filters = {};
    if (currentFilters.search) filters.search = currentFilters.search;
    if (currentFilters.category) filters.category = currentFilters.category;
    if (currentFilters.condition) filters.condition = currentFilters.condition;
    if (currentFilters.minPrice) filters.minPrice = parseFloat(currentFilters.minPrice);
    if (currentFilters.maxPrice) filters.maxPrice = parseFloat(currentFilters.maxPrice);
    filters.sortBy = currentFilters.sortBy;
    filters.sortOrder = currentFilters.sortOrder;
    filters.limit = currentFilters.limit;

    const result = await API.getListings(filters);
    const listings = result.data || [];

    renderListings(listings);

  } catch (error) {
    console.error('Failed to load listings:', error);
    elements.listingCount.textContent = 'Failed to load';
    elements.listingsGrid.innerHTML = `
      <div class="col-span-full text-center" style="grid-column: 1 / -1; padding: 40px;">
        <p class="text-muted">${API.getErrorMessage(error)}</p>
        <button onclick="loadListings()" class="btn mt-16">Try Again</button>
      </div>
    `;
  }
}

// Render listings to grid
function renderListings(listings) {
  const count = listings.length;
  elements.listingCount.textContent = `${count} listing${count !== 1 ? 's' : ''} found`;

  if (count === 0) {
    elements.listingsGrid.innerHTML = '';
    elements.emptyState.classList.remove('hidden');
    return;
  }

  elements.emptyState.classList.add('hidden');
  
  elements.listingsGrid.innerHTML = listings.map(listing => {
    const price = Utils.formatPrice(listing.price);
    const category = Utils.formatCategory(listing.category);
    const condition = Utils.formatCondition(listing.condition);
    const seller = listing.seller ? 
      `${listing.seller.firstName} ${listing.seller.lastName}` : 
      'Unknown Seller';

    return `
      <article class="listing-card" onclick="viewListing(${listing.id})">
        <div class="listing-thumb">${category}</div>
        <div class="listing-body">
          <h3 class="listing-title">${escapeHtml(listing.title)}</h3>
          <div class="listing-badges">
            <span class="badge">${category}</span>
            <span class="badge">${condition}</span>
          </div>
          <div class="listing-price">$${price}</div>
          <div class="listing-seller">Seller: ${escapeHtml(seller)}</div>
          ${listing.description ? `
            <div class="listing-description">${escapeHtml(listing.description)}</div>
          ` : ''}
        </div>
      </article>
    `;
  }).join('');
}

// View individual listing (show modal with details)
async function viewListing(id) {
  try {
    const result = await API.getListing(id);
    const listing = result.data;

    const price = Utils.formatPrice(listing.price);
    const category = Utils.formatCategory(listing.category);
    const condition = Utils.formatCondition(listing.condition);
    const seller = listing.seller ? 
      `${listing.seller.firstName} ${listing.seller.lastName}` : 
      'Unknown Seller';
    const sellerEmail = listing.seller?.email || 'N/A';
    const sellerPhone = listing.seller?.phone || 'N/A';

    const modalContent = `
      <div class="listing-detail">
        <div class="listing-detail-header">
          <h2 style="margin: 0 0 12px;">${escapeHtml(listing.title)}</h2>
          <div class="listing-badges mb-16">
            <span class="badge">${category}</span>
            <span class="badge">${condition}</span>
            ${listing.isAvailable ? 
              '<span class="badge success">Available</span>' : 
              '<span class="badge danger">Sold</span>'
            }
          </div>
        </div>

        <div class="listing-detail-price">
          <span class="text-muted">Price</span>
          <div style="font-size: 28px; font-weight: 700; color: var(--brand);">$${price}</div>
        </div>

        <div class="listing-detail-section">
          <h3>Description</h3>
          <p>${escapeHtml(listing.description) || 'No description provided.'}</p>
        </div>

        <div class="listing-detail-section">
          <h3>Seller Information</h3>
          <p><strong>Name:</strong> ${escapeHtml(seller)}</p>
          <p><strong>Email:</strong> <a href="mailto:${sellerEmail}">${sellerEmail}</a></p>
          ${sellerPhone !== 'N/A' ? `<p><strong>Phone:</strong> ${sellerPhone}</p>` : ''}
        </div>

        <div style="margin-top: 24px; display: flex; gap: 12px;">
          <a href="mailto:${sellerEmail}" class="btn" style="flex: 1;">Contact Seller</a>
          <button onclick="this.closest('.modal').remove()" class="btn btn-outline">Close</button>
        </div>
      </div>
    `;

    const modal = Utils.createModal('Listing Details', modalContent);
    document.body.appendChild(modal);

  } catch (error) {
    console.error('Failed to load listing details:', error);
    Utils.showToast(API.getErrorMessage(error), 'error');
  }
}

// Clear all filters
function clearAllFilters() {
  elements.searchInput.value = '';
  elements.categorySelect.value = '';
  elements.conditionSelect.value = '';
  elements.minPrice.value = '';
  elements.maxPrice.value = '';
  elements.sortBy.value = 'createdAt';

  currentFilters = {
    search: '',
    category: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    limit: 50
  };

  loadListings();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Make viewListing available globally
window.viewListing = viewListing;
window.loadListings = loadListings;