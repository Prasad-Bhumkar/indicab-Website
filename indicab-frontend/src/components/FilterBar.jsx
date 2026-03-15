import React, { useState, useEffect } from 'react';
import './FilterBar.css';

/**
 * FilterBar component for admin data tables
 * Provides search, status filter, and date range filter options
 */
const FilterBar = ({
  onFilterChange = () => {},
  filters = {},
  filterOptions = {
    showSearch: true,
    showStatus: false,
    showDateRange: false,
    statusOptions: [],
    customFilters: [], // { name: string, label: string, type: 'text' | 'select' | 'number', options?: [] }
  },
  loading = false,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || '');
  const [dateFrom, setDateFrom] = useState(filters.dateFrom || '');
  const [dateTo, setDateTo] = useState(filters.dateTo || '');
  const [customFilters, setCustomFilters] = useState(
    filterOptions.customFilters?.reduce((acc, f) => {
      acc[f.name] = filters[f.name] || '';
      return acc;
    }, {}) || {}
  );

  // Debounce search input and other filters
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onFilterChange({
        search,
        status,
        dateFrom,
        dateTo,
        ...customFilters,
      });
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [search, status, dateFrom, dateTo, customFilters, onFilterChange]);

  const handleCustomFilterChange = (name, value) => {
    setCustomFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setSearch('');
    setStatus('');
    setDateFrom('');
    setDateTo('');
    const resetCustom = filterOptions.customFilters?.reduce((acc, f) => {
      acc[f.name] = '';
      return acc;
    }, {}) || {};
    setCustomFilters(resetCustom);
    onFilterChange({
      search: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      ...resetCustom,
    });
  };

  const hasActiveFilters = search || status || dateFrom || dateTo || Object.values(customFilters).some(v => v);

  return (
    <div className="filter-bar-container">
      <div className="filter-bar-main">
        <div className="filter-controls">
          {filterOptions.showSearch && (
            <div className="filter-group">
              <label htmlFor="search-input" className="filter-label">Search</label>
              <div className="search-wrapper">
                <input
                  id="search-input"
                  type="text"
                  className="filter-input search-input"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {filterOptions.showStatus && filterOptions.statusOptions?.length > 0 && (
            <div className="filter-group">
              <label htmlFor="status-filter" className="filter-label">Status</label>
              <select
                id="status-filter"
                className="filter-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
              >
                <option value="">All Status</option>
                {filterOptions.statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="filter-actions">
            <button
              className={`advanced-toggle ${showAdvanced ? 'active' : ''}`}
              onClick={() => setShowAdvanced(!showAdvanced)}
              aria-label="Toggle advanced filters"
            >
              ⚙️ Filters
            </button>
            <button
              className="reset-btn"
              onClick={handleReset}
              disabled={loading || !hasActiveFilters}
              aria-label="Reset filters"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {showAdvanced && (
        <div className="advanced-filters-panel">
          <div className="advanced-filters-grid">
            {filterOptions.showDateRange && (
              <>
                <div className="filter-group">
                  <label htmlFor="date-from" className="filter-label">From Date</label>
                  <input
                    id="date-from"
                    type="date"
                    className="filter-input"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="filter-group">
                  <label htmlFor="date-to" className="filter-label">To Date</label>
                  <input
                    id="date-to"
                    type="date"
                    className="filter-input"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {filterOptions.customFilters?.map((f) => (
              <div key={f.name} className="filter-group">
                <label htmlFor={`filter-${f.name}`} className="filter-label">{f.label}</label>
                {f.type === 'select' ? (
                  <select
                    id={`filter-${f.name}`}
                    className="filter-select"
                    value={customFilters[f.name]}
                    onChange={(e) => handleCustomFilterChange(f.name, e.target.value)}
                    disabled={loading}
                  >
                    <option value="">All {f.label}</option>
                    {f.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`filter-${f.name}`}
                    type={f.type || 'text'}
                    className="filter-input"
                    placeholder={`Enter ${f.label.toLowerCase()}...`}
                    value={customFilters[f.name]}
                    onChange={(e) => handleCustomFilterChange(f.name, e.target.value)}
                    disabled={loading}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
