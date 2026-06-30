import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

// ── Mocks ──────────────────────────────────────────────────────────────────────

// Spy on the real apiConfig module so all async thunks use our mock

// Mock the blog API module
vi.mock('../../features/blog/blogApi', () => ({
  fetchPublishedBlogsApi: vi.fn().mockResolvedValue({ data: { content: [] } }),
  fetchBlogByIdApi: vi.fn(),
}))

// Mock useSEO hook (used by Blog)
vi.mock('../../hooks/useSEO', () => ({
  useSEO: vi.fn(),
}))

// Mock NotificationBell (used by Header)
vi.mock('../../components/NotificationBell', () => ({
  default: () => <div data-testid="notification-bell">Notifications</div>,
}))

// Mock RideTracker (used by BookingHistory)
vi.mock('../../components/RideTracker', () => ({
  default: () => <div data-testid="ride-tracker">Ride Tracker</div>,
}))

// Mock RatingModal (used by BookingHistory)
vi.mock('../../components/RatingModal', () => ({
  default: ({ booking, onClose }) => (
    <div data-testid="rating-modal">
      <span>Rate booking {booking?.id}</span>
      <button data-testid="close-rating" onClick={onClose}>Close</button>
    </div>
  ),
}))

// ── Imports ────────────────────────────────────────────────────────────────────

import Login from '../../components/Login'
import Register from '../../components/Register'
import Header from '../../components/Header'
import AdminLogin from '../../components/AdminLogin'
import ProtectedRoute from '../../components/ProtectedRoute'
import AdminProtectedRoute from '../../components/AdminProtectedRoute'
import Blog from '../../components/Blog'
import BookingHistory from '../../components/BookingHistory'
import Profile from '../../components/Profile'

// Reducers
import authReducer from '../../features/auth/authSlice'
import blogReducer from '../../features/blog/blogSlice'
import bookingHistoryReducer from '../../features/bookingHistory/bookingHistorySlice'
import ratingReducer from '../../features/rating/ratingSlice'

// apiClient reference for mock (use spyOn to share across reducers)
import * as apiConfig from '../../config/apiConfig'
const apiClient = apiConfig.apiClient

// ── Helpers ────────────────────────────────────────────────────────────────────

const renderWithProviders = (ui, {
  initialState = {},
  store = configureStore({
    reducer: {
      auth: authReducer,
      blog: blogReducer,
      bookingHistory: bookingHistoryReducer,
      rating: ratingReducer,
    },
    preloadedState: initialState,
  }),
} = {}) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>
  )
}

// For route-based testing (MemoryRouter with specific initial entries)
const renderWithRouter = (ui, { initialEntries = ['/'] } = {}) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {ui}
    </MemoryRouter>
  )
}

// ── Tests ──────────────────────────────────────────────────────────────────────

