const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const WebSocket = require('ws');
const http = require('http');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  const sessionId = req.url.split('/').pop();
  console.log(`WebSocket connection established for session: ${sessionId}`);

  // Send initial question
  const initialQuestion = {
    question: "Do you experience shortness of breath during physical activity?",
    options: [
      { key: "A", value: "Yes, even during light activity" },
      { key: "B", value: "Only during intense exercise" },
      { key: "C", value: "Rarely or never" },
      { key: "D", value: "Not sure" }
    ],
    status: "waiting_for_answer"
  };
  
  ws.send(JSON.stringify(initialQuestion));

  // Handle messages from client
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received answer:', data);

      // Send next question or completion status
      const nextQuestion = {
        question: "Have you noticed any changes in your skin color?",
        options: [
          { key: "A", value: "Yes, my skin appears paler than usual" },
          { key: "B", value: "Yes, I've noticed yellowing of the skin" },
          { key: "C", value: "No changes in skin color" },
          { key: "D", value: "Other changes (rashes, etc.)" }
        ],
        status: "waiting_for_answer"
      };

      ws.send(JSON.stringify(nextQuestion));
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log(`WebSocket connection closed for session: ${sessionId}`);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Sehat API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
server.listen(PORT, HOST, () => {
  console.log(`Server is running on ${HOST}:${PORT}`);
}); 