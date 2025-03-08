const { google } = require('googleapis');
const { readFileSync } = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const firebaseAdmin = require('firebase-admin');

dotenv.config();

// const serviceAccountPath = path.resolve(__dirname, '..', process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH);
const serviceAccount = {
  type: process.env.SERVICE_ACCOUNT_TYPE,
  project_id: process.env.SERVICE_ACCOUNT_PROJECT_ID,
  private_key_id: process.env.SERVICE_ACCOUNT_PRIVATE_KEY_ID,
  private_key: process.env.SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),  // Ensure correct formatting of the private key
  client_email: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
  client_id: process.env.SERVICE_ACCOUNT_CLIENT_ID,
  auth_uri: process.env.SERVICE_ACCOUNT_AUTH_URI,
  token_uri: process.env.SERVICE_ACCOUNT_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.SERVICE_ACCOUNT_CLIENT_X509_CERT_URL,
  universe_domain: process.env.SERVICE_ACCOUNT_UNIVERSE_DOMAIN
};
serviceAccountJson=JSON.stringify(serviceAccount)
const auth = new google.auth.GoogleAuth({
  credentials: serviceAccountJson,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function fetchSheetData() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: process.env.RANGE,
  });
  return response.data.values;
}

async function syncSheetData(io) {
  try {
    const data = await fetchSheetData();
    console.log('Google Sheets data:', data);

    // Update Firebase Realtime Database
    const db = firebaseAdmin.database();
    await db.ref('/sheetData').set(data); // Ensure this path matches the one in getDashboardData

    // Notify clients about the update
    io.emit('sheetsDataUpdated', data);
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
  }
}

module.exports = {
  syncSheetData,
};