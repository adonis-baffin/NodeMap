import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ReactFlowProvider } from 'reactflow';

const root = createRoot(document.getElementById('root')!);  // 这里必须是 'root'

root.render(
  <React.StrictMode>
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  </React.StrictMode>
);