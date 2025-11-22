// DOM Elements
const els = {
  q: document.getElementById('q'),
  cat: document.getElementById('cat'),
  min: document.getElementById('min'),
  max: document.getElementById('max'),
  grid: document.getElementById('grid'),
  empty: document.getElementById('empty'),
  count: document.getElementById('count'),
  clear: document.getElementById('clear')
};

// Store all listings for client-side filtering
let allListings = [];

// Category mapping (backend uses UPPERCASE with underscores)
const categoryMap = {
  'Textbooks': 'TEXTBOOKS',
  'Electronics': 'ELECTRONICS',
  'Furniture': 'FURNITURE',
  'Clothing': 'CLOTHING',
  'School Supplies': 'SCHOOL_SUPPLIES',
  'Other': 'OTHER'
};

// Render listings to the grid
function renderListings(listings) {
  if (listings.length === 0) {
    els.grid.innerHTML = '';
    els.empty.style.display = 'block';
    els.count.textContent = 'No items found';
    return;
  }

  els.empty.style.display = 'none';
  els.count.textContent = `${listings.length} item${listings.length !== 1 ? 's' : ''} found`;
  
  els.grid.innerHTML = listings.map(listing => {
    // Format price to 2 decimal places
    const price = parseFloat(listing.price).toFixed(2);
    
    // Format category for display
    const categoryDisplay = listing.category.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
    
    // Get seller name
    const sellerName = listing.seller ? 
      `${listing.seller.firstName} ${listing.seller.lastName}` : 'Unknown';
    
    return `
      <article class="item" data-id="${listing.id}" style="cursor: pointer;">
        <div class="thumb">${categoryDisplay}</div>
        <div class="content">
          <div style="font-weight: 600;">${listing.title}</div>
          <div class="badges">
            <span class="badge">${categoryDisplay}</span>
            <span class="badge">${listing.condition.replace(/_/g, ' ')}</span>
          </div>
          <div class="price">$${price}</div>
          <div style="font-size: 0.85em; color: #666; margin-top: 4px;">
            Seller: ${sellerName}
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Add click handlers to view listing details
  document.querySelectorAll('.item[data-id]').forEach(item => {
    item.addEventListener('click', () => {
      const listingId = item.dataset.id;
      viewListingDetails(listingId);
    });
  });
}

// View listing details (you can expand this to show a modal or navigate to a detail page)
async function viewListingDetails(id) {
  try {
    const result = await API.getListing(id);
    const listing = result.data;
    
    alert(`
Title: ${listing.title}
Description: ${listing.description}
Price: $${parseFloat(listing.price).toFixed(2)}
Condition: ${listing.condition.replace(/_/g, ' ')}
Category: ${listing.category.replace(/_/g, ' ')}
Seller: ${listing.seller.firstName} ${listing.seller.lastName}
Contact: ${listing.seller.email}
    `);
  } catch (error) {
    alert('Failed to load listing details');
  }
}

// Load listings from backend
async function loadListings() {
  try {
    els.count.textContent = 'Loading...';
    
    const result = await API.getListings({
      limit: 50,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    
    allListings = result.data || [];
    renderListings(allListings);
    
  } catch (error) {
    console.error('Failed to load listings:', error);
    els.count.textContent = 'Failed to load listings';
    els.empty.style.display = 'block';
    els.empty.textContent = 'Unable to connect to server. Please try again later.';
  }
}

// Apply filters with backend search
async function applyFilters() {
  const searchQuery = els.q.value.trim();
  const selectedCategory = els.cat.value;
  const minPrice = els.min.value;
  const maxPrice = els.max.value;

  // Build filter object
  const filters = {};
  
  if (searchQuery) {
    filters.search = searchQuery;
  }
  
  if (selectedCategory) {
    filters.category = categoryMap[selectedCategory] || selectedCategory;
  }
  
  if (minPrice) {
    filters.minPrice = minPrice;
  }
  
  if (maxPrice) {
    filters.maxPrice = maxPrice;
  }

  try {
    els.count.textContent = 'Searching...';
    const result = await API.getListings({
      ...filters,
      limit: 50,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    
    allListings = result.data || [];
    renderListings(allListings);
    
  } catch (error) {
    console.error('Search failed:', error);
    els.count.textContent = 'Search failed';
  }
}

// Clear filters
function clearFilters() {
  els.q.value = '';
  els.cat.value = '';
  els.min.value = '';
  els.max.value = '';
  loadListings();
}

// Event listeners
els.q.addEventListener('input', debounce(applyFilters, 500));
els.cat.addEventListener('change', applyFilters);
els.min.addEventListener('input', debounce(applyFilters, 500));
els.max.addEventListener('input', debounce(applyFilters, 500));
els.clear.addEventListener('click', clearFilters);

// Debounce function to limit API calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Update category select options to match backend
els.cat.innerHTML = `
  <option value="">All Categories</option>
  <option value="Textbooks">Textbooks</option>
  <option value="Electronics">Electronics</option>
  <option value="Furniture">Furniture</option>
  <option value="Clothing">Clothing</option>
  <option value="School Supplies">School Supplies</option>
  <option value="Other">Other</option>
`;

// Load listings on page load
document.addEventListener('DOMContentLoaded', loadListings);