const { google } = require('googleapis');
const { readFileSync } = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const firebaseAdmin = require('firebase-admin');

dotenv.config();

const serviceAccountPath = path.resolve(__dirname, '..', process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH);
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
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