import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.expand();
  window.Telegram.WebApp.setHeaderColor('#0a0a0a');
}

window.storage = (() => {
  const P = 'asap_';
  return {
    get: async (key) => {
      const val = localStorage.getItem(P + key);
      if (val === null) throw new Error('not found');
      return { key, value: val };
    },
    set: async (key, value) => {
      localStorage.setItem(P + key, value);
      return { key, value };
    },
    delete: async (key) => {
      localStorage.removeItem(P + key);
      return { key, deleted: true };
    },
    list: async (prefix = '') => {
      const keys = Object.keys(localStorage)
        .filter(k => k.startsWith(P + prefix))
        .map(k => k.slice(P.length));
      return { keys };
    }
  };
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
