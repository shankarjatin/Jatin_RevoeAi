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
app.use(cors());
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Update this to match your client URL
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(cors({
  origin: "http://localhost:3001", // Update this to match your client URL
  methods: ["GET", "POST"],
  allowedHeaders: ['Authorization'],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Firebase initialization
const serviceAccountJson = {
  type: process.env.NEW_SERVICE_ACCOUNT_TYPE,
  project_id: process.env.NEW_SERVICE_ACCOUNT_PROJECT_ID,
  private_key_id: process.env.NEW_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
  private_key: process.env.NEW_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Socket.IO Real-time communication
socketService(io);


// Sync Google Sheets data every minute to check for updates
setInterval(() => {
  googleSheetsService.syncSheetData(io);
}, 6000);

// Start server
server.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

