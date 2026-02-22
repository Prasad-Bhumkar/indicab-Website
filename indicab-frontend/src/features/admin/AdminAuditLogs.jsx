import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuditLogs, fetchAuditLogStatistics, addRealTimeAuditLog } from './adminSlice';
import { adminWebsocketService } from '../../services/adminWebsocketService';
import PaginationControls from '../../components/PaginationControls';
import FilterBar from '../../components/FilterBar';
import SortableHeader from '../../components/SortableHeader';
import { SkeletonTable } from '../../components/Skeleton';
import './ManagementPages.css';

const AdminAuditLogs = () => {
  const dispatch = useDispatch();
  const { auditLogs, loading, error, auditLogStatistics, pagination } = useSelector((state) => state.admin);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const params = {
      page,
      size: pageSize,
      sort: `${sortColumn},${sortDirection}`,
      ...filters,
    };
    dispatch(fetchAuditLogs(params));
    dispatch(fetchAuditLogStatistics());

    // Connect and subscribe to real-time audit logs
    adminWebsocketService.connect().then(() => {
      const unsubAuditLogs = adminWebsocketService.subscribeTopic('/topic/admin/audit-logs', 'auditLogUpdates', (data) => {
        dispatch(addRealTimeAuditLog(data));
      });

      return () => unsubAuditLogs();
    });

    return () => {
      adminWebsocketService.disconnect();
    };
  }, [dispatch, page, pageSize, sortColumn, sortDirection, filters]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(0);
  };

  const getOperationBadgeClass = (operation) => {
    switch (operation) {
      case 'CREATE':
        return 'badge-success';
      case 'UPDATE':
        return 'badge-info';
      case 'DELETE':
        return 'badge-danger';
      case 'READ':
        return 'badge-secondary';
      case 'BULK_OPERATION':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  const getStatusBadgeClass = (status) => {
    return status === 'SUCCESS' ? 'badge-success' : 'badge-danger';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const filterOptions = {
    operation: {
      label: 'Operation',
      options: ['CREATE', 'UPDATE', 'DELETE', 'READ', 'BULK_OPERATION'],
    },
    status: {
      label: 'Status',
      options: ['SUCCESS', 'FAILED'],
    },
    resourceType: {
      label: 'Resource Type',
      options: ['USERS', 'DRIVERS', 'BOOKINGS', 'BLOGS', 'PACKAGES', 'VEHICLES', 'AUDIT_LOG'],
    },
  };

  if (loading) {
    return <SkeletonTable />;
  }

  return (
    <div className="management-container">
      <div className="management-header">
        <h2>Audit Logs</h2>
        <div className="header-actions">
          {auditLogStatistics && (
            <div className="audit-stats">
              <span className="stat-label">Statistics:</span>
              <span className="stat-text">{auditLogStatistics.statistics}</span>
            </div>
          )}
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
        showDateRange={false}
      />

      <div className="table-responsive">
        <table className="management-table">
          <thead>
            <tr>
              <th style={{ width: '10%' }}>
                <SortableHeader
                  column="id"
                  currentColumn={sortColumn}
                  direction={sortDirection}
                  onSort={handleSort}
                  label="ID"
                />
              </th>
              <th style={{ width: '12%' }}>
                <SortableHeader
                  column="operation"
                  currentColumn={sortColumn}
                  direction={sortDirection}
                  onSort={handleSort}
                  label="Operation"
                />
              </th>
              <th style={{ width: '15%' }}>
                <SortableHeader
                  column="resourceType"
                  currentColumn={sortColumn}
                  direction={sortDirection}
                  onSort={handleSort}
                  label="Resource"
                />
              </th>
              <th style={{ width: '10%' }}>Resource ID</th>
              <th style={{ width: '10%' }}>User ID</th>
              <th style={{ width: '12%' }}>
                <SortableHeader
                  column="status"
                  currentColumn={sortColumn}
                  direction={sortDirection}
                  onSort={handleSort}
                  label="Status"
                />
              </th>
              <th style={{ width: '15%' }}>
                <SortableHeader
                  column="createdAt"
                  currentColumn={sortColumn}
                  direction={sortDirection}
                  onSort={handleSort}
                  label="Timestamp"
                />
              </th>
              <th style={{ width: '16%' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs && auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>
                    <span className={`badge ${getOperationBadgeClass(log.operation)}`}>
                      {log.operation}
                    </span>
                  </td>
                  <td>{log.resourceType}</td>
                  <td>{log.resourceId || '-'}</td>
                  <td>{log.userId}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="timestamp">{formatDate(log.createdAt)}</td>
                  <td className="details-cell">
                    <div className="details-content">
                      {log.details && <p className="detail-item">{log.details}</p>}
                      {log.ipAddress && <p className="detail-item">IP: {log.ipAddress}</p>}
                      {log.failureReason && (
                        <p className="detail-item error-reason">Reason: {log.failureReason}</p>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">No audit logs found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination.auditLogs && (
        <PaginationControls
          currentPage={pagination.auditLogs.page}
          totalPages={pagination.auditLogs.totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(0);
          }}
        />
      )}
    </div>
  );
};

export default AdminAuditLogs;
