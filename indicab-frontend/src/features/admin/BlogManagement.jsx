import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  bulkDeleteBlogs,
  bulkUpdateStatus,
  clearSuccessMessage,
  clearError,
} from './adminSlice';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
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

const BlogManagement = () => {
  const dispatch = useDispatch();
  const { blogs, loading, error, successMessage, pagination } = useSelector((state) => state.admin);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedBlogs, setSelectedBlogs] = useState(new Set());
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filters, setFilters] = useState({ status: '' });
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    preview: '',
    category: '',
    image: '',
    date: new Date().toISOString().split('T')[0],
    views: 0,
    status: 'draft'
  });

  useEffect(() => {
    const params = {
      page,
      size: pageSize,
      sort: `${sortColumn},${sortDirection}`,
      ...filters,
    };
    dispatch(fetchBlogs(params));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      dispatch(updateBlog({ id: editingId, ...formData }));
    } else {
      dispatch(createBlog(formData));
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      preview: '',
      category: '',
      image: '',
      date: new Date().toISOString().split('T')[0],
      views: 0,
      status: 'draft'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (blog) => {
    setFormData(blog);
    setEditingId(blog.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      dispatch(deleteBlog(id));
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(0);
  };

  const handleSort = (column, direction) => {
    setSortColumn(column);
    setSortDirection(direction);
    setPage(0);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(0);
  };

  // Bulk selection handlers
  const handleRowCheckboxChange = (blogId) => {
    setSelectedBlogs(toggleItemSelection(selectedBlogs, blogId));
  };

  const handleSelectAllChange = () => {
    const stats = getSelectionStats(selectedBlogs, blogs);
    if (stats.isAllSelected) {
      setSelectedBlogs(clearSelection());
    } else {
      setSelectedBlogs(selectAllItems(blogs));
    }
  };

  const handleBulkDelete = () => {
    const stats = getSelectionStats(selectedBlogs, blogs);
    const confirmMsg = getBulkActionConfirmMessage('delete', stats.totalSelected, 'blog');

    if (window.confirm(confirmMsg)) {
      const ids = formatSelectedIdsForAPI(selectedBlogs);
      dispatch(bulkDeleteBlogs(ids)).then(() => {
        setSelectedBlogs(clearSelection());
      });
    }
  };

  const handleBulkStatusChange = (status) => {
    const stats = getSelectionStats(selectedBlogs, blogs);
    const confirmMsg = getBulkActionConfirmMessage(`update status to ${status}`, stats.totalSelected, 'blog');

    if (window.confirm(confirmMsg)) {
      const ids = formatSelectedIdsForAPI(selectedBlogs);
      dispatch(bulkUpdateStatus({ entityType: 'blogs', ids, status })).then(() => {
        setSelectedBlogs(clearSelection());
      });
    }
  };

  const handleClearSelection = () => {
    setSelectedBlogs(clearSelection());
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status?.toLowerCase() || 'draft'}`;
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <h2>Blog Management</h2>
        <div className="header-actions">
          <button
            className="add-btn export-btn"
            onClick={() => setShowExportModal(true)}
            title="Export blogs"
          >
            📥 Export
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            <FiPlus /> {showForm ? 'Cancel' : 'Add New Blog'}
          </button>
        </div>
      </div>

      <FilterBar
        onFilterChange={handleFilterChange}
        filters={filters}
        filterOptions={{
          showSearch: true,
          showStatus: true,
          statusOptions: [
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
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
        selectedCount={selectedBlogs.size}
        totalCount={blogs.length}
        isAllSelected={selectedBlogs.size === blogs.length && blogs.length > 0}
        entityType="blog"
        onDelete={handleBulkDelete}
        onChangeStatus={handleBulkStatusChange}
        onClearSelection={handleClearSelection}
        onSelectAll={() => setSelectedBlogs(selectAllItems(blogs))}
        statusOptions={[
          { value: 'draft', label: 'Draft' },
          { value: 'published', label: 'Published' },
        ]}
        loading={loading}
      />

      {showForm && (
        <div className="form-container">
          <h3>{editingId ? 'Edit Blog' : 'Create New Blog'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  className="form-control"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group mt-3">
              <label>Preview</label>
              <textarea
                name="preview"
                value={formData.preview}
                onChange={handleInputChange}
                className="form-control"
                rows="2"
              ></textarea>
            </div>

            <div className="form-group mt-3">
              <label>Content</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="form-control"
                rows="4"
              ></textarea>
            </div>

            <div className="form-group mt-3">
              <label>Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>

            <div className="form-actions mt-3">
              <button type="submit" className="btn btn-success">
                {editingId ? 'Update Blog' : 'Create Blog'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        {loading && !blogs.length ? (
          <p>Loading blogs...</p>
        ) : (
          <div className="table-responsive">
            <table className="management-table">
              <thead>
                <tr>
                  <HeaderCheckbox
                    isAllSelected={selectedBlogs.size === blogs.length && blogs.length > 0}
                    isIndeterminate={selectedBlogs.size > 0 && selectedBlogs.size < blogs.length}
                    onChange={handleSelectAllChange}
                    disabled={loading || blogs.length === 0}
                    title="Select all blogs"
                  />
                  <SortableHeader
                    column="title"
                    label="Title"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <th>Category</th>
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
                {blogs && blogs.length > 0 ? (
                  blogs.map((blog) => (
                    <tr key={blog.id}>
                      <RowCheckbox
                        isSelected={isItemSelected(selectedBlogs, blog.id)}
                        onChange={() => handleRowCheckboxChange(blog.id)}
                        disabled={loading}
                        rowId={blog.id}
                      />
                      <td>{blog.title}</td>
                      <td>{blog.category}</td>
                      <td>{blog.date}</td>
                      <td>
                        <span className={getStatusClass(blog.status)}>
                          {blog.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => handleEdit(blog)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDelete(blog.id)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No blogs found. Create your first blog!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {blogs.length > 0 && (
        <PaginationControls
          currentPage={page}
          totalPages={pagination?.totalPages || 1}
          totalElements={pagination?.totalElements || blogs.length}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      <ExportModal
        show={showExportModal}
        onHide={() => setShowExportModal(false)}
        data={selectedBlogs.size > 0 ? blogs.filter(b => selectedBlogs.has(b.id)) : blogs}
        entityType="blog"
        filename="blogs"
        selectedOnly={selectedBlogs.size > 0}
        selectedCount={selectedBlogs.size}
      />
    </div>
  );
};

export default BlogManagement;
