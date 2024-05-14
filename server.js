const express = require('express');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// WebSocket Server setup
const wss = new WebSocket.Server({ port: 8081 });

// Ensure the upload directory exists
const uploadDirectory = path.join(__dirname, 'display');
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

// CORS middleware setup
app.use(cors());

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        cb(null, 'display.png'); // Always save as display.png
    }
});
const upload = multer({ storage: storage });

// Body parser middleware
app.use(bodyParser.json());

// Middleware to log requests
app.use((req, res, next) => {
    console.log('Request URL:', req.originalUrl);
    next();
});

// Serve static files from 'display' directory
app.use('/display', express.static(uploadDirectory));

// WebSocket connection handling
wss.on('connection', function connection(ws) {
    console.log('WebSocket client connected');
    ws.on('message', function incoming(message) {
        console.log('Message from Java backend:', message);
        // Broadcast to all clients
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(`received: ${message}`);
            }
        });
    });
});

// POST route to trigger updates to clients
app.post('/notify', (req, res) => {
    console.log("Received notification from Java backend");
    let count = 0;
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send('update');
            count++;
        }
    });
    console.log(`Update sent to ${count} clients.`);
    res.status(200).send("Notification sent to all clients.");
});

// File upload route
app.post('/display', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const imagePath = `/display/${req.file.filename}`;
    res.status(200).send({ imagePath });
    console.log("Image Path sent: " + imagePath)
});

// Start HTTP server
app.listen(PORT, () => {
    console.log(`HTTP server running on port ${PORT}`);
});
