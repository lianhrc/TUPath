import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

// Remove any socket.io client initialization if present
// import { io } from 'socket.io-client';
// const socket = io('http://localhost:3001');

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
