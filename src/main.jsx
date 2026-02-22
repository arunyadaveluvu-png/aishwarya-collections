import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './mobile.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { WishlistProvider } from './context/WishlistContext'

const rootElement = document.getElementById('root');
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <App />
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)