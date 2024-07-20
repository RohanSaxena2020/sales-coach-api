const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

const cors = require('cors');
app.use(cors());

// Endpoint to handle the form submission
app.post('/analyze', async (req, res) => {
    const { transcript } = req.body;
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/engines/davinci-codex/completions',
            {
                prompt: `Provide a detailed analysis of this sales call transcript: "${transcript}"`,
                max_tokens: 150
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        res.send(response.data.choices[0].text);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing the request');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
