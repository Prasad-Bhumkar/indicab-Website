import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchPopularRoutes, addRoute, updateRoute, deleteRoute } from '../features/popularRoutes/popularRoutesSlice'
import { motion } from 'framer-motion'
import AnimatedJourney from './AnimatedJourney'

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

  useEffect(() => {
    // Routes updated - effect runs when these dependencies change
  }, [routes, loading, error])

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
    return <div className="text-center py-5">Loading popular routes...</div>
  }

  if (error) {
    return <div className="text-center py-5">Error loading popular routes: {error}</div>
  }

  if (!routes || routes.length === 0) {
    return <div className="text-center py-5">No routes available</div>
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  }

  return (
    <section className="py-5" id="routes">
      <div className="container">
        <motion.div
          className="row"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="col-12">
            <h2 className="fw-bold mb-4">Popular Routes</h2>
          </div>
        </motion.div>

        <div className="row">
          {routes && routes.length > 0 ? (
            routes.map((route, index) => (
            <div key={route.id} className="col-lg-4 col-md-6 mb-4">
              <div className="route-card-wrapper">
                <div className="route-card">
                  <div
                    className="route-image"
                    style={{ backgroundImage: `url(${route.image})` }}
                  >
                    <div className="route-overlay">
                      <AnimatedJourney from={route.from} to={route.to} />
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="price-badge">
                        ₹{route.price}
                      </span>
                    </div>
                    <p className="text-muted mb-3">{route.description}</p>
                    <div className="d-flex justify-content-between">
                      <button className="btn btn-primary-custom btn-sm w-100">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            ))
          ) : (
            <div className="col-12 text-center py-5">
              <p>No routes available</p>
            </div>
          )}
        </div>

        <motion.div
          className="text-center mt-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <motion.a
            href="#"
            className="text-decoration-none view-all-link"
            whileHover={{ x: 5 }}
            transition={{ duration: 0.3 }}
          >
            View All Routes →
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

export default PopularRoutes
