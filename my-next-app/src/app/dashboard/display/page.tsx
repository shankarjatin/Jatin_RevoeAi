'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useCookies } from 'react-cookie';

import Table from '../../../components/Table';
const API_BASE_URL = 'https://jatin-revoeai-9o4l.onrender.com/api';

type Column = {
  name: string;
};

type Row = {
  [key: string]: string;
};

const Dashboard = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [newColumn, setNewColumn] = useState('');
  const [columnType, setColumnType] = useState('text');
  const [isLoading, setIsLoading] = useState(true);
  const [cookies, , removeCookie] = useCookies(['token']);
  const router = useRouter();
  const token = cookies.token;

  useEffect(() => {
    if (!token) {
      router.push('/dashboard/auth/login');
      return;
    }

    const fetchData = () => {
      axios.get(`${API_BASE_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => {
        console.log('Data from MongoDB:', response.data);
        const [columnNames, ...rowData] = response.data;
        setColumns(columnNames.map((name: string) => ({ name })));
        setRows(rowData); // Ensure rowData is an array of objects
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
    };

    // Initial fetch and setting up interval
    fetchData();
    const intervalId = setInterval(fetchData, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [token, router]);

  const handleAddColumn = async () => {
    if (newColumn) {
      const columnData = { columnName: newColumn, columnType };
      try {
        const response = await axios.post(`${API_BASE_URL}/dashboard/add-column`, columnData, {
          headers: { Authorization: `Bearer ${cookies.token}` },
        });
        const updatedData = response.data;
        const newColumnNames = updatedData.columns.map((col: Column) => col.name);
        const newRows = updatedData.rows;

        setColumns(newColumnNames.map((name: string) => ({ name })));
        setRows(newRows);
        setNewColumn('');
        // Refresh the page to reflect the new column
        window.location.reload();
      } catch (err) {
        console.error("Error adding column", err);
      }
    }
  };

  const handleAddRow = async () => {
    const rowData = Array(columns.length).fill('');
    try {
      await axios.post(`${API_BASE_URL}/dashboard/add-row`, { rowData }, {
        headers: { Authorization: `Bearer ${cookies.token}` },
      });
      // Fetch the updated data
      const response = await axios.get(`${API_BASE_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${cookies.token}` },
      });
      const updatedData = response.data;
      const newColumnNames = updatedData.columns.map((col: Column) => col.name);
      const newRows = updatedData.rows;
  
      setColumns(newColumnNames.map((name: string) => ({ name })));
      setRows(newRows);
      // Refresh the page to reflect the new row
      window.location.reload();
    } catch (err) {
      console.error("Error adding row", err);
    }
  };
  const handleLogout = () => {
    removeCookie('token', { path: '/' });
    localStorage.removeItem('token');
    router.push('/dashboard/auth/login');
  };

  return (
    <div className="bg-gray-950 p-8 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-semibold text-gray-200 mb-4">Dashboard Integrated with Spreadsheet</h1>
        <br></br>
        <br></br>
        <p className="text-blue-300 mb-4">
           <a href="https://docs.google.com/spreadsheets/d/13Uu2l9zT9Vo4ZpK2kSmsXLqTm7yoWgSpjmT1_8NjA58/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className='text-blue-200'>Check and update the spreadsheet details here</a>.
        </p>
        <button onClick={handleLogout} className="p-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
          Logout
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="New Column Name"
          value={newColumn}
          onChange={(e) => setNewColumn(e.target.value)}
          className="p-2 w-full md:w-auto border border-gray-700 bg-gray-800 text-white rounded focus:border-blue-600 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
        <select
          value={columnType}
          onChange={(e) => setColumnType(e.target.value)}
          className="p-2 border border-gray-700 bg-gray-800 text-white rounded focus:border-blue-600 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        >
          <option value="text">Text</option>
          <option value="date">Date</option>
        </select>
        <button onClick={handleAddColumn} className="p-2 bg-green-500 text-white rounded ml-2 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
          Add Column
        </button>
      </div>

      <div className="mb-4">
        <button onClick={handleAddRow} className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50">
          Add New Row
        </button>
      </div>

      {isLoading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <Table columns={columns} rows={rows.map(row => Object.values(row))} />
      )}
    </div>
  );
};

export default Dashboard;