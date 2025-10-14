const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Emergency SOS Development Servers...\n');

// Start backend server
console.log('📡 Starting Backend Server...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Start frontend server
console.log('🌐 Starting Frontend Server...');
const frontend = spawn('npm', ['start'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});

// Handle errors
backend.on('error', (err) => {
  console.error('Backend server error:', err);
});

frontend.on('error', (err) => {
  console.error('Frontend server error:', err);
});

console.log('✅ Both servers are running!');
console.log('Press Ctrl+C to stop both servers.');
