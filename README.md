# Contextual DeepSeek API

## Description

`contextual-deepseek-api` is an API powered by DeepSeek AI and Ollama. It responds to queries in Spanish based on a context file, providing answers specifically tailored to the contents of that file. In this case, it answers questions related to making Venezuelan Reina Pepiada arepas.

## Features

- **Contextual Responses**: The API provides answers based on a context document.
- **Spanish Responses**: Answers are always returned in Spanish.
- **Simple to Use**: Send queries via HTTP POST and get concise answers in JSON format.

## Prerequisites

- **Node.js** (version 16.x or higher)
- **DeepSeek AI** (using Ollama)
- **Ollama** installed and configured

## Installation

To install DeepSeek with Ollama, follow these steps:

```bash
# Download and install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull the DeepSeek model
sudo ollama pull deepseek-r1:8b

## Start server
npm start
```
