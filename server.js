import express from 'express';
import fs from 'fs/promises';
import ollama from 'ollama';

const app = express();
const port = process.env.PORT || 3000;
const filePath = process.env.DATA_FILE_PATH || 'data.txt';

// Middleware for parsing JSON
app.use(express.json());

// Function to read file contents
const readFileData = async () => {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (err) {
    console.error('Error reading the file:', err);
    return null;
  }
};

// Construct query for Ollama
const constructQuery = (data, userInput) => {
  return `Be as brief and concise as possible, respond only in Spanish. Data:${data}. Query:${userInput}`;
};

// Endpoint to handle requests
app.post('/ask', async (req, res) => {
  const userInput = req.body.query || 'Hello';
  const data = await readFileData();

  if (!data) {
    return res.status(500).json({ error: 'Data file is missing or cannot be read.' });
  }

  try {
    const response = await ollama.chat({
      model: 'deepseek-r1:8b',
      messages: [
        { role: 'user', content: constructQuery(data, userInput) }
      ]
    });

    const cleanResponse = response?.message?.content
      ? response.message.content.replace(/<think>.*?<\/think>/gs, '').trim()
      : 'No response received.';
    res.json({ response: cleanResponse });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to process the request.' });
  }
});

// Root endpoint to describe the API
app.get('/', (req, res) => {
  res.json({
    message: "Welcome to the DeepSeek AI API! This API provides answers in Spanish to help you with various topics.",
    usage: {
      endpoint: "/ask",
      method: "POST",
      body: {
        query: "Your question here"
      },
      example: {
        query: "Cómo hacer unas arepas venezolanas de reina pepiada?"
      },
      response: {
        response: "Step-by-step instructions in Spanish."
      }
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
