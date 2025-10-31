const form = document.getElementById("chat-form");
const input = document.getElementById("chat-input");
const chatWindow = document.getElementById("chat-window");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  // Create message bubble
  const msg = document.createElement("div");
  msg.classList.add("message", "from-me");
  msg.innerHTML = `
    <p>${text}</p>
    <span class="timestamp">${getTime()}</span>
  `;

  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight; // scroll to bottom
  input.value = "";
});

function getTime() {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}