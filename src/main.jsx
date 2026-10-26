import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './app/App.jsx'
import './styles/tokens.css'
import './styles/global.css'
createRoot(document.getElementById('root')).render(<HashRouter><App /></HashRouter>)
