import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.expand()
  window.Telegram.WebApp.setHeaderColor('#0a0a0a')
}

const JSONBIN_API_KEY = '$2a$10$HBwc7qkgRWYcMTa6yMVA4eJmD6lSdx.8dy6/j9kqYg45qVFVwzBTe'
const JSONBIN_BIN_ID  = '69cba290aaba882197ae7e53'

const BASE_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`
const HEADERS  = {
  'Content-Type': 'application/json',
  'X-Master-Key': JSONBIN_API_KEY,
  'X-Bin-Versioning': 'false'
}

let cache = null, cacheTs = 0

function showStatus(msg, type) {
  let el = document.getElementById('__ss')
  if (!el) {
    el = document.createElement('div')
    el.id = '__ss'
    el.style.cssText = 'position:fixed;bottom:0;left:0;right:0;padding:8px;font-size:12px;font-family:monospace;z-index:99999;text-align:center'
    document.body.appendChild(el)
  }
  el.style.background = type==='err' ? '#c00' : type==='ok' ? '#1a6b3a' : '#333'
  el.style.color = '#fff'
  el.textContent = msg
  if (type==='ok') setTimeout(() => { el.textContent = '' }, 2000)
}

async function fetchBin() {
  if (cache && Date.now() - cacheTs < 3000) return cache
  try {
    showStatus('⏳ Синхронізація...')
    const res = await fetch(BASE_URL + '/latest', { headers: HEADERS })
    if (!res.ok) {
      showStatus('❌ JSONBin ' + res.status + ': перевір API ключ і BIN ID', 'err')
      return cache || {}
    }
    const json = await res.json()
    cache = json.record || {}
    cacheTs = Date.now()
    showStatus('✅ OK', 'ok')
    return cache
  } catch(e) {
    showStatus('❌ Мережа: ' + e.message, 'err')
    return cache || {}
  }
}

async function writeBin(data) {
  cache = data
  cacheTs = Date.now()
  try {
    showStatus('💾 Збереження...')
    const res = await fetch(BASE_URL, {
      method: 'PUT',
      headers: HEADERS,
      body: JSON.stringify(data)
    })
    if (!res.ok) showStatus('❌ Збереження ' + res.status, 'err')
    else showStatus('✅ Збережено', 'ok')
  } catch(e) {
    showStatus('❌ ' + e.message, 'err')
  }
}

window.storage = {
  get: async (k) => {
    const d = await fetchBin()
    if (!(k in d)) throw new Error('not found')
    return { key: k, value: d[k] }
  },
  set: async (k, v) => {
    const d = await fetchBin()
    d[k] = v
    await writeBin(d)
    return { key: k, value: v }
  },
  delete: async (k) => {
    const d = await fetchBin()
    delete d[k]
    await writeBin(d)
    return { key: k, deleted: true }
  },
  list: async (p = '') => {
    const d = await fetchBin()
    return { keys: Object.keys(d).filter(k => k.startsWith(p)) }
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
