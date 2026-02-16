import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} from './adminSlice';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import './ManagementPages.css';

const BlogManagement = () => {
  const dispatch = useDispatch();
  const { blogs, loading, error } = useSelector((state) => state.admin);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    preview: '',
    category: '',
    image: '',
    date: new Date().toISOString().split('T')[0],
    views: 0,
  });

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

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

  return (
    <div className="management-page">
      <div className="page-header">
        <h2>Blog Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <FiPlus /> {showForm ? 'Cancel' : 'Add New Blog'}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showForm && (
        <div className="form-container">
          <h3>{editingId ? 'Edit Blog' : 'Create New Blog'}</h3>
          <form onSubmit={handleSubmit}>
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
              <label>Preview</label>
              <textarea
                name="preview"
                value={formData.preview}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
              ></textarea>
            </div>

            <div className="form-group">
              <label>Content</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="form-control"
                rows="5"
              ></textarea>
            </div>

            <div className="form-group">
              <label>Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="form-control"
              />
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

            <button type="submit" className="btn btn-success">
              {editingId ? 'Update Blog' : 'Create Blog'}
            </button>
          </form>
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <p>Loading blogs...</p>
        ) : blogs && blogs.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Views</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.id}>
                  <td>{blog.title}</td>
                  <td>{blog.category}</td>
                  <td>{blog.date}</td>
                  <td>{blog.views || 0}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(blog)}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(blog.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No blogs found. Create your first blog!</p>
        )}
      </div>
    </div>
  );
};

export default BlogManagement;
