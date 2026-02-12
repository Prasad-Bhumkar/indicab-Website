import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'
import { store } from './app/store'
import { Provider } from 'react-redux'
import { setCredentials } from './features/auth/authSlice'
import { initSentry } from './config/sentry'

// Initialize Sentry for error tracking
initSentry()

const token = localStorage.getItem('token')
if (token) {
  store.dispatch(setCredentials({ token, user: null }))
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <Provider store={store}>
      <App />
    </Provider>
  </ErrorBoundary>
)
