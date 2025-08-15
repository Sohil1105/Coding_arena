#!/usr/bin/env node
/**
 * Development startup script for Coding Arena
 * This script sets up the environment variables for local development
 * and starts all services in parallel.
 */

const { spawn } = require('child_process');
const path = require('path');

// Set environment variables for local development
process.env.COMPILER_URL = 'http://localhost:8000';
process.env.NODE_ENV = 'development';

console.log('🚀 Starting Coding Arena Development Environment...');
console.log('📍 Compiler URL: http://localhost:8000');
console.log('📍 Server URL: http://localhost:5000');
console.log('📍 Client URL: http://localhost:3000');

// Start all services in parallel
const services = [
  { name: 'Compiler', command: 'npm', args: ['start'], cwd: path.join(__dirname, '../compiler') },
  { name: 'Server', command: 'npm', args: ['start'], cwd: path.join(__dirname, '../server') },
  { name: 'Client', command: 'npm', args: ['start'], cwd: path.join(__dirname, '../client') }
];

services.forEach(service => {
  console.log(`🔄 Starting ${service.name}...`);
  const child = spawn(service.command, service.args, {
    cwd: service.cwd,
    stdio: 'inherit',
    env: { ...process.env, COMPILER_URL: 'http://localhost:8000' }
  });

  child.on('error', (err) => {
    console.error(`❌ Error starting ${service.name}:`, err);
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ ${service.name} exited with code ${code}`);
    }
  });
});

console.log('✅ All services started successfully!');
console.log('🌐 Access the application at: http://localhost:3000');
