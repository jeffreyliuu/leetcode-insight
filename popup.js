document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var currentTab = tabs[0];
        if (currentTab && currentTab.url && currentTab.url.includes('leetcode.com/problems/')) {
            // The user is on a LeetCode problem page
            document.getElementById('fetchDislikes').addEventListener('click', function () {
                chrome.tabs.sendMessage(currentTab.id, { action: "fetchDislikes" });
            });
        } else {
            // The user is not on a LeetCode problem page
            document.getElementById('fetchDislikes').style.display = 'none';
            const messageDiv = document.createElement('div');
            messageDiv.textContent = "Please navigate to a LeetCode problem page to view dislikes!";
            messageDiv.style.textAlign = 'center';
            messageDiv.style.padding = '20px';
            document.body.appendChild(messageDiv);
        }
    });
});


document.addEventListener('DOMContentLoaded', function() {
    var generateTestCasesButton = document.getElementById('generateTestCases');
    generateTestCasesButton.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "generateTestCases"});
        });
    });
});


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "displayTestCases") {
        var outputDiv = document.getElementById('output');
        outputDiv.textContent = request.testCases.join('\n');
    }
});



