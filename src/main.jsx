import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import { ProgressProvider } from './hooks/useProgress'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <HelmetProvider>
                <ProgressProvider>
                    <App />
                </ProgressProvider>
            </HelmetProvider>
        </BrowserRouter>
    </React.StrictMode>,
)
