import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchPopularRoutes, addRoute, updateRoute, deleteRoute } from '../features/popularRoutes/popularRoutesSlice'

const PopularRoutes = () => {
  const dispatch = useDispatch()
  const { routes, loading, error } = useSelector((state) => state.popularRoutes)
  const [newRoute, setNewRoute] = useState({
    from: '',
    to: '',
    price: '',
    image: 'https://via.placeholder.com/400x200',
    description: 'New route'
  })
  const [editingRoute, setEditingRoute] = useState(null)

  useEffect(() => {
    dispatch(fetchPopularRoutes())
    
  }, [dispatch])

  const handleAddRoute = (e) => {
    e.preventDefault()
    const id = routes.length > 0 ? Math.max(...routes.map(route => route.id || 0)) + 1 : 1
    dispatch(addRoute({ ...newRoute, id }))
    setNewRoute({
      from: '',
      to: '',
      price: '',
      image: 'https://via.placeholder.com/400x200',
      description: 'New route'
    })
  }

  const handleEditRoute = (route) => {
    setEditingRoute(route)
    setNewRoute(route)
  }

  const handleUpdateRoute = (e) => {
    e.preventDefault()
    dispatch(updateRoute(newRoute))
    setEditingRoute(null)
    setNewRoute({
      from: '',
      to: '',
      price: '',
      image: 'https://via.placeholder.com/400x200',
      description: 'New route'
    })
  }

  const handleDeleteRoute = (id) => {
    dispatch(deleteRoute(id))
  }

  if (loading) {
    return <div>Loading popular routes...</div>
  }

  if (error) {
    return <div>Error loading popular routes: {error}</div>
  }

  return (
    <section className="py-5" id="routes">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h2 className="fw-bold mb-4">Popular Routes</h2>
          </div>
        </div>
        {/* <div className="row mb-4">
          <div className="col-12">
            <h3 className="mb-3">Add New Route</h3>
            <form onSubmit={handleAddRoute}>
              <div className="row">
                <div className="col-md-3 mb-3">
                  <input type="text" className="form-control" placeholder="From" value={newRoute.from} onChange={(e) => setNewRoute({ ...newRoute, from: e.target.value })} required />
                </div>
                <div className="col-md-3 mb-3">
                  <input type="text" className="form-control" placeholder="To" value={newRoute.to} onChange={(e) => setNewRoute({ ...newRoute, to: e.target.value })} required />
                </div>
                <div className="col-md-3 mb-3">
                  <input type="text" className="form-control" placeholder="Price" value={newRoute.price} onChange={(e) => setNewRoute({ ...newRoute, price: e.target.value })} required />
                </div>
                <div className="col-md-3 mb-3">
                  <button type="submit" className="btn btn-primary-custom w-100">Add Route</button>
                </div>
              </div>
            </form>
          </div>
        </div> */}
        <div className="row">
          {routes.map((route) => (
            <div key={route.id} className="col-lg-4 col-md-6 mb-4">
              <div className="route-card">
                <div 
                  className="route-image"
                  style={{ backgroundImage: `url(${route.image})` }}
                >
                  <div className="route-overlay">
                    <div className="route-title">
                      {route.to}
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="mb-0">{route.from} to {route.to}</h5>
                    <span className="price-badge">₹{route.price}</span>
                  </div>
                  <p className="text-muted mb-3">{route.description}</p>
                  <div className="d-flex justify-content-between">
                    <button className="btn btn-primary-custom btn-sm">
                      Book Now
                    </button>
                    {/* <button className="btn btn-info btn-sm" onClick={() => handleEditRoute(route)}>
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRoute(route.id)}>
                      Delete
                    </button> */}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <a href="#" className="text-decoration-none">View All Routes →</a>
        </div>
      </div>
    </section>
  )
}

export default PopularRoutes
