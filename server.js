import express from 'express';
import fs from 'fs/promises';
import ollama from 'ollama';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;
const filePath = process.env.DATA_FILE_PATH || 'arepas_reina_pepiada.spanish.txt';


// Extract topic and language from file name
const extractTopicAndLanguage = (fileName) => {
  const match = fileName.match(/^(.+)\.(\w+)\.txt$/);
  if (!match) {
    throw new Error('Invalid file name format. Expected {topic}.{language}.txt');
  }
  return {
    topic: match[1].replace(/_/g, ' '), // Replace underscores with spaces
    language: match[2][0].toUpperCase() + match[2].slice(1) // Capitalize first letter
  };
};

let CONFIG;
try {
  CONFIG = extractTopicAndLanguage(path.basename(filePath));
} catch (error) {
  console.error(`${getTime()} - SERVER - ${error.message}`);
  process.exit(1); // Stop execution if the filename format is incorrect
}

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

// Construct queries for Ollama
const constructValidationQuery = (userInput) => {
  return `Be concise, respond only in ${CONFIG.language}. Is the following query related to "${CONFIG.topic}"? Respond with "yes" or "no". Query: ${userInput}`;
};

const constructQuery = (data, userInput) => {
  return `Directives: Be as brief and concise as possible, language only ${CONFIG.language}. Data:${data}. Query:${userInput}.`;
};

// Endpoint to handle requests
app.post('/ask', async (req, res) => {
  const userInput = req.body.query || 'Hello';
  const data = await readFileData();

  if (!data) {
    return res.status(500).json({ error: 'Data file is missing or cannot be read.' });
  }

  try {
    // Step 1: Validate if the query is about the specified topic
    const validationResponse = await ollama.chat({
      model: 'deepseek-r1:8b',
      messages: [
        { role: 'user', content: constructValidationQuery(userInput) }
      ]
    });

    const isRelated = validationResponse?.message?.content.trim().split('\n').pop().toLowerCase() === 'yes';

    if (!isRelated) {
      return res.json({
        response: `This API only responds to questions about ${TOPIC}.`
      });
    }

    // Step 2: If related, forward the actual query
    const mainResponse = await ollama.chat({
      model: 'deepseek-r1:8b',
      messages: [
        { role: 'user', content: constructQuery(data, userInput) }
      ]
    });

    const cleanResponse = mainResponse?.message?.content
      ? mainResponse.message.content.replace(/<think>[^]*?<\/think>/g, '').trim()
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
    message: `Welcome to the DeepSeek AI API! This API provides answers in ${LANGUAGE} about ${TOPIC}.`,
    usage: {
      endpoint: "/ask",
      method: "POST",
      body: {
        query: "Your question here"
      },
      example: {
        query: `Cómo hacer unas ${CONFIG.topic}?`
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
