

// Helper Functions
function getProblemSlug() {
    const regex = /https:\/\/leetcode\.com\/problems\/(.*?)\//;
    const match = window.location.href.match(regex);
    return match ? match[1] : null;
}

function formatDislikesCount(dislikes) {
    if (dislikes >= 1000) {
        return (dislikes / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return dislikes.toString();
}

// Function that checks if the URL path has changed (new problem page)
function hasURLChanged(oldURL, newURL) {
    return new URL(oldURL).pathname !== new URL(newURL).pathname;
}

function parseContent(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Extract problem statement
    let problemStatement = Array.from(doc.querySelectorAll('p'))
        .filter(p => !p.textContent.includes('Example') && !p.textContent.includes('Constraints:'))
        .map(p => p.textContent.trim())
        .join('\n\n');

    // Extract constraints
    let constraints = '';
    const constraintsHeading = Array.from(doc.querySelectorAll('p'))
        .find(p => p.textContent.includes('Constraints:'));
    if (constraintsHeading) {
        let nextSibling = constraintsHeading.nextElementSibling;
        if (nextSibling && nextSibling.tagName.toLowerCase() === 'ul') {
            constraints = Array.from(nextSibling.querySelectorAll('li'))
                .map(li => li.textContent.trim())
                .join('\n');
        }
    }

    // Extract examples
    let examples = [];
    doc.querySelectorAll('p').forEach(p => {
        if (p.textContent.includes('Example')) {
            let sibling = p.nextElementSibling;
            let exampleText = '';
            while (sibling && !sibling.textContent.includes('Example')) {
                if (sibling.tagName.toLowerCase() === 'pre') {
                    exampleText += sibling.textContent.trim();
                } else if (sibling.tagName.toLowerCase() === 'img') {
                    exampleText += '[Image: ' + sibling.src + ']'; // Placeholder text for images
                }
                sibling = sibling.nextElementSibling;
            }
            if (exampleText) {
                examples.push(exampleText);
            }
        }
    });

    return {
        problemStatement: "Problem Statement:\n\n" + problemStatement,
        constraints: "Constraints:\n\n" + constraints,
        examples: "Examples:\n\n" + examples.join('\n\n')
    };
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
            const formattedDislikes = formatDislikesCount(dislikes);

            displayDislikes(dislikes);
        })
        .catch(error => console.error('Error:', error));
}

// Function to display the dislikes count on the page
function displayDislikes(dislikes) {
    const dislikesButton = document.querySelector('svg[data-icon="thumbs-down"]');
    if (dislikesButton) {
        const dislikesContainer = dislikesButton.parentNode.parentNode;

        if (dislikesContainer) {
            // Create a new span element to hold the dislikes count
            let dislikesCountSpan = dislikesContainer.querySelector('.dislikes-count');
            if (!dislikesCountSpan) {
                dislikesCountSpan = document.createElement('span');
                dislikesCountSpan.className = 'dislikes-count';
                dislikesContainer.appendChild(dislikesCountSpan);
            }

            // Set the dislikes count text
            dislikesCountSpan.textContent = dislikes;
        }
    } else {
        console.error('Dislikes button not found');
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

// Global variable to store the last URL
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

// Placeholder function for generating test cases
function generateTestCases() {
    // Logic for generating test cases
    let testCases = [
        'Input: nums = [2,7,11,15], target = 9',
        'Output: [0,1]'
        // ... more test cases ...
    ];

    // Send the test cases back to the popup
    chrome.runtime.sendMessage({ action: "displayTestCases", testCases: testCases });
}

function getProblemContent(slug) {
    const query = `
        query questionContent($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
                content
                mysqlSchemas
            }
        }
    `;

    const variables = { titleSlug: slug };

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
            const content = data.data.question.content;
            console.log(`content: ${content}`)
            const parsedContent = parseContent(content);
            // Now send this back to the popup
            chrome.runtime.sendMessage({ action: "displayParsedContent", content: parsedContent });
        })
        .catch(error => console.error('Error:', error));
}


function fetchAndParseProblemContent(slug) {
    return new Promise((resolve, reject) => {
        const query = `
            query questionContent($titleSlug: String!) {
                question(titleSlug: $titleSlug) {
                    content
                }
            }
        `;
        const variables = { titleSlug: slug };

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
                const htmlContent = data.data.question.content;
                const parsedContent = parseContent(htmlContent);
                resolve(parsedContent);
            })
            .catch(error => {
                console.error('Error:', error);
                reject(error);
            });
    });
}

// Main Message Listener
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "fetchDislikes") {
        updateDislikes();
    } else if (request.action === "generateTestCases") {
        const slug = getProblemSlug();
        if (slug) {
            fetchAndParseProblemContent(slug).then(parsedContent => {
                sendResponse({ action: "displayParsedContent", content: parsedContent });
            }).catch(error => console.error('Error:', error));
            return true; // Indicate async response
        }
    }
});



// Call to update dislikes on initial page load
updateDislikes();

// Set up the observer to monitor for page updates
observePageUpdates();