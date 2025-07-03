import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Import CSS del Design React Kit e Bootstrap Italia
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';

// Import font ufficiali (opzionali ma consigliati)
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
