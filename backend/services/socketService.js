module.exports = (io) => {
    io.on('connection', (socket) => {
      console.log('User connected');
  
      // Send the initial sheet data when a new client connects
      const ref = firebaseAdmin.database().ref('sheetData');
      ref.once('value', (snapshot) => {
        const data = snapshot.val();
        socket.emit('sheetDataUpdated', data);
      });
  
      // Listen for new column and row addition events and propagate via Socket.IO
      socket.on('addNewColumn', async (columnData) => {
        const ref = firebaseAdmin.database().ref('sheetData');
        ref.once('value', async (snapshot) => {
          const sheetData = snapshot.val();
          sheetData.columns.push(columnData);
          await ref.set(sheetData);
          io.emit('sheetDataUpdated', sheetData);
        });
      });
  
      socket.on('addNewRow', async (rowData) => {
        const ref = firebaseAdmin.database().ref('sheetData');
        ref.once('value', async (snapshot) => {
          const sheetData = snapshot.val();
          sheetData.rows.push(rowData);
          await ref.set(sheetData);
          io.emit('sheetDataUpdated', sheetData);
        });
      });
  
      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });
  };
  