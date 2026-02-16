import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'
import { store } from './app/store'
import { Provider } from 'react-redux'
import { setCredentials } from './features/auth/authSlice'
import { initSentry } from './config/sentry'

// Initialize Sentry for error tracking (async but non-blocking)
initSentry().catch((e) => {
  console.warn('Sentry initialization skipped:', e.message)
})

try {
  const token = localStorage.getItem('token')
  if (token) {
    store.dispatch(setCredentials({ token, user: null }))
  }
} catch (e) {
  console.error('Token init error:', e)
}

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <ErrorBoundary>
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>
  )
} catch (e) {
  console.error('React render error:', e)
  document.getElementById('root').innerHTML = '<div style="color: white; padding: 20px;">Error rendering app: ' + e.message + '</div>'
}
