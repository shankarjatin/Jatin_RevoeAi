const express = require('express');
const { createTable, addNewRow, addNewColumn, getDashboardData, addCellData } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Route to create a table
router.post('/create-table', createTable);

// Route to add a new row to the table
router.post('/add-row', addNewRow);

// Route to add a new column to the table
router.post('/add-column', addNewColumn);

router.post('/add-cell-data' , addCellData);

// Route to get the dashboard data (sheetData)
router.get('/', authMiddleware ,getDashboardData);

module.exports = router;
