
const firebaseAdmin = require('firebase-admin');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected');

    // Handle fetch initial data event
    socket.on('fetchInitialData', () => {
      const ref = firebaseAdmin.database().ref('sheetData');
      ref.once('value', (snapshot) => {
        const data = snapshot.val();
        console.log('Initial sheet data sent to client:', data);
        socket.emit('sheetDataUpdated', data);
      });
    });

    // Listen for new column addition events and propagate via Socket.IO
    socket.on('addNewColumn', async (columnData) => {
      const ref = firebaseAdmin.database().ref('sheetData');
      ref.once('value', async (snapshot) => {
        const sheetData = snapshot.val();
        sheetData.columns.push(columnData);
        await ref.set(sheetData);
        console.log('New column added:', columnData);
        io.emit('sheetDataUpdated', sheetData);
      });
    });

    // Listen for new row addition events and propagate via Socket.IO
    socket.on('addNewRow', async (rowData) => {
      const ref = firebaseAdmin.database().ref('sheetData');
      ref.once('value', async (snapshot) => {
        const sheetData = snapshot.val();
        sheetData.rows.push(rowData);
        await ref.set(sheetData);
        console.log('New row added:', rowData);
        io.emit('sheetDataUpdated', sheetData);
      });
    });

    // Listen for changes in Firebase Realtime Database and propagate via Socket.IO
    const ref = firebaseAdmin.database().ref('sheetData');
    ref.on('value', (snapshot) => {
      const data = snapshot.val();
      console.log('Real-time update from Firebase:', data);
      io.emit('sheetDataUpdated', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};