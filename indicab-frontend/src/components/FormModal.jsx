import React, { useState, useEffect } from 'react';
import React, { useState, useEffect } from 'react';
import './FormModal.css';

/**
 * Form modal component for add/edit operations
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {string} props.title - Modal title
 * @param {Array} props.fields - Form field configuration
 * @param {Object} props.initialData - Initial form data
 * @param {Function} props.onSubmit - Submit callback
 * @param {Function} props.onCancel - Cancel callback
 */
export default function FormModal({
  isOpen,
  title,
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false
}) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button
            className="modal-close-btn"
            onClick={onCancel}
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">
            {fields.map(field => (
              <div key={field.name} className="form-group">
                <label htmlFor={field.name} className="form-label">
                  {field.label}
                  {field.required && <span className="required">*</span>}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    rows={field.rows || 4}
                    disabled={isLoading}
                    className={errors[field.name] ? 'error' : ''}
                  />
                ) : field.type === 'select' ? (
                  <select
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={errors[field.name] ? 'error' : ''}
                  >
                    <option value="">-- Select {field.label} --</option>
                    {field.options && field.options.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'checkbox' ? (
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id={field.name}
                      name={field.name}
                      checked={formData[field.name] || false}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <label htmlFor={field.name}>{field.label}</label>
                  </div>
                ) : (
                  <input
                    type={field.type || 'text'}
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    disabled={isLoading}
                    className={errors[field.name] ? 'error' : ''}
                  />
                )}

                {errors[field.name] && (
                  <span className="error-message">{errors[field.name]}</span>
                )}
              </div>
            ))}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
