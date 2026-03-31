import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.expand();
  window.Telegram.WebApp.setHeaderColor('#0a0a0a');
}

// ─────────────────────────────────────────────
// ⚠️  ВСТАВТЕ СВОЇ ДАНІ НИЖЧЕ
// ─────────────────────────────────────────────
const JSONBIN_API_KEY = $2a$10$xAyiLsfjc7iiTNafAWLhzuQF0r82sRQVF8JBHCozA.3abgquN4QDK;
const JSONBIN_BIN_ID  = '69cba290aaba882197ae7e53';
// ─────────────────────────────────────────────

const BASE_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;
const HEADERS  = {
  'Content-Type': 'application/json',
  'X-Master-Key': JSONBIN_API_KEY,
  'X-Bin-Versioning': 'false',
};

let remoteCache = null;
let cacheTs = 0;
const CACHE_TTL = 3000;

async function fetchBin() {
  const now = Date.now();
  if (remoteCache && now - cacheTs < CACHE_TTL) return remoteCache;
  try {
    const res = await fetch(BASE_URL + '/latest', { headers: HEADERS });
    if (!res.ok) throw new Error('fetch failed');
    const json = await res.json();
    remoteCache = json.record || {};
    cacheTs = now;
    return remoteCache;
  } catch {
    return remoteCache || {};
  }
}

async function writeBin(data) {
  remoteCache = data;
  cacheTs = Date.now();
  await fetch(BASE_URL, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify(data),
  });
}

window.storage = {
  get: async (key) => {
    const data = await fetchBin();
    if (!(key in data)) throw new Error('not found');
    return { key, value: data[key] };
  },
  set: async (key, value) => {
    const data = await fetchBin();
    data[key] = value;
    await writeBin(data);
    return { key, value };
  },
  delete: async (key) => {
    const data = await fetchBin();
    delete data[key];
    await writeBin(data);
    return { key, deleted: true };
  },
  list: async (prefix = '') => {
    const data = await fetchBin();
    const keys = Object.keys(data).filter(k => k.startsWith(prefix));
    return { keys };
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
