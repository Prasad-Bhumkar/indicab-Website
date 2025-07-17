
import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchRecommendations, toggleFavorite } from '../features/recommendations/recommendationsSlice'

const Recommendations = () => {
  const dispatch = useDispatch()
  const { recommendations, favorites, loading, error } = useSelector((state) => state.recommendations)
  const favoritesSet = new Set(favorites);

  useEffect(() => {
    dispatch(fetchRecommendations())
  }, [dispatch])

  const handleToggleFavorite = (id) => {
    dispatch(toggleFavorite(id))
  }

  if (loading) {
    return <div>Loading recommendations...</div>
  }

  if (error) {
    return <div>Error loading recommendations: {error}</div>
  }

  return (
    <section className="py-5 bg-light" id="recommendations">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h2 className="fw-bold mb-4">Recommended for You</h2>
          </div>
        </div>
        <div className="row">
          {recommendations.map(item => (
            <div key={item.id} className="col-lg-4 col-md-6 mb-4">
              <div className="recommendation-card">
                <div 
                  className="recommendation-image"
                  style={{ backgroundImage: `url(${item.image})` }}
                >
                  <div 
                    className="heart-icon"
                    onClick={() => handleToggleFavorite(item.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleToggleFavorite(item.id)
                      }
                    }}
                  >
                    <i className={`bi ${favoritesSet.has(item.id) ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
                  </div>
                </div>
                <div className="p-3">
                  <div className="d-flex align-items-center mb-2">
                    <span className="badge bg-warning text-dark me-2">
                      <i className="bi bi-star-fill me-1"></i>
                      {item.rating}
                    </span>
                    <small className="text-muted">({item.reviews} reviews)</small>
                  </div>
                  <h6 className="mb-2">{item.location}</h6>
                  <h5 className="mb-3">{item.title}</h5>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="price-badge">₹{item.price}</span>
                    <button className="btn btn-primary-custom btn-sm">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Recommendations
