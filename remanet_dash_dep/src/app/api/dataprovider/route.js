// src/app/api/dataprovider/route.js
import { Server } from 'socket.io';
import { WebSocket } from 'ws';

let wsClient = null;
let wsConnected = false;
let cachedData = [];
let io;

// This is a helper function to initialize Socket.IO
function initSocketIO(res) {
  if (!io) {
    // Initialize Socket.IO with the server
    io = new Server(res.socket.server);
    
    // Handle connections from clients
    io.on('connection', (socket) => {
      console.log('New client connected');
      
      // Send cached data to newly connected client
      if (cachedData.length > 0) {
        socket.emit('data', cachedData);
      }
      
      // Handle filter date change
      socket.on('filterDate', (date) => {
        if (wsConnected) {
          wsClient.send(JSON.stringify({ filter_date: date }));
        }
      });
      
      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
    
    // Connect to FastAPI WebSocket
    connectWebSocket();
  }
}

// Function to connect to FastAPI WebSocket
function connectWebSocket() {
  wsClient = new WebSocket('ws://localhost:3001/ws/next-client');
  
  wsClient.onopen = () => {
    console.log('Connected to FastAPI WebSocket');
    wsConnected = true;
  };
  
  wsClient.onmessage = (event) => {
    const data = JSON.parse(event.data);
    cachedData = data;
    if (io) {
      io.emit('data', data);
    }
  };
  
  wsClient.onclose = () => {
    console.log('Disconnected from FastAPI WebSocket');
    wsConnected = false;
    // Try to reconnect after a delay
    setTimeout(connectWebSocket, 5000);
  };
  
  wsClient.onerror = (error) => {
    console.error('WebSocket error:', error);
    wsClient.close();
  };
}

// Export the GET handler for the API route
export async function GET(request) {
  const res = new Response(JSON.stringify({ message: 'WebSocket server initialized' }));
  
  // Add the socket.io server to the response
  if (!res.socket?.server?.io) {
    res.socket.server.io = true; // Mark as initialized
    initSocketIO(res);
  }
  
  return res;
}