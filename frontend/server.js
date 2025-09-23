const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from the React app build directory with cache-busting headers
app.use(express.static(path.join(__dirname, 'build'), {
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// API routes (if any) should go here before the catch-all

// Handle all other routes by serving the React app
app.use((req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on http://0.0.0.0:${PORT}`);
  console.log(`Local:   http://localhost:${PORT}`);
  console.log(`Network: http://192.168.1.3:${PORT}`);
});