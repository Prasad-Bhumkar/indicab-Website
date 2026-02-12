import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchServiceCities } from '../features/serviceCities/serviceCitiesSlice'

const ServiceCities = () => {
  const dispatch = useDispatch()
  const { cities, stats, loading, error } = useSelector((state) => state.serviceCities)

  useEffect(() => {
    dispatch(fetchServiceCities())
  }, [dispatch])

  if (loading) {
    return <div>Loading service cities...</div>
  }

  if (error) {
    return <div>Error loading service cities: {error}</div>
  }

  return (
    <section className="service-cities" id="services">
      <div className="container">
        <div className="row">
          <div className="col-12 text-center">
            <h2 className="fw-bold mb-4">Our Service Cities</h2>
            <p className="lead mb-5">We provide reliable cab services across major cities in India</p>
          </div>
          <div className="col-12 text-center">
            {cities.map((city, index) => (
              <span key={index} className="city-badge">
                {city}
              </span>
            ))}
          </div>
        </div>
        <div className="row mt-5">
          <div className="col-md-3 col-6 text-center mb-4">
            <div className="display-4 fw-bold text-success">{stats.citiesCovered}</div>
            <p className="text-muted">Cities Covered</p>
          </div>
          <div className="col-md-3 col-6 text-center mb-4">
            <div className="display-4 fw-bold text-success">{stats.happyCustomers}</div>
            <p className="text-muted">Happy Customers</p>
          </div>
          <div className="col-md-3 col-6 text-center mb-4">
            <div className="display-4 fw-bold text-success">{stats.trustedDrivers}</div>
            <p className="text-muted">Trusted Drivers</p>
          </div>
          <div className="col-md-3 col-6 text-center mb-4">
            <div className="display-4 fw-bold text-success">{stats.support}</div>
            <p className="text-muted">Support Available</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServiceCities
