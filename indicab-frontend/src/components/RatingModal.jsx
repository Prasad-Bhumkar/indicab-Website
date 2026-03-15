import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitRating } from '../features/rating/ratingSlice';
import { FaStar } from 'react-icons/fa';

const RatingModal = ({ booking, onClose }) => {
  const dispatch = useDispatch();
  const { submitting } = useSelector((state) => state.rating);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [hover, setHover] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const ratingData = {
      bookingId: booking.id,
      rating,
      review,
      driverName: booking.driverName || 'N/A'
    };
    dispatch(submitRating(ratingData)).then((result) => {
      if (!result.error) {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Rate Your Trip</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="mb-4 p-4 bg-emerald-50 rounded-xl">
            <p className="text-sm text-emerald-800">
              <span className="font-semibold">{booking.from}</span> to <span className="font-semibold">{booking.to}</span>
            </p>
            <p className="text-xs text-emerald-600 mt-1">Booking ID: {booking.id}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col items-center mb-8">
              <p className="text-sm text-gray-600 mb-3">How was your overall experience?</p>
              <div className="flex gap-2">
                {[...Array(5)].map((_, index) => {
                  const ratingValue = index + 1;
                  return (
                    <label key={index}>
                      <input
                        type="radio"
                        className="hidden"
                        value={ratingValue}
                        onClick={() => setRating(ratingValue)}
                      />
                      <FaStar
                        className="cursor-pointer transition-colors duration-200"
                        color={ratingValue <= (hover || rating) ? "#fbbf24" : "#e5e7eb"}
                        size={36}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(null)}
                      />
                    </label>
                  );
                })}
              </div>
              <span className="mt-2 text-sm font-medium text-amber-500">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </span>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tell us more about your trip (Optional)
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none resize-none"
                placeholder="Write your review here..."
                rows="4"
                value={review}
                onChange={(e) => setReview(e.target.value)}
              ></textarea>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-200"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
