import React from 'react';
import './FormField.css';

/**
 * FormField Component
 * Reusable form field with validation, error messages, and accessibility
 * 
 * @param {string} label - Field label
 * @param {string} name - Field name attribute
 * @param {string} type - Input type (text, email, password, number, date, etc.)
 * @param {string} value - Current field value
 * @param {function} onChange - Change handler
 * @param {string} error - Error message (if any)
 * @param {string} helpText - Helper text below field
 * @param {string} placeholder - Input placeholder
 * @param {boolean} required - Whether field is required
 * @param {boolean} disabled - Whether field is disabled
 * @param {object} rest - Additional props
 */
const FormField = ({
  label,
  name,
  type = 'text',
  value = '',
  onChange,
  error = null,
  helpText = null,
  placeholder = '',
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  ...rest
}) => {
  const fieldId = `field-${name}`;
  const errorId = error ? `${fieldId}-error` : null;
  const helpId = helpText ? `${fieldId}-help` : null;

  return (
    <div className={`form-field ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''} ${className}`}>
      {label && (
        <label htmlFor={fieldId} className="form-field-label">
          {label}
          {required && <span className="required-asterisk" aria-label="required">*</span>}
        </label>
      )}

      <div className="form-field-input-wrapper">
        <input
          id={fieldId}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`form-field-input ${inputClassName}`}
          aria-invalid={!!error}
          aria-describedby={[errorId, helpId].filter(Boolean).join(' ') || undefined}
          {...rest}
        />
        
        {error && (
          <span className="form-field-error-icon" aria-hidden="true">
            <i className="bi bi-exclamation-circle"></i>
          </span>
        )}
      </div>

      {error && (
        <span id={errorId} className="form-field-error-message" role="alert">
          <i className="bi bi-exclamation-triangle"></i>
          {error}
        </span>
      )}

      {helpText && !error && (
        <span id={helpId} className="form-field-help-text">
          <i className="bi bi-info-circle"></i>
          {helpText}
        </span>
      )}
    </div>
  );
};

export default FormField;

/**
 * FormSelect Component
 * Select field with validation and error handling
 */
export const FormSelect = ({
  label,
  name,
  value = '',
  onChange,
  options = [],
  error = null,
  helpText = null,
  required = false,
  disabled = false,
  className = '',
  ...rest
}) => {
  const fieldId = `field-${name}`;
  const errorId = error ? `${fieldId}-error` : null;
  const helpId = helpText ? `${fieldId}-help` : null;

  return (
    <div className={`form-field ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''} ${className}`}>
      {label && (
        <label htmlFor={fieldId} className="form-field-label">
          {label}
          {required && <span className="required-asterisk">*</span>}
        </label>
      )}

      <div className="form-field-input-wrapper">
        <select
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className="form-field-input form-field-select"
          aria-invalid={!!error}
          aria-describedby={[errorId, helpId].filter(Boolean).join(' ') || undefined}
          {...rest}
        >
          <option value="">-- Select {label?.toLowerCase()} --</option>
          {options.map(option => (
            <option
              key={option.value || option.id}
              value={option.value || option.id}
            >
              {option.label || option.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <span id={errorId} className="form-field-error-message" role="alert">
          <i className="bi bi-exclamation-triangle"></i>
          {error}
        </span>
      )}

      {helpText && !error && (
        <span id={helpId} className="form-field-help-text">
          <i className="bi bi-info-circle"></i>
          {helpText}
        </span>
      )}
    </div>
  );
};

/**
 * FormTextarea Component
 * Textarea field with character limit and validation
 */
export const FormTextarea = ({
  label,
  name,
  value = '',
  onChange,
  error = null,
  helpText = null,
  placeholder = '',
  required = false,
  disabled = false,
  maxLength = null,
  rows = 4,
  className = '',
  ...rest
}) => {
  const fieldId = `field-${name}`;
  const errorId = error ? `${fieldId}-error` : null;
  const helpId = helpText ? `${fieldId}-help` : null;
  const charCount = value?.length || 0;

  return (
    <div className={`form-field ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''} ${className}`}>
      {label && (
        <label htmlFor={fieldId} className="form-field-label">
          {label}
          {required && <span className="required-asterisk">*</span>}
        </label>
      )}

      <textarea
        id={fieldId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        rows={rows}
        className="form-field-input form-field-textarea"
        aria-invalid={!!error}
        aria-describedby={[errorId, helpId].filter(Boolean).join(' ') || undefined}
        {...rest}
      />

      {maxLength && (
        <div className="form-field-char-count">
          {charCount} / {maxLength}
        </div>
      )}

      {error && (
        <span id={errorId} className="form-field-error-message" role="alert">
          <i className="bi bi-exclamation-triangle"></i>
          {error}
        </span>
      )}

      {helpText && !error && (
        <span id={helpId} className="form-field-help-text">
          <i className="bi bi-info-circle"></i>
          {helpText}
        </span>
      )}
    </div>
  );
};

/**
 * FormCheckbox Component
 * Checkbox with label and validation
 */
export const FormCheckbox = ({
  label,
  name,
  checked = false,
  onChange,
  error = null,
  helpText = null,
  disabled = false,
  className = '',
  ...rest
}) => {
  const fieldId = `field-${name}`;
  const errorId = error ? `${fieldId}-error` : null;
  const helpId = helpText ? `${fieldId}-help` : null;

  return (
    <div className={`form-field form-field-checkbox ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''} ${className}`}>
      <div className="form-field-input-wrapper">
        <input
          id={fieldId}
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="form-field-checkbox-input"
          aria-invalid={!!error}
          aria-describedby={[errorId, helpId].filter(Boolean).join(' ') || undefined}
          {...rest}
        />
        {label && (
          <label htmlFor={fieldId} className="form-field-checkbox-label">
            {label}
          </label>
        )}
      </div>

      {error && (
        <span id={errorId} className="form-field-error-message" role="alert">
          <i className="bi bi-exclamation-triangle"></i>
          {error}
        </span>
      )}

      {helpText && !error && (
        <span id={helpId} className="form-field-help-text">
          <i className="bi bi-info-circle"></i>
          {helpText}
        </span>
      )}
    </div>
  );
};
