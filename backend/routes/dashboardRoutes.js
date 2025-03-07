const express = require('express');
const { createTable, addNewRow, addNewColumn, getDashboardData } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Route to create a table
router.post('/create-table', authMiddleware, createTable);

// Route to add a new row to the table
router.post('/add-row', authMiddleware, addNewRow);

// Route to add a new column to the table
router.post('/add-column', authMiddleware, addNewColumn);

// Route to get the dashboard data (sheetData)
router.get('/', getDashboardData);

module.exports = router;
