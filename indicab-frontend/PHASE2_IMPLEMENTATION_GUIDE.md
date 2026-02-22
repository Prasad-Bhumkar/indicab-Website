# Phase 2: Enhanced Admin Features - Implementation Guide

## ✅ COMPLETED COMPONENTS

### 1. **UserManagement** (FULLY IMPLEMENTED)
All Phase 2 features fully implemented:
- ✅ Pagination with PaginationControls
- ✅ Advanced filtering with FilterBar (search, status)
- ✅ Sortable columns with visual indicators
- ✅ Form validation using Yup (driverValidationSchema)

**File:** `src/features/admin/UserManagement.jsx`

### 2. **Reusable Components Created**
- `src/components/PaginationControls.jsx` - Pagination UI
- `src/components/FilterBar.jsx` - Search & filter bar
- `src/components/SortableHeader.jsx` - Clickable sortable headers
- `src/features/admin/validationSchemas.js` - Yup validation schemas

---

## 🚀 APPLYING TO OTHER PAGES

### Pattern for DriverManagement, BookingManagement, BlogManagement, etc.

#### **Step 1: Import Required Components**
```javascript
import PaginationControls from '../../components/PaginationControls';
import FilterBar from '../../components/FilterBar';
import SortableHeader from '../../components/SortableHeader';
import { [schemaName]ValidationSchema, validateFormData, hasFieldError, getFieldError } from './validationSchemas';
```

#### **Step 2: Add State Variables**
```javascript
const [page, setPage] = useState(0);
const [pageSize, setPageSize] = useState(10);
const [sortColumn, setSortColumn] = useState('[defaultColumn]');
const [sortDirection, setSortDirection] = useState('asc');
const [filters, setFilters] = useState({});
const [validationErrors, setValidationErrors] = useState({});
```

#### **Step 3: Update useEffect to Support Pagination**
```javascript
useEffect(() => {
  const params = {
    page,
    size: pageSize,
    sort: `${sortColumn},${sortDirection}`,
    ...filters,
  };
  dispatch(fetch[Resource](params)); // fetchDrivers, fetchBookings, etc.
}, [dispatch, page, pageSize, sortColumn, sortDirection, filters]);
```

#### **Step 4: Add Handler Functions**
```javascript
const handlePageChange = (newPage) => setPage(newPage);
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
```

#### **Step 5: Add Form Validation to Submit Handlers**
```javascript
const handleAdd[Resource] = async (e) => {
  e.preventDefault();
  setValidationErrors({});
  
  const validation = await validateFormData([schemaName]ValidationSchema, formData);
  if (!validation.isValid) {
    setValidationErrors(validation.errors);
    return;
  }
  
  dispatch(create[Resource](formData));
  setShowAddForm(false);
  resetForm();
};
```

#### **Step 6: Add FilterBar Before Table**
```javascript
<FilterBar
  onFilterChange={handleFilterChange}
  filters={filters}
  filterOptions={{
    showSearch: true,
    showStatus: true,
    statusOptions: [
      { value: 'status1', label: 'Status 1' },
      // ... add specific statuses
    ],
    // showDateRange: true for bookings
  }}
  loading={loading}
/>
```

#### **Step 7: Replace Table Headers with SortableHeader**
```javascript
<thead>
  <tr>
    <th>ID</th>
    <SortableHeader
      column="name"
      label="Name"
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      onSort={handleSort}
      disabled={loading}
    />
    {/* ... other sortable headers */}
  </tr>
</thead>
```

#### **Step 8: Add Form Error Display**
```javascript
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
```

#### **Step 9: Add PaginationControls After Table**
```javascript
<>
  <div className="table-responsive">
    {/* table here */}
  </div>
  <PaginationControls
    currentPage={pagination.[resource].page || page}
    totalPages={pagination.[resource].totalPages || 1}
    totalElements={pagination.[resource].totalElements || [resource].length}
    pageSize={pageSize}
    onPageChange={handlePageChange}
    onPageSizeChange={handlePageSizeChange}
    loading={loading}
  />
</>
```

---

## 📋 REMAINING PAGES TO UPDATE

### DriverManagement
- **Status:** In progress
- **Filters:** search, status (pending, approved, rejected)
- **Sort:** name, status, rating
- **Schema:** `driverValidationSchema`

### BookingManagement  
- **Status:** Not started
- **Filters:** search, status (pending, completed, cancelled, ongoing), dateFrom, dateTo
- **Sort:** date, status, userId
- **Schema:** `bookingValidationSchema`

### BlogManagement
- **Status:** Not started
- **Filters:** search, status (published, draft)
- **Sort:** date, title, views
- **Schema:** `blogValidationSchema`

### PackageManagement
- **Status:** Not started
- **Filters:** search, type (hourly, regional, national, corporate)
- **Sort:** name, baseFare, type
- **Schema:** `packageValidationSchema`

### VehicleManagement
- **Status:** Not started
- **Filters:** search, type
- **Sort:** type, baseFare, ratePerKm, capacity
- **Schema:** `vehicleValidationSchema`

---

## 🔧 VALIDATION SCHEMAS AVAILABLE

All schemas are in `src/features/admin/validationSchemas.js`:

- `userValidationSchema` ✅
- `driverValidationSchema` ✅
- `blogValidationSchema` ✅
- `packageValidationSchema` ✅
- `vehicleValidationSchema` ✅
- `bookingValidationSchema` ✅

Helper functions:
- `validateFormData(schema, data)` - Async validation
- `hasFieldError(errors, fieldName)` - Check if field has error
- `getFieldError(errors, fieldName)` - Get error message

---

## 📱 RESPONSIVE DESIGN

All components have responsive CSS:
- PaginationControls - Stacks on mobile
- FilterBar - Stacks on mobile
- SortableHeader - Adjusts font size on mobile
- Tables - Horizontal scroll on mobile

---

## 🎯 NEXT STEPS

1. **Apply pattern to remaining 4 pages**
   - Follow the 9-step pattern above
   - Copy from UserManagement and adapt

2. **Backend Implementation**
   - Add Spring Data `Pageable` to endpoints
   - Return paginated response: `{ content, totalPages, totalElements, currentPage, size }`

3. **Testing**
   - Test pagination (previous, next, page size)
   - Test filtering (search, status, date range)
   - Test sorting (click headers)
   - Test form validation (required fields, format)

---

## 💾 CSS STYLES

### Validation Error Styles (added to ManagementPages.css)
```css
.is-invalid {
  border-color: #ef4444 !important;
  background-color: #fef2f2;
}

.form-error {
  display: block;
  color: #dc2626;
  font-size: 0.8125rem;
  margin-top: 0.25rem;
  font-weight: 500;
}
```

---

## 🚀 QUICK REFERENCE

**Copy from UserManagement to apply to other pages:**
1. Import statements (section 1)
2. State declarations (section 2)
3. useEffect with params (section 3)
4. Handler functions (section 4)
5. FilterBar JSX (section 6)
6. Form field validation (section 8)
7. SortableHeader in table (section 7)
8. PaginationControls wrapper (section 9)

**Adapt:**
1. Change `[resource]` names (Users → Drivers, Bookings, etc.)
2. Change filter options per resource
3. Change sort columns per resource
4. Change validation schema
5. Change pagination state key (pagination.users → pagination.drivers)

---

**Last Updated:** February 18, 2026
**Phase 2 Progress:** 33% Complete (UserManagement done, 5 pages remaining)
