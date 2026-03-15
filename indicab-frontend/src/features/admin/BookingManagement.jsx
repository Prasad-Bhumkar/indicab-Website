import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookings, updateBookingStatus, cancelBooking, bulkDeleteBookings, bulkUpdateStatus, clearSuccessMessage, clearError } from './adminSlice';
import ExportModal from '../../components/ExportModal';
import PaginationControls from '../../components/PaginationControls';
import FilterBar from '../../components/FilterBar';
import SortableHeader from '../../components/SortableHeader';
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
  const { bookings, loading, error, successMessage, pagination } = useSelector((state) => state.admin);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filters, setFilters] = useState({ status: '' });
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState(new Set());

  useEffect(() => {
    const params = {
      page,
      size: pageSize,
      sort: `${sortColumn},${sortDirection}`,
      ...filters,
    };
    dispatch(fetchBookings(params));
  }, [dispatch, page, pageSize, sortColumn, sortDirection, filters]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(0); // Reset to first page
  };

  const handleSort = (column, direction) => {
    setSortColumn(column);
    setSortDirection(direction);
    setPage(0); // Reset to first page
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page
  };

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

  // Bulk selection handlers
  const handleRowCheckboxChange = (bookingId) => {
    setSelectedBookings(toggleItemSelection(selectedBookings, bookingId));
  };

  const handleSelectAllChange = () => {
    const stats = getSelectionStats(selectedBookings, bookings);
    if (stats.isAllSelected) {
      setSelectedBookings(clearSelection());
    } else {
      setSelectedBookings(selectAllItems(bookings));
    }
  };

  const handleBulkDelete = () => {
    const stats = getSelectionStats(selectedBookings, bookings);
    const confirmMsg = getBulkActionConfirmMessage('delete', stats.totalSelected, 'booking');

    if (window.confirm(confirmMsg)) {
      const ids = formatSelectedIdsForAPI(selectedBookings);
      dispatch(bulkDeleteBookings(ids)).then(() => {
        setSelectedBookings(clearSelection());
      });
    }
  };

  const handleBulkStatusChange = (status) => {
    const stats = getSelectionStats(selectedBookings, bookings);
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
        </div>
      </div>

      <FilterBar
        onFilterChange={handleFilterChange}
        filters={filters}
        filterOptions={{
          showSearch: true,
          showStatus: true,
          showDateRange: true,
          statusOptions: [
            { value: 'pending', label: 'Pending' },
            { value: 'ongoing', label: 'Ongoing' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' },
          ],
          customFilters: [
            { name: 'vehicleType', label: 'Vehicle Type', type: 'select', options: [
              { value: 'sedan', label: 'Sedan' },
              { value: 'suv', label: 'SUV' },
              { value: 'luxury', label: 'Luxury' },
            ]},
            { name: 'minPrice', label: 'Min Price', type: 'number' },
            { name: 'maxPrice', label: 'Max Price', type: 'number' },
          ],
        }}
      />

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
        totalCount={bookings.length}
        isAllSelected={selectedBookings.size === bookings.length && bookings.length > 0}
        entityType="booking"
        onDelete={handleBulkDelete}
        onChangeStatus={handleBulkStatusChange}
        onClearSelection={handleClearSelection}
        onSelectAll={() => setSelectedBookings(selectAllItems(bookings))}
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
                  isAllSelected={selectedBookings.size === bookings.length && bookings.length > 0}
                  isIndeterminate={selectedBookings.size > 0 && selectedBookings.size < bookings.length}
                  onChange={handleSelectAllChange}
                  disabled={loading || bookings.length === 0}
                  title="Select all bookings"
                />
                <SortableHeader
                  column="id"
                  label="Booking ID"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  column="user"
                  label="User"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  column="from"
                  label="Route"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  column="date"
                  label="Date"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  column="status"
                  label="Status"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((booking) => (
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
                <tr><td colSpan="8" style={{textAlign: 'center', padding: '2rem'}}>No bookings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {bookings.length > 0 && (
        <PaginationControls
          currentPage={page}
          totalPages={pagination?.totalPages || 1}
          totalElements={pagination?.totalElements || bookings.length}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
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
