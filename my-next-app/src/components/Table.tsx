import React, { useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { FaSave } from 'react-icons/fa';
const API_BASE_URL = 'https://jatin-revoeai-1.onrender.com/api';

type Column = {
  name: string;
};

type Row = {
  [key: string]: string;
};

type TableProps = {
  columns: Column[];
  rows: Row[];
};

const Table: React.FC<TableProps> = ({ columns = [], rows = [] }) => {
  const [cookies] = useCookies(['token']);
  const [tableData, setTableData] = useState<Row[]>(rows);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number, columnIndex: number } | null>(null);

  const handleCellChange = (rowIndex: number, columnIndex: number, value: string) => {
    const updatedRows = [...tableData];
    const columnName = columns[columnIndex].name;
    updatedRows[rowIndex] = { ...updatedRows[rowIndex], [columnName]: value };
    setTableData(updatedRows);
    setEditingCell({ rowIndex, columnIndex });
  };

  const handleCellSave = async (rowIndex: number, columnIndex: number, value: string) => {
    const columnName = columns[columnIndex].name;

    try {
      await axios.post(`${API_BASE_URL}/dashboard/add-cell-data`, {
        rowIndex,
        columnName,
        cellData: value,
      }, {
        headers: { Authorization: `Bearer ${cookies.token}` },
      });
      setEditingCell(null);
    } catch (err) {
      console.error('Error updating cell data', err);
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen flex items-center justify-center">
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-200">
          <thead className="text-xs text-gray-400 uppercase bg-gray-800">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="py-3 px-6">
                  {column.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-gray-700 border-b border-gray-600">
                {columns.map((column, cellIndex) => (
                  <td key={cellIndex} className="py-4 px-6">
                    <input
                      type="text"
                      value={row[column.name] || ''}
                      onChange={(e) => handleCellChange(rowIndex, cellIndex, e.target.value)}
                      className="w-full p-2 text-gray-200 bg-gray-800 rounded-md focus:border-blue-600 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    />
                    {editingCell && editingCell.rowIndex === rowIndex && editingCell.columnIndex === cellIndex && (
                      <button
                        onClick={() => handleCellSave(rowIndex, cellIndex, row[column.name] || '')}
                        className="absolute right-0 top-0 mt-1 mr-1 p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                      >
                        <FaSave />
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;