import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import ServiceCities from './ServiceCities'
import serviceCitiesReducer from '../features/serviceCities/serviceCitiesSlice'

describe('ServiceCities Component', () => {
  let store

  beforeEach(() => {
    // Create a fresh store for each test
    store = configureStore({
      reducer: {
        serviceCities: serviceCitiesReducer,
      },
    })
  })

  it('should render service cities section', () => {
    render(
      <Provider store={store}>
        <ServiceCities />
      </Provider>
    )

    expect(screen.getByText('Our Service Cities')).toBeInTheDocument()
  })

  it('should display loading state', () => {
    const storeWithLoading = configureStore({
      reducer: {
        serviceCities: () => ({
          cities: [],
          stats: {},
          loading: true,
          error: null,
        }),
      },
    })

    render(
      <Provider store={storeWithLoading}>
        <ServiceCities />
      </Provider>
    )

    expect(screen.getByText('Loading service cities...')).toBeInTheDocument()
  })

  it('should display error message when error occurs', () => {
    const storeWithError = configureStore({
      reducer: {
        serviceCities: () => ({
          cities: [],
          stats: {},
          loading: false,
          error: 'Failed to load cities',
        }),
      },
    })

    render(
      <Provider store={storeWithError}>
        <ServiceCities />
      </Provider>
    )

    expect(screen.getByText(/Error loading service cities/)).toBeInTheDocument()
  })

  it('should render city badges when cities are loaded', () => {
    const storeWithCities = configureStore({
      reducer: {
        serviceCities: () => ({
          cities: ['Bangalore', 'Mumbai', 'Delhi'],
          stats: {
            citiesCovered: 3,
            happyCustomers: '50000+',
            trustedDrivers: '10000+',
            support: '24/7',
          },
          loading: false,
          error: null,
        }),
      },
    })

    render(
      <Provider store={storeWithCities}>
        <ServiceCities />
      </Provider>
    )

    expect(screen.getByText('Bangalore')).toBeInTheDocument()
    expect(screen.getByText('Mumbai')).toBeInTheDocument()
    expect(screen.getByText('Delhi')).toBeInTheDocument()
  })

  it('should display statistics when data is loaded', () => {
    const storeWithStats = configureStore({
      reducer: {
        serviceCities: () => ({
          cities: ['Bangalore'],
          stats: {
            citiesCovered: 3,
            happyCustomers: '50000+',
            trustedDrivers: '10000+',
            support: '24/7',
          },
          loading: false,
          error: null,
        }),
      },
    })

    render(
      <Provider store={storeWithStats}>
        <ServiceCities />
      </Provider>
    )

    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('50000+')).toBeInTheDocument()
    expect(screen.getByText('10000+')).toBeInTheDocument()
    expect(screen.getByText('24/7')).toBeInTheDocument()
  })
})
