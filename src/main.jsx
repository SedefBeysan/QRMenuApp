import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Kitchen from './Kitchen.jsx'

// URL /kitchen ise mutfak ekranını, aksi halde müşteri uygulamasını göster
const isKitchen = window.location.pathname.startsWith('/kitchen');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isKitchen ? <Kitchen /> : <App />}
  </StrictMode>,
)