// ============================================================================
// 1. Login Component
// ============================================================================
describe('Login Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(apiClient, 'post').mockResolvedValue({ data: {} })
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: {} })
    vi.spyOn(apiClient, 'put').mockResolvedValue({ data: {} })
  })

  it('renders login form with email and password fields', () => {
    renderWithProviders(<Login />)
    expect(screen.getByText('Login to Your Account')).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields on submit', async () => {
    renderWithProviders(<Login />)
    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    renderWithProviders(<Login />)

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { name: 'email', value: 'invalid-email' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { name: 'password', value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument()
    })
  })

  it('validates minimum password length', async () => {
    renderWithProviders(<Login />)
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { name: 'email', value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { name: 'password', value: 'ab' } })
    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    })
  })

  it('renders loading state when submitting', () => {
    renderWithProviders(<Login />, {
      initialState: {
        auth: { user: null, token: null, loading: true, error: null },
      },
    })
    expect(screen.getByText(/logging in/i)).toBeInTheDocument()
  })

  it('calls login API on submit with valid data', async () => {
    apiClient.post.mockResolvedValue({
      data: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh',
        user: { id: 1, name: 'Test', email: 'test@example.com', role: 'USER' },
      },
    })

    renderWithProviders(<Login />)

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { name: 'email', value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { name: 'password', value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/v1/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('shows error message on failed login', () => {
    renderWithProviders(<Login />, {
      initialState: {
        auth: {
          user: null,
          token: null,
          loading: false,
          error: 'Invalid credentials',
        },
      },
    })
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
  })

  it('disables inputs and button during loading', () => {
    renderWithProviders(<Login />, {
      initialState: {
        auth: { user: null, token: null, loading: true, error: null },
      },
    })
    expect(screen.getByLabelText(/email address/i)).toBeDisabled()
    expect(screen.getByLabelText(/password/i)).toBeDisabled()
    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled()
  })

  it('has link to register page', () => {
    renderWithProviders(<Login />)
    const registerLink = screen.getByText(/register here/i)
    expect(registerLink).toBeInTheDocument()
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register')
  })

  it('shows error from redux state when present', () => {
    renderWithProviders(<Login />, {
      initialState: {
        auth: {
          user: null,
          token: null,
          loading: false,
          error: 'Invalid credentials',
        },
      },
    })
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
  })
})

// ============================================================================
// 2. Register Component
// ============================================================================
describe('Register Component', () => {
  it('renders registration form with all fields', () => {
    renderWithProviders(<Register />)
    expect(screen.getByText('Create Your Account')).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields on submit', async () => {
    renderWithProviders(<Register />)
    fireEvent.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Phone number is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
      expect(screen.getByText('Please confirm your password')).toBeInTheDocument()
    })
  })

  it('validates name minimum length', async () => {
    renderWithProviders(<Register />)
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { name: 'name', value: 'A' } })
    fireEvent.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    renderWithProviders(<Register />)

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { name: 'name', value: 'Test User' } })
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { name: 'email', value: 'bad-email' } })
    fireEvent.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument()
    })
  })

  it('validates phone number is 10 digits', async () => {
    renderWithProviders(<Register />)

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { name: 'name', value: 'Test User' } })
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { name: 'email', value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { name: 'phoneNumber', value: '123' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { name: 'password', value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { name: 'confirmPassword', value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid 10-digit phone number/i)).toBeInTheDocument()
    })
  })

  it('validates password minimum length', async () => {
    renderWithProviders(<Register />)

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { name: 'name', value: 'Test User' } })
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { name: 'email', value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { name: 'phoneNumber', value: '1234567890' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { name: 'password', value: 'ab' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { name: 'confirmPassword', value: 'ab' } })
    fireEvent.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    })
  })

  it('validates passwords match', async () => {
    renderWithProviders(<Register />)

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { name: 'name', value: 'Test User' } })
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { name: 'email', value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { name: 'phoneNumber', value: '1234567890' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { name: 'password', value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { name: 'confirmPassword', value: 'different' } })
    fireEvent.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
  })

  it('calls register API on submit with valid data', async () => {
    apiClient.post.mockResolvedValue({
      data: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh',
        user: { id: 1, name: 'Test User', email: 'test@test.com', role: 'USER' },
      },
    })

    renderWithProviders(<Register />)

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { name: 'name', value: 'Test User' } })
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { name: 'email', value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { name: 'phoneNumber', value: '1234567890' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { name: 'password', value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { name: 'confirmPassword', value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/v1/auth/register', {
        name: 'Test User',
        email: 'test@test.com',
        phoneNumber: '1234567890',
        password: 'password123',
      })
    })
  })

  it('has link to login page', () => {
    renderWithProviders(<Register />)
    const loginLink = screen.getByText(/login here/i)
    expect(loginLink).toBeInTheDocument()
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login')
  })

  it('clears field error when user types', async () => {
    renderWithProviders(<Register />)

    // Submit empty form to trigger all errors
    fireEvent.click(screen.getByRole('button', { name: /register/i }))
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    })

    // Start typing in name field to clear its error
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { name: 'name', value: 'A' } })
    await waitFor(() => {
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
    })
  })
})

