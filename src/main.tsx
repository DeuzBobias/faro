import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js', {scope:'/',updateViaCache:'none'}).catch(() => window.dispatchEvent(new Event('faro-offline-error')))
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
