const mongoose = require('mongoose');

const sheetDataSchema = new mongoose.Schema({
  columns: [
    {
      name: { type: String, required: true },
      type: { type: String, default: 'text' },
    },
  ],
  rows: [
    {
      type: Array,
      default: [],
    },
  ],
});

const SheetData = mongoose.model('SheetData', sheetDataSchema);

module.exports = SheetData;