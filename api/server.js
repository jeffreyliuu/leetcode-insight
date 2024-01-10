const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Endpoint to receive problem data and return test cases
app.post('/generate-test-cases', async (req, res) => {
    try {
        const problemData = req.body;
        const testCases = await generateTestCases(problemData);
        res.json({ testCases });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Function that uses OpenAI to obtain generated test cases
async function generateTestCases(problemData) {
    const prompt = createPrompt(problemData);
    const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
        prompt: prompt,
        max_tokens: 150
    }, {
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    const testCases = response.data.choices[0].text;
    console.log(testCases);
    return testCases;
}

function createPrompt({ problemStatement, constraints, examples }) {
    return `Given the problem statement: ${problemStatement}, with constraints: ${constraints}, and examples: ${examples}, generate 3 test cases.`;
}


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});