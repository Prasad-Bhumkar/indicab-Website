import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, createUser, updateUser, deleteUser, bulkDeleteUsers, clearSuccessMessage, clearError } from './adminSlice';
import { SkeletonTable } from '../../components/Skeleton';
import PaginationControls from '../../components/PaginationControls';
import FilterBar from '../../components/FilterBar';
import SortableHeader from '../../components/SortableHeader';
import { HeaderCheckbox, RowCheckbox } from '../../components/CheckboxColumn';
import BulkActionBar from '../../components/BulkActionBar';
import ExportModal from '../../components/ExportModal';
import { userValidationSchema, validateFormData, hasFieldError, getFieldError } from './validationSchemas';
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

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, loading, error, successMessage, pagination } = useSelector((state) => state.admin);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [showExportModal, setShowExportModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active'
  });

  useEffect(() => {
    const params = {
      page,
      size: pageSize,
      sort: `${sortColumn},${sortDirection}`,
      ...filters,
    };
    dispatch(fetchUsers(params));
  }, [dispatch, page, pageSize, sortColumn, sortDirection, filters]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    const validation = await validateFormData(userValidationSchema, formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    dispatch(createUser(formData));
    setShowAddForm(false);
    resetForm();
  };

  const handleEditClick = (user) => {
    setEditingId(user.id);
    setFormData({ ...user });
    setShowAddForm(false);
  };

  const handleSaveEdit = async (userId) => {
    setValidationErrors({});

    const validation = await validateFormData(userValidationSchema, formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    dispatch(updateUser({ userId, userData: formData }));
    setEditingId(null);
    resetForm();
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      dispatch(deleteUser(userId));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      status: 'active'
    });
    setEditingId(null);
  };

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

  // Bulk selection handlers
  const handleRowCheckboxChange = (userId) => {
    setSelectedUsers(toggleItemSelection(selectedUsers, userId));
  };

  const handleSelectAllChange = () => {
    const stats = getSelectionStats(selectedUsers, users);
    if (stats.isAllSelected) {
      setSelectedUsers(clearSelection());
    } else {
      setSelectedUsers(selectAllItems(users));
    }
  };

  const handleBulkDelete = () => {
    const stats = getSelectionStats(selectedUsers, users);
    const confirmMsg = getBulkActionConfirmMessage('delete', stats.totalSelected, 'user');

    if (window.confirm(confirmMsg)) {
      const ids = formatSelectedIdsForAPI(selectedUsers);
      dispatch(bulkDeleteUsers(ids)).then(() => {
        setSelectedUsers(clearSelection());
        dispatch(fetchUsers({ page, size: pageSize, sort: `${sortColumn},${sortDirection}`, ...filters }));
      });
    }
  };

  const handleClearSelection = () => {
    setSelectedUsers(clearSelection());
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status?.toLowerCase() || 'inactive'}`;
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <h3 className="management-title">User Management</h3>
        <div className="header-actions">
          <button
            className="add-btn export-btn"
            onClick={() => setShowExportModal(true)}
            title="Export users"
          >
            📥 Export
          </button>
          <button
            className="add-btn"
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingId(null);
              if (!showAddForm) resetForm();
            }}
          >
            {showAddForm ? 'Cancel' : '+ Add User'}
          </button>
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

      <FilterBar
        onFilterChange={handleFilterChange}
        filters={filters}
        filterOptions={{
          showSearch: true,
          showStatus: true,
          statusOptions: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'suspended', label: 'Suspended' },
          ],
        }}
        loading={loading}
      />

      <BulkActionBar
        selectedCount={selectedUsers.size}
        totalCount={users.length}
        isAllSelected={selectedUsers.size === users.length && users.length > 0}
        entityType="user"
        onDelete={handleBulkDelete}
        onClearSelection={handleClearSelection}
        onSelectAll={() => setSelectedUsers(selectAllItems(users))}
        loading={loading}
      />

      {(showAddForm || editingId) && (
        <div className="form-card">
          <h4>{editingId ? 'Edit User' : 'Add New User'}</h4>
          <form onSubmit={editingId ? (e) => { e.preventDefault(); handleSaveEdit(editingId); } : handleAddUser}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  className={`form-input ${hasFieldError(validationErrors, 'name') ? 'is-invalid' : ''}`}
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                {hasFieldError(validationErrors, 'name') && (
                  <small className="form-error">{getFieldError(validationErrors, 'name')}</small>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className={`form-input ${hasFieldError(validationErrors, 'email') ? 'is-invalid' : ''}`}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                {hasFieldError(validationErrors, 'email') && (
                  <small className="form-error">{getFieldError(validationErrors, 'email')}</small>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  className={`form-input ${hasFieldError(validationErrors, 'phone') ? 'is-invalid' : ''}`}
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
                {hasFieldError(validationErrors, 'phone') && (
                  <small className="form-error">{getFieldError(validationErrors, 'phone')}</small>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  className={`form-select ${hasFieldError(validationErrors, 'status') ? 'is-invalid' : ''}`}
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
                {hasFieldError(validationErrors, 'status') && (
                  <small className="form-error">{getFieldError(validationErrors, 'status')}</small>
                )}
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="add-btn" style={{backgroundColor: '#6b7280'}} onClick={() => { setShowAddForm(false); setEditingId(null); }}>
                Cancel
              </button>
              <button type="submit" className="add-btn">
                {editingId ? 'Update User' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !users.length ? (
        <SkeletonTable rows={8} />
      ) : (
        <>
          <div className="table-responsive">
            <table className="management-table">
              <thead>
                <tr>
                  <HeaderCheckbox
                    isAllSelected={selectedUsers.size === users.length && users.length > 0}
                    isIndeterminate={selectedUsers.size > 0 && selectedUsers.size < users.length}
                    onChange={handleSelectAllChange}
                    disabled={loading || users.length === 0}
                    title="Select all users"
                  />
                  <th>ID</th>
                  <SortableHeader
                    column="name"
                    label="Name"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    disabled={loading}
                  />
                  <SortableHeader
                    column="email"
                    label="Email"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    disabled={loading}
                  />
                  <SortableHeader
                    column="phone"
                    label="Phone"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    disabled={loading}
                  />
                  <SortableHeader
                    column="status"
                    label="Status"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    disabled={loading}
                  />
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id}>
                      <RowCheckbox
                        isSelected={isItemSelected(selectedUsers, user.id)}
                        onChange={() => handleRowCheckboxChange(user.id)}
                        disabled={loading}
                        rowId={user.id}
                      />
                      <td>#{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>
                        <span className={getStatusClass(user.status)}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon btn-edit" onClick={() => handleEditClick(user)} title="Edit">
                            ✏️
                          </button>
                          <button className="btn-icon btn-delete" onClick={() => handleDeleteUser(user.id)} title="Delete">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" style={{textAlign: 'center', padding: '2rem'}}>No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <PaginationControls
            currentPage={pagination.users.page || page}
            totalPages={pagination.users.totalPages || 1}
            totalElements={pagination.users.totalElements || users.length}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={loading}
          />
        </>
      )}

      <ExportModal
        show={showExportModal}
        onHide={() => setShowExportModal(false)}
        data={selectedUsers.size > 0 ? users.filter(u => selectedUsers.has(u.id)) : users}
        entityType="user"
        filename="users"
        selectedOnly={selectedUsers.size > 0}
        selectedCount={selectedUsers.size}
      />
    </div>
  );
};

export default UserManagement;
