const firebaseAdmin = require('firebase-admin');
const SheetData = require('../models/sheetDataModel');

// Create a new table
exports.createTable = async (req, res) => {
  const { columns } = req.body; // Columns should be an array of objects like { name: 'Column1', type: 'text' }

  try {
    // Check if columns are provided and are in the correct format
    if (!columns || !Array.isArray(columns) || columns.length === 0) {
      return res.status(400).json({ message: 'Columns are required' });
    }

    // Define the initial structure of the table in Firebase and MongoDB
    const newTableData = {
      columns: columns.map(col => ({
        name: col.name,
        type: col.type || 'text', // Default to 'text' if no type is specified
      })),
      rows: [], // Initially empty rows
    };

    // Save to MongoDB
    const sheetData = new SheetData(newTableData);
    await sheetData.save();

    // Save to Firebase Realtime Database
    await firebaseAdmin.database().ref('sheetData').set(newTableData);

    // Send the created table structure as response
    res.status(201).json(newTableData);
  } catch (err) {
    res.status(500).json({ message: 'Error creating table', error: err });
  }
};

// Add new row to the table
exports.addNewRow = async (req, res) => {
  const { rowData } = req.body; // rowData should be an array of cell values corresponding to the columns

  try {
    const sheetData = await SheetData.findOne({});
    if (!sheetData) return res.status(400).json({ message: 'Table not found' });

    sheetData.rows.push(rowData);
    await sheetData.save();

    // Update Firebase Realtime Database
    await firebaseAdmin.database().ref('sheetData').set(sheetData);

    res.status(200).json(sheetData);
  } catch (err) {
    res.status(500).json({ message: 'Error adding new row', error: err });
  }
};

// Add new column to the table
exports.addNewColumn = async (req, res) => {
  const { columnName, columnType } = req.body; // Column name and type

  try {
    const sheetData = await SheetData.findOne({});
    if (!sheetData) return res.status(400).json({ message: 'Table not found' });

    sheetData.columns.push({ name: columnName, type: columnType || 'text' });
    await sheetData.save();

    // Update Firebase Realtime Database
    await firebaseAdmin.database().ref('sheetData').set(sheetData);

    res.status(200).json(sheetData);
  } catch (err) {
    res.status(500).json({ message: 'Error adding new column', error: err });
  }
};

// Get dashboard data (sheetData)
exports.getDashboardData = async (req, res) => {
  try {
    const ref = firebaseAdmin.database().ref('sheetData');
    const snapshot = await ref.once('value');
    const data = snapshot.val();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: err });
  }
};
