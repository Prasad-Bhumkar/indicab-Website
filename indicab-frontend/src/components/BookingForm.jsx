import React, { useState, useEffect } from 'react';
import { apiClient, offlineQueue } from '../config/apiConfig';
import { closeBookingConfirmationModal } from '../features/bookingConfirmationModal/bookingConfirmationModalSlice';
import { useSelector, useDispatch } from 'react-redux';
import BookingConfirmationModal from './BookingConfirmationModal';
import { addBooking } from '../features/bookingHistory/bookingHistorySlice';
import { openBookingConfirmationModal } from '../features/bookingConfirmationModal/bookingConfirmationModalSlice';
import { fetchVehicles } from '../features/admin/adminSlice';
import { FaMapMarkerAlt, FaCalendarAlt, FaUser } from 'react-icons/fa';

const BookingForm = () => {
  const dispatch = useDispatch();
  const mockRoutes = useSelector((state) => state.mockRoutes.routes);
  const adminVehicles = useSelector((state) => state.admin.vehicles);
  const vehiclesLoading = useSelector((state) => state.admin.loading);

  // Default vehicles in case API fails - Controlled from Admin Panel
  const defaultVehicles = [
    {
      id: 1,
      type: 'Swift/Dzire',
      baseFare: 120,
      ratePerKm: 10,
      perDayCharge: 800,
      capacity: 4,
      image:
        'https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=880&auto=format&fit=crop',
      description: 'Compact & Economical - Ideal for 4 people',
    },
    {
      id: 2,
      type: 'Ertiga/Xylo',
      baseFare: 160,
      ratePerKm: 12,
      perDayCharge: 1100,
      capacity: 6,
      image:
        'https://images.unsplash.com/photo-1621135802920-133df287f89c?q=80&w=880&auto=format&fit=crop',
      description: 'Spacious & Comfortable - Ideal for 6 people',
    },
    {
      id: 3,
      type: 'Innova Crysta',
      baseFare: 220,
      ratePerKm: 16,
      perDayCharge: 1500,
      capacity: 7,
      image:
        'https://images.unsplash.com/photo-1605559424843-9e4c3ca3806d?q=80&w=880&auto=format&fit=crop',
      description: 'Premium SUV - Best-in-class comfort',
    },
    {
      id: 4,
      type: 'Tempo Traveller',
      baseFare: 350,
      ratePerKm: 22,
      perDayCharge: 2500,
      capacity: 12,
      image:
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=880&auto=format&fit=crop',
      description: 'Perfect for Large Groups (Up to 12)',
    },
  ];
  const [currentStep, setCurrentStep] = useState(1);
  const [tripType, setTripType] = useState('oneway');
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [computedRentalDays, setComputedRentalDays] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [passengerName, setPassengerName] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [hasLicense, setHasLicense] = useState('yes');
  const [passengerCount, setPassengerCount] = useState(1);
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [contactPreference, setContactPreference] = useState('call');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [calculatedFare, setCalculatedFare] = useState(0);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const vehicles = adminVehicles && adminVehicles.length > 0 ? adminVehicles : defaultVehicles;

  // Fetch vehicles on mount
  useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  // Load draft booking from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('bookingFormDraft');
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        setTripType(draft.tripType || 'oneway');
        setFromCity(draft.fromCity || '');
        setToCity(draft.toCity || '');
        setDepartDate(draft.departDate || '');
        setReturnDate(draft.returnDate || '');
        setSelectedVehicle(draft.selectedVehicle || null);
        setPassengerName(draft.passengerName || '');
        setPassengerEmail(draft.passengerEmail || '');
        setPassengerPhone(draft.passengerPhone || '');
        setPickupAddress(draft.pickupAddress || '');
        setDropoffAddress(draft.dropoffAddress || '');
        setLicenseNumber(draft.licenseNumber || '');
        setPassengerCount(draft.passengerCount || 1);
        setSpecialRequirements(draft.specialRequirements || '');
        setContactPreference(draft.contactPreference || 'call');
      }
    } catch (error) {
      // Silently ignore draft loading errors
    }
  }, []);

  // Save draft booking to localStorage whenever form changes
  useEffect(() => {
    const draft = {
      tripType,
      fromCity,
      toCity,
      departDate,
      returnDate,
      selectedVehicle,
      passengerName,
      passengerEmail,
      passengerPhone,
      pickupAddress,
      dropoffAddress,
      licenseNumber,
      passengerCount,
      specialRequirements,
      contactPreference,
    };
    try {
      localStorage.setItem('bookingFormDraft', JSON.stringify(draft));
    } catch (error) {
      // Silently ignore draft saving errors
    }
  }, [tripType, fromCity, toCity, departDate, returnDate, selectedVehicle, passengerName, passengerEmail, passengerPhone, pickupAddress, dropoffAddress, licenseNumber, passengerCount, specialRequirements, contactPreference]);

  // Calculate rental days based on departDate and returnDate
  useEffect(() => {
    if (tripType === 'rental' && departDate && returnDate) {
      const start = new Date(departDate);
      const end = new Date(returnDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setComputedRentalDays(diffDays);
    } else if (tripType === 'rental') {
      setComputedRentalDays(0);
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!fromCity) newErrors.fromCity = 'From city is required.';
    if (!toCity) newErrors.toCity = 'To city is required.';
    if (!departDate) newErrors.departDate = 'Departure date is required.';
    else if (new Date(departDate) < today) {
      newErrors.departDate = 'Departure date cannot be in the past.';
    }

    if ((tripType === 'roundtrip' || tripType === 'rental') && !returnDate) {
      newErrors.returnDate = 'Return date is required for round trips and rentals.';
    }

    if (returnDate && departDate) {
      const deptDate = new Date(departDate);
      const retDate = new Date(returnDate);
      if (retDate < deptDate) {
        newErrors.returnDate = 'Return date cannot be before departure date.';
      }
    }

    if (!selectedVehicle) newErrors.selectedVehicle = 'Please select a vehicle.';

    if (selectedVehicle && passengerCount > selectedVehicle.capacity) {
      newErrors.passengerCount = `This vehicle has a capacity of ${selectedVehicle.capacity} passengers. Please select a different vehicle or reduce passenger count.`;
    }

    if (!passengerName) newErrors.passengerName = 'Passenger name is required.';
    if (!passengerEmail) newErrors.passengerEmail = 'Email is required.';
    else if (!emailRegex.test(passengerEmail))
      newErrors.passengerEmail = 'Please enter a valid email address.';

    if (!passengerPhone) newErrors.passengerPhone = 'Phone number is required.';
    else if (!phoneRegex.test(passengerPhone))
      newErrors.passengerPhone = 'Phone number must be 10 digits (e.g., 9876543210).';

    if (tripType === 'rental') {
      if (!licenseNumber) newErrors.licenseNumber = 'License number is required for self-drive.';
      else if (licenseNumber.length < 5)
        newErrors.licenseNumber = 'License number must be at least 5 characters.';
    }

    if (!pickupAddress) newErrors.pickupAddress = 'Pickup address is required.';
    else if (pickupAddress.length < 5)
      newErrors.pickupAddress = 'Pickup address must be at least 5 characters.';

    if (!dropoffAddress) newErrors.dropoffAddress = 'Drop-off address is required.';
    else if (dropoffAddress.length < 5)
      newErrors.dropoffAddress = 'Drop-off address must be at least 5 characters.';

    if (!passengerCount || passengerCount < 1 || passengerCount > 12)
      newErrors.passengerCount = 'Please select valid number of passengers (1-12).';

    if (!acceptTerms)
      newErrors.acceptTerms = 'You must accept terms and conditions.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitBookingWithRetry = async (newBooking, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await apiClient.post('/v1/bookings', newBooking);
        return response.data;
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  };

  const getErrorMessage = (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (!error.response) {
      return 'Network error. Please check your connection and try again.';
    }

    const errorMap = {
      400: message || 'Invalid booking details. Please check and try again.',
      401: 'Please log in to continue with your booking.',
      403: 'You do not have permission to create this booking.',
      404: 'Booking service is currently unavailable.',
      409: message || 'This booking slot is no longer available. Please select different dates or vehicle.',
      422: message || 'Some of your booking details are invalid. Please review and try again.',
      500: 'Server error. Please try again in a few moments.',
      503: 'Booking service is temporarily unavailable. Please try again later.',
    };

    return errorMap[status] || message || 'Failed to save booking. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (validateForm()) {
      const newBooking = {
        tripType: tripType,
        from: fromCity,
        to: toCity,
        departDate: departDate,
        returnDate: returnDate || null,
        vehicle: selectedVehicle.type,
        vehicleId: selectedVehicle.id,
        amount: calculatedFare,
        status: 'PENDING',
        fullName: passengerName,
        phoneNumber: passengerPhone,
        email: passengerEmail,
        licenseNumber: tripType === 'rental' ? licenseNumber : null,
        pickupAddress: pickupAddress,
        dropoffAddress: dropoffAddress,
        passengerCount: passengerCount,
        specialRequirements: specialRequirements,
        contactPreference: contactPreference,
      };

      try {
        setIsSubmitting(true);

        // Check if online
        if (!navigator.onLine) {
          const queueId = await offlineQueue.addToQueue(newBooking);
          setSubmitError(null);

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
            calculatedFare,
            bookingId: `OFFLINE_${queueId}`,
            bookingReference: `OFFLINE_${queueId}`,
            isOffline: true,
          };

          dispatch(openBookingConfirmationModal(details));
          localStorage.removeItem('bookingFormDraft');
          return;
        }

        // Online - submit normally
        const savedBooking = await submitBookingWithRetry(newBooking);
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
          calculatedFare,
          bookingId: savedBooking.id || savedBooking._id,
          bookingReference: savedBooking.bookingReference || savedBooking.referenceNumber,
          isOffline: false,
        };

        dispatch(openBookingConfirmationModal(details));
        localStorage.removeItem('bookingFormDraft');
      } catch (error) {
        const errorMsg = getErrorMessage(error);
        setSubmitError(errorMsg);
        // Error message displayed to user via setSubmitError
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
    setCurrentStep(1);
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
    setDropoffAddress('');
    setLicenseNumber('');
    setHasLicense('yes');
    setPassengerCount(1);
    setSpecialRequirements('');
    setContactPreference('call');
    setAcceptTerms(false);
    setSubmitError(null);
  };

  const handleNextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStepIndicator = () => (
    <div className="booking-progress-indicator">
      {[1, 2, 3].map((step) => (
        <div key={step} className={`progress-step ${step <= currentStep ? 'active' : ''}`}>
          <div className="step-number">{step}</div>
          <div className="step-label">
            {step === 1 && 'Trip'}
            {step === 2 && 'Vehicle'}
            {step === 3 && 'Details'}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="booking-form-container">
      {renderStepIndicator()}

      <div className="booking-form">
        {/* Step 1: Trip Type & Routes */}
        {currentStep === 1 && (
          <div className="form-step">
            <h4 className="step-title">Choose Your Trip</h4>

            <div className="trip-type-selector mb-4">
              {['oneway', 'roundtrip', 'rental'].map((type) => (
                <button
                  key={type}
                  className={`trip-btn ${tripType === type ? 'active' : ''}`}
                  onClick={() => handleTripTypeChange(type)}
                >
                  <span className="trip-icon">
                    {type === 'oneway' && '→'}
                    {type === 'roundtrip' && '⇄'}
                    {type === 'rental' && '📅'}
                  </span>
                  <span>{type === 'oneway' ? 'One Way' : type === 'roundtrip' ? 'Round Trip' : 'Rental'}</span>
                </button>
              ))}
            </div>

            <div className="route-input-section">
              <div className="input-group-compact">
                <label className="input-label"><FaMapMarkerAlt /> From</label>
                <select
                  className={`form-select form-select-compact ${errors.fromCity ? 'is-invalid' : ''}`}
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                >
                  <option value="">Select Pickup City</option>
                  {[...new Set(mockRoutes.map((route) => route.from))].map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.fromCity && <div className="invalid-feedback">{errors.fromCity}</div>}
              </div>

              <div className="input-group-compact">
                <label className="input-label"><FaMapMarkerAlt /> To</label>
                <select
                  className={`form-select form-select-compact ${errors.toCity ? 'is-invalid' : ''}`}
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  disabled={!fromCity}
                >
                  <option value="">Select Destination City</option>
                  {fromCity && mockRoutes
                    .filter((route) => route.from === fromCity)
                    .map((route) => <option key={route.to} value={route.to}>{route.to}</option>)}
                </select>
                {errors.toCity && <div className="invalid-feedback">{errors.toCity}</div>}
              </div>

              <div className="input-group-compact">
                <label className="input-label"><FaCalendarAlt /> Departure</label>
                <input
                  type="date"
                  className={`form-control form-control-compact ${errors.departDate ? 'is-invalid' : ''}`}
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                />
                {errors.departDate && <div className="invalid-feedback">{errors.departDate}</div>}
              </div>

              {(tripType === 'roundtrip' || tripType === 'rental') && (
                <div className="input-group-compact">
                  <label className="input-label"><FaCalendarAlt /> Return</label>
                  <input
                    type="date"
                    className={`form-control form-control-compact ${errors.returnDate ? 'is-invalid' : ''}`}
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                  />
                  {errors.returnDate && <div className="invalid-feedback">{errors.returnDate}</div>}
                </div>
              )}

              {tripType === 'rental' && computedRentalDays > 0 && (
                <div className="input-group-compact">
                  <label className="input-label">Duration</label>
                  <input type="text" className="form-control form-control-compact" value={`${computedRentalDays} days`} disabled />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Vehicle Selection */}
        {currentStep === 2 && (
          <div className="form-step">
            <div className="flex justify-between items-center mb-6">
              <h4 className="step-title mb-0">Select Your Vehicle</h4>
              {vehiclesLoading && (
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <div className="spinner-border spinner-border-sm" role="status"></div>
                  <span>Updating prices...</span>
                </div>
              )}
            </div>
            <div className="vehicle-grid">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={`vehicle-card-compact group ${selectedVehicle?.id === vehicle.id ? 'selected' : ''}`}
                  onClick={() => handleVehicleSelect(vehicle)}
                >
                  <div className="vehicle-image-wrapper overflow-hidden">
                    <img
                      src={vehicle.image}
                      alt={vehicle.type}
                      className="group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="vehicle-info-compact">
                    <div className="flex justify-between items-start mb-1">
                      <h6 className="font-bold">{vehicle.type}</h6>
                      <span className="text-emerald-600 font-bold">₹{vehicle.ratePerKm}/km</span>
                    </div>
                    <p className="vehicle-desc text-xs">{vehicle.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="vehicle-capacity text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">👥 {vehicle.capacity} seats</p>
                      <p className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">✨ AC / Chauffeur</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.selectedVehicle && <div className="text-danger mt-3">{errors.selectedVehicle}</div>}
          </div>
        )}

        {/* Step 3: Passenger Details & Confirmation */}
        {currentStep === 3 && (
          <div className="form-step">
            <h4 className="step-title">Your Details & Confirm Booking</h4>
            <div className="details-grid">
              <div className="input-group-compact">
                <label className="input-label"><FaUser /> Full Name</label>
                <input
                  type="text"
                  className={`form-control form-control-compact ${errors.passengerName ? 'is-invalid' : ''}`}
                  placeholder="Your name"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                />
                {errors.passengerName && <div className="invalid-feedback">{errors.passengerName}</div>}
              </div>

              <div className="input-group-compact">
                <label className="input-label">📧 Email</label>
                <input
                  type="email"
                  className={`form-control form-control-compact ${errors.passengerEmail ? 'is-invalid' : ''}`}
                  placeholder="your@email.com"
                  value={passengerEmail}
                  onChange={(e) => setPassengerEmail(e.target.value)}
                />
                {errors.passengerEmail && <div className="invalid-feedback">{errors.passengerEmail}</div>}
              </div>

              <div className="input-group-compact">
                <label className="input-label">📱 Phone</label>
                <input
                  type="tel"
                  className={`form-control form-control-compact ${errors.passengerPhone ? 'is-invalid' : ''}`}
                  placeholder="10-digit number"
                  value={passengerPhone}
                  onChange={(e) => setPassengerPhone(e.target.value)}
                />
                {errors.passengerPhone && <div className="invalid-feedback">{errors.passengerPhone}</div>}
              </div>

              <div className="input-group-compact">
                <label className="input-label">👥 Number of Passengers</label>
                <select
                  className={`form-select form-select-compact ${errors.passengerCount ? 'is-invalid' : ''}`}
                  value={passengerCount}
                  onChange={(e) => setPassengerCount(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                    <option key={num} value={num}>{num} passenger{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
                {errors.passengerCount && <div className="invalid-feedback">{errors.passengerCount}</div>}
              </div>

              <div className="input-group-compact col-span-2">
                <label className="input-label">📍 Pickup Address</label>
                <input
                  type="text"
                  className={`form-control form-control-compact ${errors.pickupAddress ? 'is-invalid' : ''}`}
                  placeholder="Full pickup address"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                />
                {errors.pickupAddress && <div className="invalid-feedback">{errors.pickupAddress}</div>}
              </div>

              <div className="input-group-compact col-span-2">
                <label className="input-label">📍 Drop-off Address</label>
                <input
                  type="text"
                  className={`form-control form-control-compact ${errors.dropoffAddress ? 'is-invalid' : ''}`}
                  placeholder="Where should we drop you off?"
                  value={dropoffAddress}
                  onChange={(e) => setDropoffAddress(e.target.value)}
                />
                {errors.dropoffAddress && <div className="invalid-feedback">{errors.dropoffAddress}</div>}
              </div>

              <div className="input-group-compact col-span-2">
                <label className="input-label">ℹ️ Special Requirements (Optional)</label>
                <textarea
                  className="form-control form-control-compact"
                  placeholder="e.g., Wheelchair accessible, infant seat, extra luggage space, etc."
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  rows="2"
                  style={{ resize: 'vertical' }}
                />
              </div>

              {tripType === 'rental' && (
                <div className="input-group-compact">
                  <label className="input-label">🪪 Driving License Number *</label>
                  <input
                    type="text"
                    className={`form-control form-control-compact ${errors.licenseNumber ? 'is-invalid' : ''}`}
                    placeholder="Enter your license number"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                  />
                  {errors.licenseNumber && <div className="invalid-feedback">{errors.licenseNumber}</div>}
                </div>
              )}

              <div className="input-group-compact">
                <label className="input-label">📞 Preferred Contact Method</label>
                <div className="contact-preference-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="contactPref"
                      value="call"
                      checked={contactPreference === 'call'}
                      onChange={(e) => setContactPreference(e.target.value)}
                    />
                    Call
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="contactPref"
                      value="sms"
                      checked={contactPreference === 'sms'}
                      onChange={(e) => setContactPreference(e.target.value)}
                    />
                    SMS
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="contactPref"
                      value="whatsapp"
                      checked={contactPreference === 'whatsapp'}
                      onChange={(e) => setContactPreference(e.target.value)}
                    />
                    WhatsApp
                  </label>
                </div>
              </div>
            </div>

            <div className="fare-summary">
              <h5>Booking Summary</h5>
              <div className="summary-row">
                <span>From - To:</span>
                <span className="summary-value">{fromCity} → {toCity}</span>
              </div>
              <div className="summary-row">
                <span>Vehicle:</span>
                <span className="summary-value">{selectedVehicle?.type}</span>
              </div>
              <div className="summary-row">
                <span>Passengers:</span>
                <span className="summary-value">{passengerCount}</span>
              </div>
              <div className="summary-row">
                <span>Trip Type:</span>
                <span className="summary-value">{tripType.toUpperCase()}</span>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid rgba(5, 150, 105, 0.2)' }}>
                <h6 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: '600' }}>Fare Breakdown</h6>
                <div className="summary-row">
                  <span>Base Fare:</span>
                  <span className="summary-value">₹{selectedVehicle?.baseFare || 0}</span>
                </div>
                {(() => {
                  const route = mockRoutes.find(r => r.from === fromCity && r.to === toCity);
                  const distance = route?.distance || 0;
                  const distanceCharge = distance * selectedVehicle?.ratePerKm || 0;
                  return (
                    <div className="summary-row">
                      <span>Distance ({distance}km × ₹{selectedVehicle?.ratePerKm}/km):</span>
                      <span className="summary-value">₹{distanceCharge.toFixed(2)}</span>
                    </div>
                  );
                })()}
                {(tripType === 'rental' && computedRentalDays > 0) && (
                  <div className="summary-row">
                    <span>Rental ({computedRentalDays} days × ₹{selectedVehicle?.perDayCharge}/day):</span>
                    <span className="summary-value">₹{(selectedVehicle?.perDayCharge * computedRentalDays).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="summary-row total">
                <span>Total Amount:</span>
                <span className="fare-amount">₹{calculatedFare.toFixed(2)}</span>
              </div>
            </div>

            <div className="terms-section">
              <label className="terms-checkbox">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                />
                <span>
                  I agree to the <a href="#" target="_blank">Terms & Conditions</a> and understand the <a href="#" target="_blank">Cancellation Policy</a> (Free cancellation up to 30 mins before pickup)
                </span>
              </label>
              {errors.acceptTerms && <div className="invalid-feedback">{errors.acceptTerms}</div>}
            </div>

            {submitError && <div className="alert alert-danger mt-3">{submitError}</div>}
          </div>
        )}

        {/* Navigation & Submit */}
        <div className="booking-footer">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handlePrevStep}
            style={{ visibility: currentStep === 1 ? 'hidden' : 'visible' }}
          >
            Back
          </button>

          {currentStep === 3 ? (
            <form onSubmit={handleSubmit} style={{ flex: 1, marginLeft: '0.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary-custom w-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : `Confirm Booking (₹${calculatedFare.toFixed(2)})`}
              </button>
            </form>
          ) : (
            <button
              type="button"
              className="btn btn-primary-custom btn-sm"
              onClick={handleNextStep}
              style={{ marginLeft: '0.5rem', flex: 1 }}
            >
              Next
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
      <BookingConfirmationModal onClose={closeModal} />
    </div>
  );
};

export default BookingForm;
