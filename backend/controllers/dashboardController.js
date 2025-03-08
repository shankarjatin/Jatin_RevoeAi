const firebaseAdmin = require('firebase-admin');
const SheetData = require('../models/sheetDataModel');

// Helper function to remove invalid keys
const removeInvalidKeys = (data) => {
  const cleanData = JSON.parse(JSON.stringify(data));
  delete cleanData._id;
  delete cleanData.__v;
  return cleanData;
};

// Create a new table
exports.createTable = async (req, res) => {
  const { columns } = req.body;

  try {
    // Validate columns
    if (!columns || !Array.isArray(columns) || columns.length === 0) {
      return res.status(400).json({ message: 'Columns are required' });
    }

    // Ensure columns are formatted correctly
    const newTableData = {
      columns: columns.map(col => ({
        name: col.name,
        type: col.type || 'text', // Default to 'text' if no type is specified
      })),
      rows: [],
    };

    const sheetData = new SheetData(newTableData);
    await sheetData.save();

    // Remove invalid keys before saving to Firebase
    const cleanData = removeInvalidKeys(newTableData);

    // Update Firebase Realtime Database
    await firebaseAdmin.database().ref('sheetData').set(cleanData);

    res.status(201).json(newTableData);
  } catch (err) {
    console.error('Error creating table:', err);
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

    res.status(200).json(sheetData);
  } catch (err) {
    console.error('Error adding new row:', err);
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
    sheetData.rows = sheetData.rows.map(row => [...row, '']);
    await sheetData.save();

    res.status(200).json(sheetData);
  } catch (err) {
    console.error('Error adding new column:', err);
    res.status(500).json({ message: 'Error adding new column', error: err });
  }
};

// Add data to a specific cell
exports.addCellData = async (req, res) => {
  const { rowIndex, columnName, cellData } = req.body;

  try {
    const sheetData = await SheetData.findOne({});
    if (!sheetData) return res.status(400).json({ message: 'Table not found' });

    const columnIndex = sheetData.columns.findIndex(col => col.name === columnName);
    if (columnIndex === -1) {
      return res.status(400).json({ message: 'Column not found' });
    }

    // Ensure the row exists, if not, create it
    while (sheetData.rows.length <= rowIndex) {
      sheetData.rows.push(Array(sheetData.columns.length).fill(''));
    }

    sheetData.rows[rowIndex][columnIndex] = cellData;
    await sheetData.save();

    res.status(200).json(sheetData);
  } catch (err) {
    console.error('Error adding cell data:', err);
    res.status(500).json({ message: 'Error adding cell data', error: err });
  }
};
// Fetch data from Firebase
const fetchFirebaseData = async () => {
  const ref = firebaseAdmin.database().ref('sheetData'); // Ensure this path matches the one in syncSheetData
  const snapshot = await ref.once('value');
  return snapshot.exists() ? snapshot.val() : null;
};

// Fetch data from MongoDB
const fetchMongoData = async () => {
  const mongoData = await SheetData.findOne({});
  if (!mongoData) return null;

  const mongoColumns = mongoData.columns.map(col => col.name);
  const mongoRows = mongoData.rows;

  return [mongoColumns, ...mongoRows];
};

// Get dashboard data (sheetData)
exports.getDashboardData = async (req, res) => {
  try {
    console.log('Fetching data from Firebase...');
    const firebaseData = await fetchFirebaseData();

    console.log('Fetching data from MongoDB...');
    const mongoData = await fetchMongoData();

    if (!firebaseData && !mongoData) {
      console.log('No data found in Firebase or MongoDB.');
      return res.status(404).json({ message: 'No data found' });
    }

    // Combine data from Firebase and MongoDB
    let combinedData = [];

    if (firebaseData) {
      combinedData = Array.isArray(firebaseData) ? firebaseData : [];
    }

    if (mongoData) {
      const mongoColumns = mongoData[0];
      const mongoRows = mongoData.slice(1);

      if (combinedData.length === 0) {
        combinedData.push(mongoColumns);
      } else {
        combinedData[0] = [...new Set([...combinedData[0], ...mongoColumns])];
      }

      mongoRows.forEach((mongoRow, index) => {
        if (combinedData[index + 1]) {
          combinedData[index + 1] = [...combinedData[index + 1], ...mongoRow];
        } else {
          combinedData.push(mongoRow);
        }
      });
    }

    console.log('Combined data:', combinedData);
    res.status(200).json(combinedData);
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ message: 'Error fetching dashboard data', error: err });
  }
};