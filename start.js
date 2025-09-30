#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting AirBnB Backend and Frontend...\n');

let backend = null;
let frontend = null;

// Iniciar el backend
console.log('📡 Starting Backend Server (Port 4000)...');
backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

backend.on('error', (err) => {
  console.error('❌ Backend error:', err);
  cleanup();
});


backend.on('exit', () => {
  console.log('📡 Backend exited');
  cleanup();
});

// Dar tiempo para que el backend inicie
setTimeout(() => {
  console.log('🌐 Starting Frontend Server (Port 3000)...');
  
  frontend = spawn('npm', ['start'], {
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'inherit',
    shell: true
  });

  frontend.on('error', (err) => {
    console.error('❌ Frontend error:', err);
    cleanup();
  });

  frontend.on('exit', () => {
    console.log('🌐 Frontend exited');
    cleanup();
  });

}, 3000);

function cleanup() {
  console.log('\n🛑 Shutting down servers...');
  if (backend && !backend.killed) {
    backend.kill();
  }
  if (frontend && !frontend.killed) {
    frontend.kill();
  }
  process.exit(0);
}

// Manejar la terminación
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);