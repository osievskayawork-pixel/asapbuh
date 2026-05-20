import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.expand()
  window.Telegram.WebApp.setHeaderColor('#0a0a0a')
}

const NPOINT_ID = '4bcb34e4b0673c6c9965'
const BASE_URL  = `https://api.npoint.io/${NPOINT_ID}`

let cache = null, cacheTs = 0

async function fetchData() {
  if (cache && Date.now() - cacheTs < 3000) return cache
  try {
    const res = await fetch(BASE_URL)
    if (!res.ok) return cache || {}
    cache = await res.json()
    cacheTs = Date.now()
    return cache
  } catch { return cache || {} }
}

async function writeData(data) {
  cache = data
  cacheTs = Date.now()
  try {
    await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  } catch {}
}

window.storage = {
  get: async (k) => {
    const d = await fetchData()
    if (!(k in d)) throw new Error('not found')
    return { key: k, value: d[k] }
  },
  set: async (k, v) => {
    const d = await fetchData()
    d[k] = v
    await writeData(d)
    return { key: k, value: v }
  },
  delete: async (k) => {
    const d = await fetchData()
    delete d[k]
    await writeData(d)
    return { key: k, deleted: true }
  },
  list: async (p = '') => {
    const d = await fetchData()
    return { keys: Object.keys(d).filter(k => k.startsWith(p)) }
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
