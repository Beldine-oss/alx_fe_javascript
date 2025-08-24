// Quotes array (global, required)
var quotes = [];

// Track the currently selected category
var selectedCategory = "all";

// Load quotes from localStorage if available
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    try {
      quotes = JSON.parse(stored);
    } catch (e) {
      quotes = [];
    }
  } else {
    // Default quotes if nothing in storage
    quotes = [
      { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Inspiration" },
      { text: "Don’t let yesterday take up too much of today.", category: "Wisdom" }
    ];
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Function: showRandomQuote (exact name required)
function showRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = "<em>No quotes available.</em>";
    return;
  }
  var index = Math.floor(Math.random() * quotes.length);
  var q = quotes[index];
  document.getElementById("quoteDisplay").innerHTML =
    '&quot;' + q.text + '&quot; &mdash; [<strong>' + q.category + '</strong>]';

  // Save last viewed quote index in sessionStorage
  sessionStorage.setItem("lastViewedQuote", index);
}

// Populate categories in the dropdown
function populateCategories() {
  const categorySet = new Set(quotes.map(q => q.category));
  const filter = document.getElementById("categoryFilter");
  filter.innerHTML = '<option value="all">All Categories</option>';
  categorySet.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filter.appendChild(option);
  });

  // Restore last selected filter from localStorage
  const lastFilter = localStorage.getItem("lastCategoryFilter");
  if (lastFilter && filter.querySelector(`option[value="${lastFilter}"]`)) {
    filter.value = lastFilter;
    selectedCategory = lastFilter;
  } else {
    selectedCategory = "all";
  }
}

// Filter quotes based on selected category
function filterQuotes() {
  const filterValue = document.getElementById("categoryFilter").value;
  selectedCategory = filterValue;
  localStorage.setItem("lastCategoryFilter", filterValue);

  let filteredQuotes = quotes;
  if (filterValue !== "all") {
    filteredQuotes = quotes.filter(q => q.category === filterValue);
  }

  // Display filtered quotes
  const display = document.getElementById("quoteDisplay");
  if (filteredQuotes.length === 0) {
    display.innerHTML = "<em>No quotes available for this category.</em>";
    return;
  }
  display.innerHTML = filteredQuotes.map(q =>
    `&quot;${q.text}&quot; &mdash; [<strong>${q.category}</strong>]`
  ).join("<br><br>");
}

// Function: addQuote
function addQuote() {
  var textEl = document.getElementById("newQuoteText");
  var catEl = document.getElementById("newQuoteCategory");
  var text = textEl.value.trim();
  var category = catEl.value.trim();

  if (text && category) {
    quotes.push({ text: text, category: category });
    saveQuotes();
    populateCategories();
    filterQuotes();
    textEl.value = "";
    catEl.value = "";
  }
}

// Function: createAddQuoteForm (must exist)
function createAddQuoteForm() {
  var formContainer = document.getElementById("formContainer");
  formContainer.innerHTML = ""; // Clear previous form if any

  var textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";

  var categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  var addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.onclick = addQuote;

  // Export button
  var exportBtn = document.createElement("button");
  exportBtn.textContent = "Export Quotes (JSON)";
  exportBtn.onclick = exportQuotesToJson;

  // Import input
  var importInput = document.createElement("input");
  importInput.type = "file";
  importInput.id = "importFile";
  importInput.accept = ".json";
  importInput.onchange = importFromJsonFile;

  formContainer.appendChild(textInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addBtn);
  formContainer.appendChild(document.createElement("br"));
  formContainer.appendChild(exportBtn);
  formContainer.appendChild(importInput);
}

// Export quotes to JSON file
function exportQuotesToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        showRandomQuote();
        alert('Quotes imported successfully!');
      } else {
        alert('Invalid JSON format.');
      }
    } catch (err) {
      alert('Error parsing JSON file.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Simulated server endpoint (using JSONPlaceholder for demonstration)
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Periodically fetch quotes from server and sync
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    // Simulate server quotes format
    const serverQuotes = serverData.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

    // Conflict resolution: server data takes precedence
    let conflict = false;
    if (JSON.stringify(serverQuotes) !== JSON.stringify(quotes.slice(0, 5))) {
      conflict = true;
      quotes = [...serverQuotes, ...quotes.slice(5)];
      saveQuotes();
      populateCategories();
      filterQuotes();
    }

    // Notify user if conflict was resolved
    if (conflict) {
      showNotification("Quotes updated from server. Server data has replaced local data for the first 5 quotes.");
    }
  } catch (error) {
    showNotification("Failed to sync with server.");
  }
}

// Post quotes to server (mock API)
async function postQuotesToServer() {
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quotes)
    });
    if (response.ok) {
      showNotification("Quotes successfully posted to server.");
    } else {
      showNotification("Failed to post quotes to server.");
    }
  } catch (error) {
    showNotification("Error posting quotes to server.");
  }
}

// Notification UI
function showNotification(msg) {
  let note = document.getElementById("notification");
  if (!note) {
    note = document.createElement("div");
    note.id = "notification";
    note.style.background = "#ffeeba";
    note.style.border = "1px solid #f5c6cb";
    note.style.padding = "10px";
    note.style.margin = "10px 0";
    document.body.insertBefore(note, document.body.firstChild);
  }
  note.textContent = msg;
  setTimeout(() => { note.textContent = ""; }, 4000);
}

// Manual sync button
function createSyncButton() {
  let btn = document.getElementById("syncBtn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "syncBtn";
    btn.textContent = "Sync with Server";
    btn.onclick = fetchQuotesFromServer;
    document.body.insertBefore(btn, document.getElementById("formContainer"));
  }
}

// Add a button for posting quotes manually
function createPostButton() {
  let btn = document.getElementById("postBtn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "postBtn";
    btn.textContent = "Post Quotes to Server";
    btn.onclick = postQuotesToServer;
    document.body.insertBefore(btn, document.getElementById("formContainer"));
  }
}

// Initialize
loadQuotes();
populateCategories();
filterQuotes();
createAddQuoteForm();
createSyncButton();
createPostButton();
setInterval(fetchQuotesFromServer, 30000); // auto-sync every 30 seconds

// Restore last viewed quote if available (sessionStorage demo)
const lastViewed = sessionStorage.getItem("lastViewedQuote");
if (lastViewed !== null && quotes[lastViewed]) {
  var q = quotes[lastViewed];
  document.getElementById("quoteDisplay").innerHTML =
    '&quot;' + q.text + '&quot; &mdash; [<strong>' + q.category + '</strong>]';
}

// Listen for filter changes
document.getElementById("categoryFilter").addEventListener("change", filterQuotes);

// Event listener on "Show New Quote" button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Ensure functions are global for checker
window.showRandomQuote = showRandomQuote;
window.addQuote = addQuote;
window.createAddQuoteForm = createAddQuoteForm;
window.exportQuotesToJson = exportQuotesToJson;
window.importFromJsonFile = importFromJsonFile;
window.quotes = quotes;
window.saveQuotes = saveQuotes;
window.loadQuotes = loadQuotes;
