// Check if user is authenticated
if (!API.requireAuth()) {
  // User will be redirected to signup page
}

// Helper function for user-friendly error messages
function getErrorMessage(error) {
  const message = error.message || 'An error occurred';
  
  const errorMappings = {
    'Title must be between 3 and 200 characters': 'Title must be between 3 and 200 characters',
    'Description must be between 10 and 2000 characters': 'Description must be between 10 and 2000 characters',
    'Price must be 0 or greater': 'Price must be a positive number',
    'Condition is required': 'Please select a condition',
    'Category is required': 'Please select a category',
    'Maximum 5 images allowed': 'You can only upload up to 5 images',
    'Not authenticated': 'Please log in again',
    'Cannot connect to server': 'Unable to connect to the server. Please check if the backend is running.',
  };
  
  for (const [pattern, friendlyMessage] of Object.entries(errorMappings)) {
    if (message.includes(pattern)) {
      return friendlyMessage;
    }
  }
  
  return message;
}

// DOM elements
const form = document.getElementById('listingForm');
const fileInput = document.getElementById('file');
const preview = document.getElementById('preview');
const formMsg = document.getElementById('formMsg');

// Category mapping
const categoryMap = {
  'Textbooks': 'TEXTBOOKS',
  'Electronics': 'ELECTRONICS',
  'Furniture': 'FURNITURE',
  'Clothing': 'CLOTHING',
  'School Supplies': 'SCHOOL_SUPPLIES',
  'Lab Kits': 'SCHOOL_SUPPLIES', // Map Lab Kits to SCHOOL_SUPPLIES
  'Calculators': 'ELECTRONICS',  // Map Calculators to ELECTRONICS
  'Other': 'OTHER'
};

// Condition options
const conditions = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'USED'];

// Update category select to match backend
document.getElementById('category').innerHTML = `
  <option value="">Select a category</option>
  <option value="Textbooks">Textbooks</option>
  <option value="Electronics">Electronics (including calculators)</option>
  <option value="Furniture">Furniture</option>
  <option value="Clothing">Clothing</option>
  <option value="School Supplies">School Supplies (including lab kits)</option>
  <option value="Other">Other</option>
`;

// Add condition select field
const categorySelect = document.getElementById('category');
const conditionHTML = `
  <label for="condition">Condition *</label>
  <select id="condition" required>
    <option value="">Select condition</option>
    <option value="NEW">New</option>
    <option value="LIKE_NEW">Like New</option>
    <option value="GOOD">Good</option>
    <option value="FAIR">Fair</option>
    <option value="USED">Used</option>
  </select>
`;
categorySelect.insertAdjacentHTML('afterend', conditionHTML);

// Image preview functionality
let imageDataUrl = null;

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) {
    preview.innerHTML = 'Image preview';
    imageDataUrl = null;
    return;
  }

  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    formMsg.textContent = 'Image file size must be less than 10MB';
    formMsg.className = 'msg error';
    fileInput.value = '';
    return;
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    formMsg.textContent = 'Please upload an image file';
    formMsg.className = 'msg error';
    fileInput.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    imageDataUrl = e.target.result;
    preview.innerHTML = '';
    const img = new Image();
    img.src = imageDataUrl;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    preview.appendChild(img);
    
    // Clear any previous errors
    if (formMsg.className === 'msg error') {
      formMsg.textContent = '';
      formMsg.className = 'msg';
    }
  };
  reader.readAsDataURL(file);
});

// ISBN validation regex
const rxISBN = /^(97(8|9))?\d{9}(\d|X)$/i;

// Form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Get form values
  const title = document.getElementById('title').value.trim();
  const category = document.getElementById('category').value;
  const condition = document.getElementById('condition').value;
  const isbn = document.getElementById('isbn').value.trim();
  const course = document.getElementById('course').value.trim();
  const price = document.getElementById('price').value;
  const description = document.getElementById('desc').value.trim();

  // Clear previous messages
  formMsg.textContent = '';
  formMsg.className = 'msg';

  // Client-side validation
  if (!title) {
    formMsg.textContent = 'Title is required';
    formMsg.className = 'msg error';
    return;
  }

  if (title.length < 3) {
    formMsg.textContent = 'Title must be at least 3 characters long';
    formMsg.className = 'msg error';
    return;
  }

  if (!category) {
    formMsg.textContent = 'Please select a category';
    formMsg.className = 'msg error';
    return;
  }

  if (!condition) {
    formMsg.textContent = 'Please select a condition';
    formMsg.className = 'msg error';
    return;
  }

  if (price === '' || parseFloat(price) < 0) {
    formMsg.textContent = 'Please enter a valid price';
    formMsg.className = 'msg error';
    return;
  }

  if (isbn && !rxISBN.test(isbn)) {
    formMsg.textContent = 'ISBN format is invalid. You can leave it blank if you\'re unsure.';
    formMsg.className = 'msg error';
    return;
  }

  // Map category to backend format
  const backendCategory = categoryMap[category] || 'OTHER';

  // Build listing data
  const listingData = {
    title,
    description: description || `${title} in ${condition.toLowerCase().replace(/_/g, ' ')} condition.`,
    price: parseFloat(price),
    condition,
    category: backendCategory,
    images: imageDataUrl ? [imageDataUrl] : []
  };

  // Add optional fields to description if provided
  if (isbn || course) {
    const additionalInfo = [];
    if (isbn) additionalInfo.push(`ISBN: ${isbn}`);
    if (course) additionalInfo.push(`Course: ${course}`);
    listingData.description += '\n' + additionalInfo.join(', ');
  }

  try {
    // Show loading state
    formMsg.textContent = 'Posting listing...';
    formMsg.className = 'msg';
    
    // Disable submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Posting...';
    submitBtn.disabled = true;

    // Call API
    const result = await API.createListing(listingData);

    formMsg.textContent = 'Listing posted successfully! Redirecting...';
    formMsg.className = 'msg ok';

    // Reset form
    form.reset();
    preview.innerHTML = 'Image preview';
    imageDataUrl = null;

    // Redirect to marketplace
    setTimeout(() => {
      window.location.href = 'marketplace.html';
    }, 1500);

  } catch (error) {
    console.error('Failed to create listing:', error);
    formMsg.textContent = getErrorMessage(error);
    formMsg.className = 'msg error';
    
    // Re-enable submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Post Listing';
    submitBtn.disabled = false;
  }
});

// Add auth check indicator
document.addEventListener('DOMContentLoaded', () => {
  const user = API.getCurrentUser();
  if (user) {
    const header = document.querySelector('.header-wrap nav');
    const accountLink = header.querySelector('a[href="signup.html"]');
    if (accountLink) {
      accountLink.textContent = `Hi, ${user.firstName}`;
      accountLink.href = 'account.html';
    }
  }
});