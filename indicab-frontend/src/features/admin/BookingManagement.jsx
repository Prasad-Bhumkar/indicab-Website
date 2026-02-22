import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookings, updateBookingStatus, cancelBooking, bulkDeleteBookings, bulkUpdateStatus, clearSuccessMessage, clearError } from './adminSlice';
import ExportModal from '../../components/ExportModal';
import { HeaderCheckbox, RowCheckbox } from '../../components/CheckboxColumn';
import BulkActionBar from '../../components/BulkActionBar';
import {
  toggleItemSelection,
  selectAllItems,
  clearSelection,
  isItemSelected,
  getSelectionStats,
  getBulkActionConfirmMessage,
  formatSelectedIdsForAPI,
} from './bulkActionsUtils';
import './ManagementPages.css';

const BookingManagement = () => {
  const dispatch = useDispatch();
  const { bookings, loading, error, successMessage } = useSelector((state) => state.admin);

  const [filterStatus, setFilterStatus] = useState('all');
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState(new Set());

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handleStatusChange = (bookingId, newStatus) => {
    dispatch(updateBookingStatus({ bookingId, status: newStatus }));
  };

  const handleCancel = (bookingId) => {
    const reason = window.prompt('Enter reason for cancellation:');
    if (reason !== null) {
      dispatch(cancelBooking({ bookingId, reason: reason || 'Admin cancelled' }));
    }
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status?.toLowerCase() || 'pending'}`;
  };

  const filteredBookings = filterStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status?.toLowerCase() === filterStatus.toLowerCase());

  // Bulk selection handlers
  const handleRowCheckboxChange = (bookingId) => {
    setSelectedBookings(toggleItemSelection(selectedBookings, bookingId));
  };

  const handleSelectAllChange = () => {
    const stats = getSelectionStats(selectedBookings, filteredBookings);
    if (stats.isAllSelected) {
      setSelectedBookings(clearSelection());
    } else {
      setSelectedBookings(selectAllItems(filteredBookings));
    }
  };

  const handleBulkDelete = () => {
    const stats = getSelectionStats(selectedBookings, filteredBookings);
    const confirmMsg = getBulkActionConfirmMessage('delete', stats.totalSelected, 'booking');

    if (window.confirm(confirmMsg)) {
      const ids = formatSelectedIdsForAPI(selectedBookings);
      dispatch(bulkDeleteBookings(ids)).then(() => {
        setSelectedBookings(clearSelection());
      });
    }
  };

  const handleBulkStatusChange = (status) => {
    const stats = getSelectionStats(selectedBookings, filteredBookings);
    const confirmMsg = getBulkActionConfirmMessage(`update status to ${status}`, stats.totalSelected, 'booking');

    if (window.confirm(confirmMsg)) {
      const ids = formatSelectedIdsForAPI(selectedBookings);
      dispatch(bulkUpdateStatus({ entityType: 'bookings', ids, status })).then(() => {
        setSelectedBookings(clearSelection());
      });
    }
  };

  const handleClearSelection = () => {
    setSelectedBookings(clearSelection());
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <h3 className="management-title">Booking Management</h3>
        <div className="header-actions">
          <button
            className="add-btn export-btn"
            onClick={() => setShowExportModal(true)}
            title="Export bookings"
          >
            📥 Export
          </button>
          <div className="filter-group">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setSelectedBookings(clearSelection());
            }}
            style={{width: 'auto'}}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <span>{error}</span>
          <button className="close-alert" onClick={() => dispatch(clearError())}>×</button>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <span>{successMessage}</span>
          <button className="close-alert" onClick={() => dispatch(clearSuccessMessage())}>×</button>
        </div>
      )}

      <BulkActionBar
        selectedCount={selectedBookings.size}
        totalCount={filteredBookings.length}
        isAllSelected={selectedBookings.size === filteredBookings.length && filteredBookings.length > 0}
        entityType="booking"
        onDelete={handleBulkDelete}
        onChangeStatus={handleBulkStatusChange}
        onClearSelection={handleClearSelection}
        onSelectAll={() => setSelectedBookings(selectAllItems(filteredBookings))}
        statusOptions={[
          { value: 'pending', label: 'Pending' },
          { value: 'ongoing', label: 'Ongoing' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' },
        ]}
        loading={loading}
      />

      {loading && !bookings.length ? (
        <div className="loading-spinner">Loading bookings...</div>
      ) : (
        <div className="table-responsive">
          <table className="management-table">
            <thead>
              <tr>
                <HeaderCheckbox
                  isAllSelected={selectedBookings.size === filteredBookings.length && filteredBookings.length > 0}
                  isIndeterminate={selectedBookings.size > 0 && selectedBookings.size < filteredBookings.length}
                  onChange={handleSelectAllChange}
                  disabled={loading || filteredBookings.length === 0}
                  title="Select all bookings"
                />
                <th>Booking ID</th>
                <th>User</th>
                <th>Route</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <RowCheckbox
                      isSelected={isItemSelected(selectedBookings, booking.id)}
                      onChange={() => handleRowCheckboxChange(booking.id)}
                      disabled={loading}
                      rowId={booking.id}
                    />
                    <td>#{booking.id}</td>
                    <td>{booking.user}</td>
                    <td>
                      <div style={{fontWeight: '500'}}>{booking.from} → {booking.to}</div>
                    </td>
                    <td>{booking.date}</td>
                    <td>
                      <select
                        className={`form-select form-select-sm ${getStatusClass(booking.status)}`}
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        style={{border: 'none', fontWeight: '600'}}
                      >
                        <option value="pending">Pending</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon btn-delete" onClick={() => handleCancel(booking.id)} title="Cancel Booking">
                          🚫
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" style={{textAlign: 'center', padding: '2rem'}}>No bookings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ExportModal
        show={showExportModal}
        onHide={() => setShowExportModal(false)}
        data={selectedBookings.size > 0 ? filteredBookings.filter(b => selectedBookings.has(b.id)) : filteredBookings}
        entityType="booking"
        filename="bookings"
        selectedOnly={selectedBookings.size > 0}
        selectedCount={selectedBookings.size}
      />
    </div>
  );
};

export default BookingManagement;
