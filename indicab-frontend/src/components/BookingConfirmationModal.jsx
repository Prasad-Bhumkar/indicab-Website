import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

const BookingConfirmationModal = ({ onClose }) => {
  const { isOpen, bookingDetails } = useSelector((state) => state.bookingConfirmationModal);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isOpen]);

  if (!isOpen || !bookingDetails) {
    return null;
  }

  const {
    tripType,
    fromCity,
    toCity,
    departDate,
    returnDate,
    computedRentalDays,
    passengerName,
    passengerEmail,
    passengerPhone,
    selectedVehicle,
    calculatedFare,
    bookingId,
    bookingReference,
    isOffline,
  } = bookingDetails;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="bookingConfirmedTitle">
      <div className="modal-content" ref={modalRef} style={{ backgroundColor: 'var(--custom-bg)', color: 'var(--custom-text)' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid var(--custom-accent)' }}>
          <h5 className="modal-title" id="bookingConfirmedTitle" style={{ color: 'var(--custom-dark)' }}>Booking Confirmed!</h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close confirmation modal"
          ></button>
        </div>
        <div className="modal-body">
          <div className="text-center mb-4">
            <i className="bi bi-check-circle-fill" style={{ fontSize: '4rem', color: isOffline ? '#fbbf24' : 'var(--custom-accent)' }}></i>
            <h4 className="mt-3" style={{ color: 'var(--custom-dark)' }}>
              {isOffline ? 'Booking Saved Offline' : 'Thank You for Your Booking!'}
            </h4>
            <p>
              {isOffline
                ? 'Your booking has been saved offline. It will be submitted automatically when your connection is restored.'
                : 'Your trip is scheduled. Please find the details below.'}
            </p>
            {isOffline && (
              <div style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '1rem', borderRadius: '6px', marginTop: '1rem', marginBottom: '1rem', border: '1px solid #fcd34d' }}>
                <p style={{ margin: '0', fontSize: '0.9rem' }}>⚠️ <strong>You are offline.</strong> Your booking details are saved locally and will be submitted when you reconnect to the internet.</p>
              </div>
            )}
            {(bookingId || bookingReference) && (
              <div style={{ backgroundColor: isOffline ? '#fbbf24' : 'var(--custom-accent)', color: 'var(--custom-dark)', padding: '0.75rem', borderRadius: '6px', marginTop: '1rem', marginBottom: '1rem' }}>
                {bookingReference && <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>Reference: <strong>{bookingReference}</strong></p>}
                {bookingId && <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>ID: <strong>{bookingId}</strong></p>}
              </div>
            )}
          </div>
          <div className="booking-summary" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', padding: '1rem', borderRadius: '8px' }}>
            <p><strong>Trip Type:</strong> <span className="badge" style={{ backgroundColor: 'var(--custom-accent)', color: 'var(--custom-dark)' }}>{tripType.toUpperCase()}</span></p>
            <p><strong>Route:</strong> {fromCity} to {toCity}</p>
            <p><strong>Departure:</strong> {new Date(departDate).toLocaleDateString()}</p>

            {(tripType === 'roundtrip' || tripType === 'rental') && returnDate && (
              <p><strong>Return:</strong> {new Date(returnDate).toLocaleDateString()}</p>
            )}

            {tripType === 'rental' && computedRentalDays > 0 && (
              <p><strong>Rental Days:</strong> {computedRentalDays}</p>
            )}

            <hr style={{ borderColor: 'var(--custom-accent)' }} />
            <p><strong>Passenger:</strong> {passengerName}</p>
            <p><strong>Email:</strong> {passengerEmail}</p>
            <p><strong>Phone:</strong> {passengerPhone}</p>
            <hr style={{ borderColor: 'var(--custom-accent)' }} />
            <p><strong>Vehicle:</strong> {selectedVehicle?.type}</p>
            <h5 className="mt-3">
              <strong style={{ color: 'var(--custom-dark)' }}>Estimated Fare:</strong> ₹{calculatedFare.toFixed(2)}
            </h5>
          </div>
        </div>
        <div className="modal-footer" style={{ borderTop: '1px solid var(--custom-accent)' }}>
          <button
            type="button"
            className="btn"
            onClick={onClose}
            aria-label="Confirm and close modal"
            style={{ backgroundColor: 'var(--custom-dark)', color: 'var(--custom-bg)' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationModal;
