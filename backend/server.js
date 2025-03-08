const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const firebaseAdmin = require('firebase-admin');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const socketService = require('./services/socketService');
const googleSheetsService = require('./services/googleSheetsService');
const cors = require('cors');

dotenv.config();

// Initialize app
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://jatin-revoe-ai-f67p-lhysazt9t-shankarjatins-projects.vercel.app/",
    methods: ["GET", "POST"],
    credentials: true,
  }
});

// Middlewares
app.use(cors({
  origin: "https://jatin-revoe-ai-f67p-lhysazt9t-shankarjatins-projects.vercel.app/",
  methods: ["GET", "POST"],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

mongoose.connection.on('error', err => {
  console.error('MongoDB connection lost:', err);
});

// Firebase initialization
let serviceAccountJson;
try {
  serviceAccountJson = {
    type: process.env.NEW_SERVICE_ACCOUNT_TYPE,
    project_id: process.env.NEW_SERVICE_ACCOUNT_PROJECT_ID,
    private_key_id: process.env.NEW_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
    private_key: process.env.NEW_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.NEW_SERVICE_ACCOUNT_CLIENT_EMAIL,
    client_id: process.env.NEW_SERVICE_ACCOUNT_CLIENT_ID,
    auth_uri: process.env.NEW_SERVICE_ACCOUNT_AUTH_URI,
    token_uri: process.env.NEW_SERVICE_ACCOUNT_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.NEW_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.NEW_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL,
    universe_domain: process.env.NEW_SERVICE_ACCOUNT_UNIVERSE_DOMAIN
  };

  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccountJson),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
  console.log('Firebase initialized');
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Socket.IO Real-time communication
socketService(io);

// Sync Google Sheets data every 60 seconds
setInterval(() => {
  try {
    googleSheetsService.syncSheetData(io);
  } catch (error) {
    console.error('Google Sheets Sync Error:', error);
  }
}, 60000);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
