const mongoose = require('mongoose');

const sheetDataSchema = new mongoose.Schema({
  columns: [{ name: String, type: String }],
  rows: [[String]],
});

const SheetData = mongoose.model('SheetData', sheetDataSchema);
module.exports = SheetData;
