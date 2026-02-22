import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './components/ToastContainer'
import './index.css'
import { store } from './app/store'
import { Provider } from 'react-redux'
import { setCredentials } from './features/auth/authSlice'
import { initSentry } from './config/sentry'

// Initialize Sentry for error tracking (async but non-blocking)
initSentry().catch((e) => {
  // Sentry initialization failed - app continues without error tracking
})

try {
  const token = localStorage.getItem('token')
  if (token) {
    store.dispatch(setCredentials({ token, user: null }))
  }
} catch (e) {
  // Token initialization error - user will need to login again
}

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <ErrorBoundary>
      <Provider store={store}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </Provider>
    </ErrorBoundary>
  )
} catch (e) {
  document.getElementById('root').innerHTML = '<div style="color: white; padding: 20px;">Error rendering app: ' + e.message + '</div>'
}
