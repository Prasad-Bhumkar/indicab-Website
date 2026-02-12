import React, { useState, useEffect } from 'react';
import { apiClient } from '../config/apiConfig';
import { closeBookingConfirmationModal } from '../features/bookingConfirmationModal/bookingConfirmationModalSlice';
import { useSelector, useDispatch } from 'react-redux';
import BookingConfirmationModal from './BookingConfirmationModal';
import { addBooking } from '../features/bookingHistory/bookingHistorySlice';
import { openBookingConfirmationModal } from '../features/bookingConfirmationModal/bookingConfirmationModalSlice';

const BookingForm = () => {
  const dispatch = useDispatch();
  const mockRoutes = useSelector((state) => state.mockRoutes.routes);
  const [tripType, setTripType] = useState('oneway');
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [computedRentalDays, setComputedRentalDays] = useState(0); // Auto-calculated
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [passengerName, setPassengerName] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [errors, setErrors] = useState({});
  const [calculatedFare, setCalculatedFare] = useState(0);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const vehicles = [
    {
      id: 1,
      type: 'Sedan',
      baseFare: 150,
      ratePerKm: 10,
      perDayCharge: 100,
      capacity: 3,
      image:
        'https://images.unsplash.com/photo-1712885046114-5ea81a2f7555?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3MjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'Comfortable & Economical',
    },
    {
      id: 2,
      type: 'SUV',
      baseFare: 200,
      ratePerKm: 12,
      perDayCharge: 150,
      capacity: 5,
      image:
        ' https://images.unsplash.com/photo-1705624843697-4461f9dce482?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3MjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'Spacious & Versatile',
    },
    {
      id: 3,
      type: 'Luxury',
      baseFare: 300,
      ratePerKm: 18,
      perDayCharge: 250,
      capacity: 4,
      image:
        ' https://images.unsplash.com/photo-1611859266693-010be04d10a4?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3MjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'Premium & Stylish',
    },
    {
      id: 4,
      type: 'Tempo Traveller',
      baseFare: 500,
      ratePerKm: 25,
      perDayCharge: 400,
      capacity: 12,
      image:
        ' https://www.maharanacab.com/wp-content/uploads/2020/03/tempo-traveller-pics-11-e1583909038270-1-280x300.jpg ',
      description: 'For Group Travel',
    },
  ];

  // Calculate rental days based on departDate and returnDate
  useEffect(() => {
    if (tripType === 'rental' && departDate && returnDate) {
      const start = new Date(departDate);
      const end = new Date(returnDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive of both days
      setComputedRentalDays(diffDays);
    } else if (tripType === 'rental') {
      setComputedRentalDays(0); // Reset if dates missing
    }
  }, [tripType, departDate, returnDate]);

  // Calculate fare
  useEffect(() => {
    if (fromCity && toCity && selectedVehicle) {
      const route = mockRoutes.find((r) => r.from === fromCity && r.to === toCity);
      if (!route) {
        setCalculatedFare(0);
        return;
      }

      let fare = selectedVehicle.baseFare + selectedVehicle.ratePerKm * route.distance;

      if (tripType === 'rental' && computedRentalDays > 0) {
        fare += selectedVehicle.perDayCharge * computedRentalDays;
      }

      setCalculatedFare(fare);
    }
  }, [fromCity, toCity, selectedVehicle, mockRoutes, tripType, computedRentalDays]);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!fromCity) newErrors.fromCity = 'From city is required.';
    if (!toCity) newErrors.toCity = 'To city is required.';
    if (!departDate) newErrors.departDate = 'Departure date is required.';

    if ((tripType === 'roundtrip' || tripType === 'rental') && !returnDate) {
      newErrors.returnDate = 'Return date is required for round trips and rentals.';
    }

    if (new Date(returnDate) < new Date(departDate)) {
      newErrors.returnDate = 'Return date cannot be before departure date.';
    }

    if (!selectedVehicle) newErrors.selectedVehicle = 'Please select a vehicle.';
    if (!passengerName) newErrors.passengerName = 'Passenger name is required.';
    if (!passengerEmail) newErrors.passengerEmail = 'Email is required.';
    else if (!emailRegex.test(passengerEmail))
      newErrors.passengerEmail = 'Email is invalid.';

    if (!passengerPhone) newErrors.passengerPhone = 'Phone number is required.';
    else if (!phoneRegex.test(passengerPhone))
      newErrors.passengerPhone = 'Phone number must be 10 digits.';

    if (!licenseNumber) newErrors.licenseNumber = 'License number is required.';
    else if (licenseNumber.length < 5)
      newErrors.licenseNumber = 'License number must be at least 5 characters.';

    if (!pickupAddress) newErrors.pickupAddress = 'Pickup address is required.';
    else if (pickupAddress.length < 5)
      newErrors.pickupAddress = 'Pickup address must be at least 5 characters.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (validateForm()) {
      const newBooking = {
        from: fromCity,
        to: toCity,
        date: departDate,
        vehicle: selectedVehicle.type,
        amount: calculatedFare,
        status: 'PENDING',
        fullName: passengerName,
        phoneNumber: passengerPhone,
        license: licenseNumber,
        pickupAddress: pickupAddress,
        paymentMethod: paymentMethod,
      };

      try {
        setIsSubmitting(true);
        const response = await apiClient.post('/api/bookings', newBooking);
        const savedBooking = response.data;
        dispatch(addBooking(savedBooking));

        const details = {
          tripType,
          fromCity,
          toCity,
          departDate,
          returnDate,
          computedRentalDays,
          selectedVehicle,
          passengerName,
          passengerEmail,
          passengerPhone,
          paymentMethod,
          calculatedFare,
        };

        dispatch(openBookingConfirmationModal(details));
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Failed to save booking. Please try again.';
        setSubmitError(errorMsg);
        console.error('Booking submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(selectedVehicle?.id === vehicle.id ? null : vehicle);
  };

  const handleTripTypeChange = (type) => {
    setTripType(type);
    if (type === 'oneway') setReturnDate('');
  };



  const closeModal = () => {
    dispatch(closeBookingConfirmationModal());
    // Reset form
    setFromCity('');
    setToCity('');
    setDepartDate('');
    setReturnDate('');
    setComputedRentalDays(0);
    setSelectedVehicle(null);
    setPassengerName('');
    setPassengerEmail('');
    setPassengerPhone('');
    setPickupAddress('');
    setLicenseNumber('');
    setPaymentMethod('Credit Card');
    setSubmitError(null);
  };


  return (
    <div className="booking-form">
      {/* Trip Type Buttons */}
      <div className="d-flex gap-2 mb-4">
        <button
          className={`btn ${
            tripType === 'oneway' ? 'btn-primary-custom' : 'btn-outline-secondary'
          }`}
          onClick={() => handleTripTypeChange('oneway')}
        >
          ONE WAY
        </button>
        <button
          className={`btn ${
            tripType === 'roundtrip' ? 'btn-primary-custom' : 'btn-outline-secondary'
          }`}
          onClick={() => handleTripTypeChange('roundtrip')}
        >
          ROUND TRIP
        </button>
        <button
          className={`btn ${
            tripType === 'rental' ? 'btn-primary-custom' : 'btn-outline-secondary'
          }`}
          onClick={() => handleTripTypeChange('rental')}
        >
          RENTAL
        </button>
      </div>

      {/* Vehicle Selection */}
      <div className="vehicle-showcase mb-4">
        <h5 className="fw-semibold mb-3">Select Your Vehicle</h5>
        <div className="row g-3">
          {vehicles.map((vehicle) => (
            <div className="col-6 col-md-3" key={vehicle.id}>
              <div
                className={`vehicle-card text-center p-2 ${
                  selectedVehicle && selectedVehicle.id === vehicle.id ? 'selected' : ''
                }`}
                onClick={() => handleVehicleSelect(vehicle)}
              >
                <img
                  src={vehicle.image}
                  alt={vehicle.type}
                  className="img-fluid mb-2"
                  style={{ borderRadius: '8px' }}
                />
                <h6 className="mb-1">{vehicle.type}</h6>
                <small className="text-muted">Capacity: {vehicle.capacity}</small>
              </div>
            </div>
          ))}
        </div>
        {errors.selectedVehicle && (
          <div className="text-danger mt-2">{errors.selectedVehicle}</div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          {/* Route Inputs */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">From</label>
            <select
              className={`form-select ${errors.fromCity ? 'is-invalid' : ''}`}
              value={fromCity}
              onChange={(e) => setFromCity(e.target.value)}
            >
              <option value="">Select Pickup City</option>
              {[...new Set(mockRoutes.map((route) => route.from))].map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {errors.fromCity && (
              <div className="invalid-feedback">{errors.fromCity}</div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">To</label>
            <select
              className={`form-select ${errors.toCity ? 'is-invalid' : ''}`}
              value={toCity}
              onChange={(e) => setToCity(e.target.value)}
              disabled={!fromCity}
            >
              <option value="">Select Destination City</option>
              {fromCity &&
                mockRoutes
                  .filter((route) => route.from === fromCity)
                  .map((route) => (
                    <option key={route.to} value={route.to}>
                      {route.to}
                    </option>
                  ))}
            </select>
            {errors.toCity && <div className="invalid-feedback">{errors.toCity}</div>}
          </div>

          {/* Date Inputs */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Departure Date</label>
            <input
              type="date"
              className={`form-control ${errors.departDate ? 'is-invalid' : ''}`}
              value={departDate}
              onChange={(e) => setDepartDate(e.target.value)}
            />
            {errors.departDate && (
              <div className="invalid-feedback">{errors.departDate}</div>
            )}
          </div>

          {(tripType === 'roundtrip' || tripType === 'rental') && (
            <>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Return Date</label>
                <input
                  type="date"
                  className={`form-control ${errors.returnDate ? 'is-invalid' : ''}`}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
                {errors.returnDate && (
                  <div className="invalid-feedback">{errors.returnDate}</div>
                )}
              </div>

              {tripType === 'rental' && computedRentalDays > 0 && (
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Rental Days</label>
                  <input
                    type="text"
                    className="form-control"
                    value={computedRentalDays}
                    disabled
                  />
                </div>
              )}
            </>
          )}

          {/* Passenger Info */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Your Name</label>
            <input
              type="text"
              className={`form-control ${errors.passengerName ? 'is-invalid' : ''}`}
              placeholder="Enter your name"
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
            />
            {errors.passengerName && (
              <div className="invalid-feedback">{errors.passengerName}</div>
            )}
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Email Address</label>
            <input
              type="email"
              className={`form-control ${errors.passengerEmail ? 'is-invalid' : ''}`}
              placeholder="Enter your email"
              value={passengerEmail}
              onChange={(e) => setPassengerEmail(e.target.value)}
            />
            {errors.passengerEmail && (
              <div className="invalid-feedback">{errors.passengerEmail}</div>
            )}
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Phone Number</label>
            <input
              type="tel"
              className={`form-control ${errors.passengerPhone ? 'is-invalid' : ''}`}
              placeholder="Enter your 10-digit phone number"
              value={passengerPhone}
              onChange={(e) => setPassengerPhone(e.target.value)}
            />
            {errors.passengerPhone && (
              <div className="invalid-feedback">{errors.passengerPhone}</div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">License Number</label>
            <input
              type="text"
              className={`form-control ${errors.licenseNumber ? 'is-invalid' : ''}`}
              placeholder="Enter your driving license number"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
            />
            {errors.licenseNumber && (
              <div className="invalid-feedback">{errors.licenseNumber}</div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">Pickup Address</label>
            <input
              type="text"
              className={`form-control ${errors.pickupAddress ? 'is-invalid' : ''}`}
              placeholder="Enter your pickup address"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
            />
            {errors.pickupAddress && (
              <div className="invalid-feedback">{errors.pickupAddress}</div>
            )}
          </div>

          {/* Payment Method */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Payment Method</label>
            <select
              className="form-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option>Credit Card</option>
              <option>UPI</option>
              <option>Cash</option>
            </select>
          </div>

          {/* Submit Button & Fare Display */}
          <div className="col-12">
            {submitError && <div className="text-danger mb-2">{submitError}</div>}
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="fw-semibold mb-0">Estimated Fare: ₹{calculatedFare.toFixed(2)}</h5>
              <button type="submit" className="btn btn-primary-custom py-3" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Modal */}
      <BookingConfirmationModal onClose={closeModal} />
    </div>
  );
};

export default BookingForm;
