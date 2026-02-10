import { StrictMode } from 'react';  // named import
import { createRoot } from 'react-dom/client';
import App from './App';
import { ReactFlowProvider } from 'reactflow';

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  </StrictMode>
);