// ============================================================================
// 3. Header Component
// ============================================================================
describe('Header Component', () => {
  it('renders brand name and navigation links', () => {
    renderWithProviders(<Header />)
    expect(screen.getByText('IndiCab')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('About Us')).toBeInTheDocument()
    expect(screen.getByText('Travel Packages')).toBeInTheDocument()
    expect(screen.getByText('Blog')).toBeInTheDocument()
    expect(screen.getByText('Contact Us')).toBeInTheDocument()
  })

  it('shows login button and check status link when not authenticated', () => {
    renderWithProviders(<Header />)
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Check Status')).toBeInTheDocument()
  })

  it('hides login and check status when user is authenticated', () => {
    renderWithProviders(<Header />, {
      initialState: {
        auth: {
          user: { id: 1, name: 'John', email: 'john@test.com', role: 'USER' },
          token: 'mock-token',
          loading: false,
          error: null,
        },
      },
    })
    expect(screen.queryByText('Login')).not.toBeInTheDocument()
    expect(screen.queryByText('Check Status')).not.toBeInTheDocument()
  })

  it('shows user name in dropdown when authenticated', () => {
    renderWithProviders(<Header />, {
      initialState: {
        auth: {
          user: { id: 1, name: 'John Doe', email: 'john@test.com', role: 'USER' },
          token: 'mock-token',
          loading: false,
          error: null,
        },
      },
    })
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('shows admin dashboard link when user is admin', () => {
    renderWithProviders(<Header />, {
      initialState: {
        auth: {
          user: { id: 1, name: 'Admin', email: 'admin@test.com', role: 'ADMIN' },
          token: 'mock-admin-token',
          loading: false,
          error: null,
        },
      },
    })
    expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument()
  })

  it('shows driver dashboard link when user is driver', () => {
    renderWithProviders(<Header />, {
      initialState: {
        auth: {
          user: { id: 2, name: 'Driver', email: 'driver@test.com', role: 'DRIVER' },
          token: 'mock-driver-token',
          loading: false,
          error: null,
        },
      },
    })
    expect(screen.getByText(/driver dashboard/i)).toBeInTheDocument()
  })

  it('hides booking history from admin users', () => {
    renderWithProviders(<Header />, {
      initialState: {
        auth: {
          user: { id: 1, name: 'Admin', email: 'admin@test.com', role: 'ADMIN' },
          token: 'mock-admin-token',
          loading: false,
          error: null,
        },
      },
    })
    expect(screen.queryByText('Booking History')).not.toBeInTheDocument()
  })

  it('shows booking history link for regular users', () => {
    renderWithProviders(<Header />, {
      initialState: {
        auth: {
          user: { id: 1, name: 'John', email: 'john@test.com', role: 'USER' },
          token: 'mock-token',
          loading: false,
          error: null,
        },
      },
    })
    // Booking History appears in nav bar AND in user dropdown menu
    const historyLinks = screen.getAllByText('Booking History')
    expect(historyLinks.length).toBeGreaterThanOrEqual(1)
  })

  it('renders notification bell when authenticated', () => {
    renderWithProviders(<Header />, {
      initialState: {
        auth: {
          user: { id: 1, name: 'John', email: 'john@test.com', role: 'USER' },
          token: 'mock-token',
          loading: false,
          error: null,
        },
      },
    })
    expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
  })

  it('shows hamburger toggle button for mobile', () => {
    const { container } = renderWithProviders(<Header />)
    const toggleBtn = container.querySelector('.navbar-toggler')
    expect(toggleBtn).toBeInTheDocument()
  })

  it('toggles mobile menu when hamburger is clicked', () => {
    // Set viewport to mobile width
    global.innerWidth = 800
    global.dispatchEvent(new Event('resize'))

    const { container } = renderWithProviders(<Header />)
    const toggleBtn = container.querySelector('.navbar-toggler')
    fireEvent.click(toggleBtn)

    // The collapse element should have show class
    const navCollapse = document.getElementById('navbarNav')
    expect(navCollapse.classList.contains('show')).toBe(true)
  })
})

// ============================================================================
// 4. AdminLogin Component
// ============================================================================
describe('AdminLogin Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(apiClient, 'post').mockResolvedValue({ data: {} })
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: {} })
    vi.spyOn(apiClient, 'put').mockResolvedValue({ data: {} })
  })

  it('renders admin login form', () => {
    renderWithProviders(<AdminLogin />)
    expect(screen.getByText('Admin Login')).toBeInTheDocument()
    expect(screen.getByText(/access the admin panel/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login as admin/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields on submit', async () => {
    renderWithProviders(<AdminLogin />)
    fireEvent.click(screen.getByRole('button', { name: /login as admin/i }))

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  it('validates email format on admin login', async () => {
    renderWithProviders(<AdminLogin />)

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { name: 'email', value: 'not-an-email' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { name: 'password', value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /login as admin/i }))

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })
  })

  it('calls admin login API on submit', async () => {
    apiClient.post.mockResolvedValue({
      data: {
        accessToken: 'admin-token',
        refreshToken: 'admin-refresh',
        user: { id: 1, name: 'Admin', email: 'admin@test.com', role: 'ADMIN' },
      },
    })

    renderWithProviders(<AdminLogin />)

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { name: 'email', value: 'admin@test.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { name: 'password', value: 'admin123' } })
    fireEvent.click(screen.getByRole('button', { name: /login as admin/i }))

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/v1/auth/admin-login', {
        email: 'admin@test.com',
        password: 'admin123',
      })
    })
  })

  it('shows error from redux state', () => {
    renderWithProviders(<AdminLogin />, {
      initialState: {
        auth: {
          user: null,
          token: null,
          loading: false,
          error: 'Invalid admin credentials',
        },
      },
    })
    expect(screen.getByText('Invalid admin credentials')).toBeInTheDocument()
  })

  it('has link back to user login', () => {
    renderWithProviders(<AdminLogin />)
    const backLink = screen.getByText('Back to User Login')
    expect(backLink).toBeInTheDocument()
    expect(backLink.closest('a')).toHaveAttribute('href', '/login')
  })

  it('shows hint about admin credentials', () => {
    renderWithProviders(<AdminLogin />)
    expect(screen.getByText(/contact your system administrator/i)).toBeInTheDocument()
  })

  it('shows loading spinner during login attempt', () => {
    renderWithProviders(<AdminLogin />, {
      initialState: {
        auth: { user: null, token: null, loading: true, error: null },
      },
    })
    expect(screen.getByText(/logging in/i)).toBeInTheDocument()
  })
})

