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
  },
  loading = false,
}) => {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || '');
  const [dateFrom, setDateFrom] = useState(filters.dateFrom || '');
  const [dateTo, setDateTo] = useState(filters.dateTo || '');

  // Debounce search input
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onFilterChange({
        search,
        status,
        dateFrom,
        dateTo,
      });
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [search, status, dateFrom, dateTo, onFilterChange]);

  const handleReset = () => {
    setSearch('');
    setStatus('');
    setDateFrom('');
    setDateTo('');
    onFilterChange({
      search: '',
      status: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  return (
    <div className="filter-bar">
      <div className="filter-controls">
        {filterOptions.showSearch && (
          <div className="filter-group">
            <label htmlFor="search-input" className="filter-label">
              Search
            </label>
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
        )}

        {filterOptions.showStatus && filterOptions.statusOptions?.length > 0 && (
          <div className="filter-group">
            <label htmlFor="status-filter" className="filter-label">
              Status
            </label>
            <select
              id="status-filter"
              className="filter-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={loading}
            >
              <option value="">All Status</option>
              {filterOptions.statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {filterOptions.showDateRange && (
          <>
            <div className="filter-group">
              <label htmlFor="date-from" className="filter-label">
                From Date
              </label>
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
              <label htmlFor="date-to" className="filter-label">
                To Date
              </label>
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
      </div>

      <button
        className="reset-btn"
        onClick={handleReset}
        disabled={loading || (!search && !status && !dateFrom && !dateTo)}
        aria-label="Reset filters"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default FilterBar;
