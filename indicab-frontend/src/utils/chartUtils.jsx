/**
 * Chart Configuration Utilities
 * Reusable chart configuration helpers for Recharts
 */

export const chartColors = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#a855f7',
  pink: '#ec4899',
  indigo: '#6366f1',
  cyan: '#06b6d4',
  teal: '#14b8a6',
};

export const getChartConfig = (type) => {
  const baseConfig = {
    margin: { top: 20, right: 30, left: 0, bottom: 20 },
    responsive: true,
    maintainAspectRatio: true,
  };

  const configs = {
    lineChart: {
      ...baseConfig,
      margin: { top: 20, right: 30, left: 0, bottom: 20 },
    },
    areaChart: {
      ...baseConfig,
      margin: { top: 20, right: 30, left: 0, bottom: 20 },
    },
    barChart: {
      ...baseConfig,
      margin: { top: 20, right: 30, left: 60, bottom: 20 },
    },
    pieChart: {
      ...baseConfig,
      margin: { top: 20, right: 20, left: 20, bottom: 20 },
    },
  };

  return configs[type] || baseConfig;
};

export const getGradientId = (name) => `gradient-${name}`;

/**
 * Format chart data for consistent usage
 */
export const formatChartData = (data, format = 'date') => {
  if (!data || !Array.isArray(data)) return [];

  return data.map((item) => ({
    ...item,
    name: item.name || item.label || item.date || '',
    value: item.value || item.count || 0,
  }));
};

/**
 * Truncate long labels for better display
 */
export const truncateLabel = (label, maxLength = 15) => {
  if (!label) return '';
  if (label.length <= maxLength) return label;
  return `${label.substring(0, maxLength)}...`;
};

/**
 * Format numbers for display
 */
export const formatNumber = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

/**
 * Format currency values
 */
export const formatCurrency = (value) => {
  return `₹${value?.toFixed(2) || '0.00'}`;
};

/**
 * Custom tooltip formatter for charts
 */
export const customTooltip = (props) => {
  const { active, payload } = props;

  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{data.payload.name || data.name}</p>
        <p className="tooltip-value" style={{ color: data.color }}>
          {typeof data.value === 'number' ? formatNumber(data.value) : data.value}
        </p>
      </div>
    );
  }

  return null;
};

/**
 * Custom label formatter for pie charts
 */
export const customPieLabel = (entry) => {
  const { name, value, percent } = entry;
  return `${truncateLabel(name)} ${(percent * 100).toFixed(0)}%`;
};

/**
 * Generate date range for analytics
 */
export const generateDateRange = (days = 30) => {
  const dates = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push({
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    });
  }

  return dates;
};

/**
 * Generate mock data for development/preview
 */
export const generateMockBookingsData = (days = 30) => {
  return generateDateRange(days).map((item) => ({
    ...item,
    count: Math.floor(Math.random() * 100) + 20,
    revenue: Math.floor(Math.random() * 50000) + 10000,
  }));
};

export const generateMockDriverData = (count = 10) => {
  const names = ['Raj Kumar', 'Vikas Singh', 'Amit Patel', 'Mohammad Khan', 'Suresh Kumar', 
                 'Pradeep Sharma', 'Arvind Kumar', 'Rohan Desai', 'Ajay Verma', 'Karan Singh'];
  
  return names.slice(0, count).map((name, index) => ({
    id: index + 1,
    name,
    rides: Math.floor(Math.random() * 500) + 50,
    rating: (Math.random() * 2 + 3.5).toFixed(1),
  }));
};

export const generateMockVehicleData = () => {
  return [
    { name: 'Sedan', value: Math.floor(Math.random() * 100) + 20 },
    { name: 'SUV', value: Math.floor(Math.random() * 100) + 30 },
    { name: 'Economy', value: Math.floor(Math.random() * 100) + 40 },
    { name: 'Luxury', value: Math.floor(Math.random() * 100) + 10 },
    { name: 'Premium', value: Math.floor(Math.random() * 100) + 15 },
  ];
};

export const generateMockStatusData = () => {
  return [
    { name: 'Completed', value: Math.floor(Math.random() * 200) + 100 },
    { name: 'Pending', value: Math.floor(Math.random() * 50) + 20 },
    { name: 'Ongoing', value: Math.floor(Math.random() * 30) + 10 },
    { name: 'Cancelled', value: Math.floor(Math.random() * 20) + 5 },
  ];
};

export const generateMockUserGrowthData = (weeks = 12) => {
  return Array.from({ length: weeks }).map((_, i) => ({
    week: `Week ${i + 1}`,
    users: Math.floor(Math.random() * 50) + 20,
    date: new Date(Date.now() - (weeks - i) * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
  }));
};
