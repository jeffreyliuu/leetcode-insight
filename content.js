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

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "fetchDislikes") {
        const problemSlug = getProblemSlug();
        if (problemSlug) {
            fetchDislikes(problemSlug);
        }
    }
});

// Main execution
const problemSlug = getProblemSlug();
if (problemSlug) {
    fetchDislikes(problemSlug);
}
