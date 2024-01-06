// This function checks if the URL path has changed (indicating a new problem page)
function hasURLChanged(oldURL, newURL) {
    const oldPath = new URL(oldURL).pathname;
    const newPath = new URL(newURL).pathname;
    return oldPath !== newPath;
}

// Function to extract the problem slug from the URL
function getProblemSlug() {
    const regex = /https:\/\/leetcode\.com\/problems\/(.*?)\//;
    const match = window.location.href.match(regex);
    return match ? match[1] : null;
}

// Function to make the GraphQL API request
function fetchDislikes(problemSlug) {
    const query = `
      query questionTitle($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          dislikes
        }
      }
    `;

    const variables = { titleSlug: problemSlug };

    fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query,
            variables
        }),
    })
        .then(response => response.json())
        .then(data => {
            const dislikes = data.data.question.dislikes;
            displayDislikes(dislikes);
        })
        .catch(error => console.error('Error:', error));
}

// Function to display the dislikes count on the page
function displayDislikes(dislikes) {
    const dislikesContainer = document.querySelector('svg[data-icon="thumbs-down"]').parentNode.parentNode;

    if (dislikesContainer) {
        // Create a new span element to hold the dislikes count
        let dislikesCountSpan = dislikesContainer.querySelector('.dislikes-count');
        if (!dislikesCountSpan) {
            dislikesCountSpan = document.createElement('span');
            dislikesCountSpan.className = 'dislikes-count'; // Assign any necessary classes here
            dislikesContainer.appendChild(dislikesCountSpan);
        }

        // Set the dislikes count text
        dislikesCountSpan.textContent = dislikes;
    }
}

// Main execution
function updateDislikes() {
    // Clear any previously added dislikes count
    const existingDislikes = document.querySelector('.dislikes-count');
    if (existingDislikes) {
        existingDislikes.remove();
    }

    // Fetch and display the new dislikes count
    const problemSlug = getProblemSlug();
    if (problemSlug) {
        fetchDislikes(problemSlug);
    }
}

// Global variable to store the last URL (needed to detect URL changes)
let lastURL = window.location.href;

// This function sets up a MutationObserver to observe changes in the body and updates dislikes when necessary
function observePageUpdates() {
  const observer = new MutationObserver(() => {
    const currentURL = window.location.href;
    // Only update dislikes if the URL path has changed and the new URL contains '/problems/'
    if (hasURLChanged(lastURL, currentURL) && currentURL.includes('/problems/')) {
      updateDislikes();
      lastURL = currentURL; // Update the last URL to the current URL
    }
  });

  // Start observing the body for child list changes
  observer.observe(document.body, { childList: true, subtree: true });
}

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "fetchDislikes") {
    updateDislikes(); // Call updateDislikes to refresh the dislikes count
  }
});

// Call to update dislikes on initial page load
updateDislikes();

// Set up the observer to monitor for page updates
observePageUpdates();