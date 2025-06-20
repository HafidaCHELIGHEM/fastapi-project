// pages/api/websocket.js
import { Server } from 'socket.io';
import WebSocket from 'ws';

let wsClient = null;
let wsConnected = false;
let cachedData = [];

export default function handler(req, res) {
  if (res.socket.server.io) {
    console.log('Socket.IO already running');
    res.end();
    return;
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  // Connect to the FastAPI WebSocket server
  const connectWebSocket = () => {
    wsClient = new WebSocket('ws://localhost:8000/ws/next-client');
    
    wsClient.onopen = () => {
      console.log('Connected to FastAPI WebSocket');
      wsConnected = true;
    };

    wsClient.onmessage = (event) => {
      const data = JSON.parse(event.data);
      cachedData = data;
      io.emit('data', data);
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
  };

  connectWebSocket();

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

  console.log('Setting up Socket.IO');
  res.end();
}
