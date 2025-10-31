// Elements
const editBtn = document.getElementById("edit-btn");
const editForm = document.getElementById("edit-form");
const cancelEdit = document.getElementById("cancel-edit");
const profileView = document.getElementById("profile-view");
const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");
const welcomeText = document.getElementById("welcome-text");
const editName = document.getElementById("edit-name");
const editEmail = document.getElementById("edit-email");

// Show edit form
editBtn.addEventListener("click", (e) => {
  e.preventDefault();
  profileView.style.display = "none";
  editForm.style.display = "flex";
  editBtn.style.display = "none";
});

// Cancel editing
cancelEdit.addEventListener("click", () => {
  editForm.style.display = "none";
  profileView.style.display = "flex";
  editBtn.style.display = "inline-block";
});

// Save changes
editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newName = editName.value.trim();
  const newEmail = editEmail.value.trim();

  if (newName && newEmail) {
    profileName.textContent = newName;
    profileEmail.textContent = newEmail;
    welcomeText.textContent = `Welcome back, ${newName}`;
  }

  editForm.style.display = "none";
  profileView.style.display = "flex";
  editBtn.style.display = "inline-block";
});

// Logout confirmation
document.getElementById("logout-btn").addEventListener("click", (e) => {
  e.preventDefault();
  if (confirm("Are you sure you want to log out?")) {
    window.location.href = "index.html"; // redirect to home or login
  }
});
