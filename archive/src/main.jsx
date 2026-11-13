import React from 'react';
import ReactDOM from 'react-dom/client';

/* Self-hosted variable type — no network dependency, no layout shift. */

import '@fontsource-variable/bricolage-grotesque/index.css';
import '@fontsource-variable/figtree/index.css';
import '@fontsource-variable/figtree/wght-italic.css';
import './index.css';
import './styles/sections.css';
import './styles/content-renderer.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