// ============================================================================
// 5. ProtectedRoute Component
// ============================================================================
describe('ProtectedRoute Component', () => {
  it('renders children when authenticated', () => {
    renderWithProviders(
      <ProtectedRoute>
        <div data-testid="protected-content">Secret Dashboard</div>
      </ProtectedRoute>,
      {
        initialState: {
          auth: { user: { id: 1 }, token: 'valid-token', loading: false, error: null },
        },
      }
    )
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    expect(screen.getByText('Secret Dashboard')).toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    const { container } = renderWithProviders(
      <ProtectedRoute>
        <div data-testid="protected-content">Secret Dashboard</div>
      </ProtectedRoute>,
      {
        initialState: {
          auth: { user: null, token: null, loading: false, error: null },
        },
      }
    )
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })
})

// ============================================================================
// 6. AdminProtectedRoute Component
// ============================================================================
describe('AdminProtectedRoute Component', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders children when authenticated and is admin', () => {
    localStorage.setItem('token', 'admin-token')
    renderWithProviders(
      <AdminProtectedRoute>
        <div data-testid="admin-content">Admin Panel</div>
      </AdminProtectedRoute>,
      {
        initialState: {
          auth: { user: { id: 1, role: 'ADMIN' }, token: 'admin-token', loading: false, error: null },
        },
      }
    )
    expect(screen.getByTestId('admin-content')).toBeInTheDocument()
  })

  it('redirects to /admin-login when no token in localStorage', () => {
    localStorage.removeItem('token')
    renderWithProviders(
      <AdminProtectedRoute>
        <div data-testid="admin-content">Admin Panel</div>
      </AdminProtectedRoute>,
      {
        initialState: {
          auth: { user: null, token: null, loading: false, error: null },
        },
      }
    )
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
  })

  it('redirects to /admin-login when authenticated but not admin', () => {
    localStorage.setItem('token', 'user-token')
    renderWithProviders(
      <AdminProtectedRoute>
        <div data-testid="admin-content">Admin Panel</div>
      </AdminProtectedRoute>,
      {
        initialState: {
          auth: { user: { id: 2, role: 'USER' }, token: 'user-token', loading: false, error: null },
        },
      }
    )
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
  })
})

