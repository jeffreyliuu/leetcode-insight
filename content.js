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
    console.log(dislikes)
    return;
}

// Main execution
const problemSlug = getProblemSlug();
if (problemSlug) {
    fetchDislikes(problemSlug);
}


