
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// --- EMERGENCY DATA CLEANUP ---
// This runs before React even tries to mount. 
// If the app previously crashed due to a massive image in LocalStorage, this clears it.
try {
  const keysToCheck = ['guide_sections', 'guide_profile'];
  keysToCheck.forEach(key => {
    const item = localStorage.getItem(key);
    // If data is > 1MB, it's likely a raw image paste that shouldn't be there.
    // Normal JSON data for this app should be small (<50KB).
    if (item && item.length > 1000000) { 
        console.warn(`[Safety Check] Clearing oversized key: ${key} (${(item.length/1024/1024).toFixed(2)} MB)`);
        localStorage.removeItem(key);
    }
  });
} catch (e) {
  console.error("Storage check failed, attempting full clear", e);
  try { localStorage.clear(); } catch {}
}
// -----------------------------

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
