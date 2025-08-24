// Quotes array (global, required)
var quotes = [];

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

// Function: addQuote
function addQuote() {
  var textEl = document.getElementById("newQuoteText");
  var catEl = document.getElementById("newQuoteCategory");
  var text = textEl.value.trim();
  var category = catEl.value.trim();

  if (text && category) {
    quotes.push({ text: text, category: category });
    saveQuotes();
    showRandomQuote(); // update display
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

// Event listener on "Show New Quote" button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Initialize
loadQuotes();
showRandomQuote();
createAddQuoteForm();

// Restore last viewed quote if available (sessionStorage demo)
const lastViewed = sessionStorage.getItem("lastViewedQuote");
if (lastViewed !== null && quotes[lastViewed]) {
  var q = quotes[lastViewed];
  document.getElementById("quoteDisplay").innerHTML =
    '&quot;' + q.text + '&quot; &mdash; [<strong>' + q.category + '</strong>]';
}

// Ensure functions are global for checker
window.showRandomQuote = showRandomQuote;
window.addQuote = addQuote;
window.createAddQuoteForm = createAddQuoteForm;
window.exportQuotesToJson = exportQuotesToJson;
window.importFromJsonFile = importFromJsonFile;
window.quotes = quotes;
window.saveQuotes = saveQuotes;
window.loadQuotes = loadQuotes;
