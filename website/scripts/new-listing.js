/**
 * New Listing page functionality
 */

// Require authentication
if (!API.requireAuth()) {
  // User will be redirected
}

// Update navigation
document.addEventListener('DOMContentLoaded', () => {
  Utils.updateNavigation();
});

// Handle image selection
let imageDataUrl = null;

document.getElementById('imageFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const fileName = document.getElementById('fileName');
  const preview = document.getElementById('imagePreview');
  const previewImg = document.getElementById('previewImg');

  if (!file) {
    fileName.textContent = 'No file chosen';
    preview.classList.add('hidden');
    imageDataUrl = null;
    return;
  }

  // Validate file size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    showMessage('Image file size must be less than 10MB', 'error');
    e.target.value = '';
    return;
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    showMessage('Please upload an image file', 'error');
    e.target.value = '';
    return;
  }

  fileName.textContent = file.name;

  try {
    imageDataUrl = await Utils.fileToDataUrl(file);
    previewImg.src = imageDataUrl;
    preview.classList.remove('hidden');
  } catch (error) {
    console.error('Failed to read image:', error);
    showMessage('Failed to load image', 'error');
  }
});

// Remove image
function removeImage() {
  document.getElementById('imageFile').value = '';
  document.getElementById('fileName').textContent = 'No file chosen';
  document.getElementById('imagePreview').classList.add('hidden');
  imageDataUrl = null;
}

// Make removeImage available globally
window.removeImage = removeImage;

// Handle form submission
document.getElementById('listingForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const category = document.getElementById('category').value;
  const condition = document.getElementById('condition').value;
  const price = document.getElementById('price').value;
  const description = document.getElementById('description').value.trim();
  const submitBtn = e.target.querySelector('button[type="submit"]');

  // Client-side validation
  if (!title || title.length < 3) {
    showMessage('Title must be at least 3 characters long', 'error');
    return;
  }

  if (title.length > 200) {
    showMessage('Title must be no more than 200 characters', 'error');
    return;
  }

  if (!category) {
    showMessage('Please select a category', 'error');
    return;
  }

  if (!condition) {
    showMessage('Please select a condition', 'error');
    return;
  }

  if (!price || parseFloat(price) < 0) {
    showMessage('Please enter a valid price', 'error');
    return;
  }

  if (!description || description.length < 10) {
    showMessage('Description must be at least 10 characters long', 'error');
    return;
  }

  if (description.length > 2000) {
    showMessage('Description must be no more than 2000 characters', 'error');
    return;
  }

  try {
    showMessage('Creating listing...', 'info');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Posting...';

    // Build listing data
    const listingData = {
      title,
      description,
      price: parseFloat(price),
      condition,
      category,
      images: imageDataUrl ? [imageDataUrl] : []
    };

    await API.createListing(listingData);

    showMessage('Listing posted successfully! Redirecting...', 'success');

    setTimeout(() => {
      window.location.href = 'account.html';
    }, 1500);

  } catch (error) {
    console.error('Failed to create listing:', error);
    showMessage(API.getErrorMessage(error), 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Post Listing';
  }
});

// Show/hide message
function showMessage(message, type = 'error') {
  const msgElement = document.getElementById('formMsg');
  msgElement.textContent = message;
  msgElement.className = `msg ${type}`;
  
  // Scroll to message
  msgElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}