// ============================================================================
// 7. Blog Component
// ============================================================================
describe('Blog Component', () => {
  it('renders blog page heading', () => {
    const store = configureStore({
      reducer: {
        blog: (state = { publishedBlogs: [], loading: false, error: null }) => state,
        auth: (state = { user: null, token: null, loading: false, error: null }) => state,
      },
    })
    render(
      <Provider store={store}>
        <BrowserRouter><Blog /></BrowserRouter>
      </Provider>
    )
    expect(screen.getByText('IndiCab Travel Blog')).toBeInTheDocument()
    expect(screen.getByText(/ultimate guide to exploring india/i)).toBeInTheDocument()
  })

  it('shows loading state when fetching blogs', () => {
    const store = configureStore({
      reducer: {
        blog: () => ({ publishedBlogs: [], loading: true, error: null }),
        auth: () => ({ user: null, token: null, loading: false, error: null }),
      },
    })
    render(
      <Provider store={store}>
        <BrowserRouter><Blog /></BrowserRouter>
      </Provider>
    )
    expect(screen.getByText('Loading blogs...')).toBeInTheDocument()
  })

  it('renders blog posts when data is available', () => {
    const mockBlogs = [
      { id: 1, title: 'Blog Post 1', preview: 'Preview text 1', date: '2025-01-01', views: 100 },
      { id: 2, title: 'Blog Post 2', preview: 'Preview text 2', date: '2025-01-02', views: 200 },
    ]
    const store = configureStore({
      reducer: {
        blog: () => ({ publishedBlogs: mockBlogs, loading: false, error: null }),
        auth: () => ({ user: null, token: null, loading: false, error: null }),
      },
    })
    render(
      <Provider store={store}>
        <BrowserRouter><Blog /></BrowserRouter>
      </Provider>
    )
    expect(screen.getByText('Blog Post 1')).toBeInTheDocument()
    expect(screen.getByText('Blog Post 2')).toBeInTheDocument()
    expect(screen.getByText('Preview text 1')).toBeInTheDocument()
    expect(screen.getByText('Preview text 2')).toBeInTheDocument()
  })

  it('shows empty state when no blogs available', () => {
    const store = configureStore({
      reducer: {
        blog: () => ({ publishedBlogs: [], loading: false, error: null }),
        auth: () => ({ user: null, token: null, loading: false, error: null }),
      },
    })
    render(
      <Provider store={store}>
        <BrowserRouter><Blog /></BrowserRouter>
      </Provider>
    )
    expect(screen.getByText('No blogs available. Check back soon!')).toBeInTheDocument()
  })

  it('renders blog images when provided', () => {
    const mockBlogs = [
      {
        id: 1,
        title: 'Blog With Image',
        preview: 'Has an image',
        image: 'https://example.com/img.jpg',
        date: '2025-01-01',
        views: 50,
      },
    ]
    const store = configureStore({
      reducer: {
        blog: () => ({ publishedBlogs: mockBlogs, loading: false, error: null }),
        auth: () => ({ user: null, token: null, loading: false, error: null }),
      },
    })
    render(
      <Provider store={store}>
        <BrowserRouter><Blog /></BrowserRouter>
      </Provider>
    )
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThanOrEqual(1)
    expect(images[0]).toHaveAttribute('src', 'https://example.com/img.jpg')
  })

  it('renders newsletter subscription section', () => {
    const store = configureStore({
      reducer: {
        blog: () => ({ publishedBlogs: [], loading: false, error: null }),
        auth: () => ({ user: null, token: null, loading: false, error: null }),
      },
    })
    render(
      <Provider store={store}>
        <BrowserRouter><Blog /></BrowserRouter>
      </Provider>
    )
    expect(screen.getByText('Subscribe to Our Newsletter')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument()
  })

  it('renders read more buttons on each blog card', () => {
    const mockBlogs = [
      { id: 1, title: 'Test Blog', preview: 'Preview', date: '2025-01-01', views: 10 },
    ]
    const store = configureStore({
      reducer: {
        blog: () => ({ publishedBlogs: mockBlogs, loading: false, error: null }),
        auth: () => ({ user: null, token: null, loading: false, error: null }),
      },
    })
    render(
      <Provider store={store}>
        <BrowserRouter><Blog /></BrowserRouter>
      </Provider>
    )
    const readMoreButtons = screen.getAllByText('Read More')
    expect(readMoreButtons.length).toBe(1)
  })
})

// ============================================================================
// 8. BookingHistory Component
// ============================================================================
describe('BookingHistory Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
    vi.spyOn(apiClient, 'post').mockResolvedValue({ data: {} })
  })

  it('shows loading state while fetching bookings', () => {
    const store = configureStore({
      reducer: {
        auth: () => ({
          user: { id: 1, name: 'Test', email: 'test@test.com' },
          token: 'token',
          loading: false,
          error: null,
        }),
        bookingHistory: () => ({ bookings: [], loading: true, error: null, isOffline: false }),
        rating: () => ({ hasRatedMap: {}, loading: false, error: null }),
      },
    })
    render(
      <Provider store={store}>
        <BrowserRouter><BookingHistory /></BrowserRouter>
      </Provider>
    )
    expect(screen.getByText('Loading your booking history...')).toBeInTheDocument()
  })

  it('prompts login when no user is authenticated', () => {
    const store = configureStore({
      reducer: {
        auth: () => ({ user: null, token: null, loading: false, error: null }),
        bookingHistory: () => ({ bookings: [], loading: false, error: null, isOffline: false }),
        rating: () => ({ hasRatedMap: {}, loading: false, error: null }),
      },
    })
    render(
      <Provider store={store}>
        <BrowserRouter><BookingHistory /></BrowserRouter>
      </Provider>
    )
    expect(screen.getByText(/please login to view your booking history/i)).toBeInTheDocument()
  })

  it('shows empty state when user has no bookings', () => {
    const store = configureStore({
      reducer: {
        auth: () => ({
          user: { id: 1, name: 'Test', email: 'test@test.com' },
          token: 'token',
          loading: false,
          error: null,
        }),
        bookingHistory: () => ({ bookings: [], loading: false, error: null, isOffline: false }),
        rating: () => ({ hasRatedMap: {}, loading: false, error: null }),
      },
    })
    render(
      <Provider store={store}>
        <BrowserRouter><BookingHistory /></BrowserRouter>
      </Provider>
    )
    expect(screen.getByText(/you don't have any bookings yet/i)).toBeInTheDocument()
  })

  it('renders user bookings with correct data', () => {
    const mockBookings = [
      {
        id: 101,
        from: 'Mumbai',
        to: 'Pune',
        date: '2025-06-15',
        amount: 2500,
        vehicle: 'Sedan',
        pickupAddress: 'Andheri East, Mumbai',
        status: 'Completed',
        userId: 1,
      },
      {
        id: 102,
        from: 'Delhi',
        to: 'Agra',
        date: '2025-07-01',
        amount: 5000,
        vehicle: 'SUV',
        pickupAddress: 'Connaught Place, Delhi',
        status: 'Upcoming',
        userId: 1,
      },
    ]

    const store = configureStore({
      reducer: {
        auth: () => ({
          user: { id: 1, name: 'Test', email: 'test@test.com' },
          token: 'token',
          loading: false,
          error: null,
        }),
        bookingHistory: () => ({ bookings: mockBookings, loading: false, error: null, isOffline: false }),
        rating: () => ({ hasRatedMap: {}, loading: false, error: null }),
      },
    })
    render(
      <Provider store={store}>
        <BrowserRouter><BookingHistory /></BrowserRouter>
      </Provider>
    )

    expect(screen.getByText('Your Bookings')).toBeInTheDocument()
    expect(screen.getByText(/mumbai/i)).toBeInTheDocument()
    expect(screen.getByText(/delhi/i)).toBeInTheDocument()
    expect(screen.getByText(/₹2500/)).toBeInTheDocument()
    expect(screen.getByText(/₹5000/)).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Upcoming')).toBeInTheDocument()
  })

  it('filters bookings by active tab', async () => {
    const mockBookings = [
      { id: 1, from: 'A', to: 'B', date: '2025-01-01', amount: 100, vehicle: 'Sedan', pickupAddress: 'Addr', status: 'Completed', userId: 1 },
      { id: 2, from: 'C', to: 'D', date: '2025-02-01', amount: 200, vehicle: 'SUV', pickupAddress: 'Addr', status: 'Upcoming', userId: 1 },
    ]

    const store = configureStore({
      reducer: {
        auth: () => ({
          user: { id: 1, name: 'Test', email: 'test@test.com' },
          token: 'token',
          loading: false,
          error: null,
        }),
        bookingHistory: () => ({ bookings: mockBookings, loading: false, error: null, isOffline: false }),
        rating: () => ({ hasRatedMap: {}, loading: false, error: null }),
      },
    })
    render(
      <Provider store={store}>
        <BrowserRouter><BookingHistory /></BrowserRouter>
      </Provider>
    )

    // Both bookings visible on "All" tab
    expect(screen.getByText(/₹100/)).toBeInTheDocument()
    expect(screen.getByText(/₹200/)).toBeInTheDocument()

    // Click "Completed" tab
    fireEvent.click(screen.getByText('Completed'))

    await waitFor(() => {
      expect(screen.getByText(/₹100/)).toBeInTheDocument()
      const completedTexts = screen.getAllByText(/Completed/i)
      expect(completedTexts.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('filters bookings only for current user', () => {
    const mockBookings = [
      { id: 1, from: 'A', to: 'B', date: '2025-01-01', amount: 100, vehicle: 'Sedan', pickupAddress: 'Addr', status: 'Completed', userId: 1 },
      { id: 2, from: 'C', to: 'D', date: '2025-02-01', amount: 200, vehicle: 'SUV', pickupAddress: 'Addr', status: 'Completed', userId: 2 },
    ]

    const store = configureStore({
      reducer: {
        auth: () => ({
          user: { id: 1, name: 'Test', email: 'test@test.com' },
          token: 'token',
          loading: false,
          error: null,
        }),
        bookingHistory: () => ({ bookings: mockBookings, loading: false, error: null, isOffline: false }),
        rating: () => ({ hasRatedMap: {}, loading: false, error: null }),
      },
    })
    render(
      <Provider store={store}>
        <BrowserRouter><BookingHistory /></BrowserRouter>
      </Provider>
    )

    // Only shows booking for userId=1 (current user)
    expect(screen.getByText(/₹100/)).toBeInTheDocument()
    expect(screen.queryByText(/₹200/)).not.toBeInTheDocument()
  })

  it('shows offline mode badge when isOffline is true', () => {
    const store = configureStore({
      reducer: {
        auth: () => ({
          user: { id: 1, name: 'Test', email: 'test@test.com' },
          token: 'token',
          loading: false,
          error: null,
        }),
        bookingHistory: () => ({
          bookings: [{ id: 1, from: 'A', to: 'B', date: '2025-01-01', amount: 100, vehicle: 'Sedan', pickupAddress: 'Addr', status: 'Completed', userId: 1 }],
          loading: false,
          error: 'Network error',
          isOffline: true,
        }),
        rating: () => ({ hasRatedMap: {}, loading: false, error: null }),
      },
    })
    render(
      <Provider store={store}>
        <BrowserRouter><BookingHistory /></BrowserRouter>
      </Provider>
    )
    expect(screen.getByText(/offline mode/i)).toBeInTheDocument()
    expect(screen.getByText(/backend unavailable/i)).toBeInTheDocument()
  })

  it('renders tabs for filtering bookings', () => {
    const mockBookings = [
      { id: 1, from: 'A', to: 'B', date: '2025-01-01', amount: 100, vehicle: 'Sedan', pickupAddress: 'Addr', status: 'Completed', userId: 1 },
    ]
    const store = configureStore({
      reducer: {
        auth: () => ({
          user: { id: 1, name: 'Test', email: 'test@test.com' },
          token: 'token',
          loading: false,
          error: null,
        }),
        bookingHistory: () => ({ bookings: mockBookings, loading: false, error: null, isOffline: false }),
        rating: () => ({ hasRatedMap: {}, loading: false, error: null }),
      },
    })
    render(
      <Provider store={store}>
        <BrowserRouter><BookingHistory /></BrowserRouter>
      </Provider>
    )
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Upcoming')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Cancelled')).toBeInTheDocument()
  })
})

// ============================================================================
// 9. Profile Component
// ============================================================================
describe('Profile Component', () => {
  it('shows login prompt when no user is authenticated', () => {
    renderWithProviders(<Profile />, {
      initialState: {
        auth: { user: null, token: null, loading: false, error: null },
      },
    })
    expect(screen.getByText(/please log in to view your profile/i)).toBeInTheDocument()
  })

  it('renders user profile information when user exists', () => {
    renderWithProviders(<Profile />, {
      initialState: {
        auth: {
          user: { id: 1, name: 'John Doe', email: 'john@example.com' },
          token: 'mock-token',
          loading: false,
          error: null,
        },
      },
    })
    expect(screen.getByText('User Profile')).toBeInTheDocument()
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument()
  })

  it('switches to edit mode when Edit Profile is clicked', async () => {
    renderWithProviders(<Profile />, {
      initialState: {
        auth: {
          user: { id: 1, name: 'John Doe', email: 'john@example.com' },
          token: 'mock-token',
          loading: false,
          error: null,
        },
      },
    })

    fireEvent.click(screen.getByRole('button', { name: /edit profile/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })
  })

  it('allows editing name in edit mode', async () => {
    renderWithProviders(<Profile />, {
      initialState: {
        auth: {
          user: { id: 1, name: 'John Doe', email: 'john@example.com' },
          token: 'mock-token',
          loading: false,
          error: null,
        },
      },
    })

    const editBtn = screen.getByRole('button', { name: /edit profile/i })
    fireEvent.click(editBtn)

    const nameInput = screen.getByDisplayValue('John Doe')
    fireEvent.change(nameInput, { target: { name: 'name', value: 'Jane Doe' } })

    expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument()
  })

  it('cancels editing and reverts to original values', async () => {
    renderWithProviders(<Profile />, {
      initialState: {
        auth: {
          user: { id: 1, name: 'John Doe', email: 'john@example.com' },
          token: 'mock-token',
          loading: false,
          error: null,
        },
      },
    })

    fireEvent.click(screen.getByRole('button', { name: /edit profile/i }))

    const nameInput = screen.getByDisplayValue('John Doe')
    fireEvent.change(nameInput, { target: { name: 'name', value: 'Jane Doe' } })

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

    // After cancel, name should revert and edit mode should close
    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument()
    })
  })

  it('email field is always disabled', () => {
    renderWithProviders(<Profile />, {
      initialState: {
        auth: {
          user: { id: 1, name: 'John Doe', email: 'john@example.com' },
          token: 'mock-token',
          loading: false,
          error: null,
        },
      },
    })

    const emailInput = screen.getByDisplayValue('john@example.com')
    expect(emailInput).toBeDisabled()
  })
})
