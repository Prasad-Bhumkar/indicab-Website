import React, { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import {
  chartColors,
  getChartConfig,
  formatNumber,
  formatCurrency,
  customTooltip,
  customPieLabel,
  generateMockBookingsData,
  generateMockDriverData,
  generateMockVehicleData,
  generateMockStatusData,
  generateMockUserGrowthData,
} from '../../utils/chartUtils';
import './AdminAnalytics.css';

// Memoized stat card component to prevent unnecessary re-renders
const StatCard = React.memo(({ title, value, period }) => (
  <div className="stat-card">
    <h4 className="stat-title">{title}</h4>
    <p className="stat-value">{value}</p>
    <span className="stat-period">{period}</span>
  </div>
));

StatCard.displayName = 'StatCard';

// Memoized chart component with lazy loading
const ChartContainer = React.memo(({ title, children }) => (
  <div className="chart-card">
    <h3 className="chart-title">{title}</h3>
    <Suspense fallback={<div className="chart-loading">Loading chart...</div>}>
      {children}
    </Suspense>
  </div>
));

ChartContainer.displayName = 'ChartContainer';

const AdminAnalytics = () => {
  const dispatch = useDispatch();
  const [dateRange, setDateRange] = useState('30days');
  const [analyticsData, setAnalyticsData] = useState({
    bookings: generateMockBookingsData(30),
    drivers: generateMockDriverData(10),
    vehicles: generateMockVehicleData(),
    status: generateMockStatusData(),
    userGrowth: generateMockUserGrowthData(12),
  });

  const [loading, setLoading] = useState(false);

  // TODO: Replace with actual API calls
  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = useCallback(() => {
    setLoading(true);
    // Simulate API call - in production, this will fetch from backend
    const timer = setTimeout(() => {
      const dayCount = dateRange === '30days' ? 30 : dateRange === '7days' ? 7 : 365;
      const weekCount = dateRange === '30days' ? 4 : dateRange === '7days' ? 1 : 52;

      setAnalyticsData({
        bookings: generateMockBookingsData(dayCount),
        drivers: generateMockDriverData(10),
        vehicles: generateMockVehicleData(),
        status: generateMockStatusData(),
        userGrowth: generateMockUserGrowthData(weekCount),
      });
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [dateRange]);

  // Memoize stats calculation to prevent recalculation on every render
  const stats = useMemo(() => {
    const bookings = analyticsData.bookings || [];
    const totalBookings = bookings.reduce((sum, item) => sum + (item.count || 0), 0);
    const totalRevenue = bookings.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const avgRevenue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    return {
      totalBookings,
      totalRevenue,
      avgRevenue,
    };
  }, [analyticsData.bookings]);

  // Memoize date range change handler
  const handleDateRangeChange = useCallback((e) => {
    setDateRange(e.target.value);
  }, []);

  // Memoize formatted stat values
  const formattedStats = useMemo(() => ({
    totalBookings: stats.totalBookings.toLocaleString(),
    totalRevenue: formatCurrency(stats.totalRevenue),
    avgRevenue: formatCurrency(stats.avgRevenue),
  }), [stats]);

  return (
    <div className="admin-analytics-container">
      <div className="analytics-header">
        <h2>Analytics Dashboard</h2>
        <div className="analytics-controls">
          <select
            className="date-range-select"
            value={dateRange}
            onChange={handleDateRangeChange}
            disabled={loading}
            aria-label="Select date range for analytics"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Bookings"
          value={formattedStats.totalBookings}
          period={`in ${dateRange}`}
        />
        <StatCard
          title="Total Revenue"
          value={formattedStats.totalRevenue}
          period={`in ${dateRange}`}
        />
        <StatCard
          title="Avg. Revenue/Booking"
          value={formattedStats.avgRevenue}
          period="average"
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Bookings Chart */}
        <ChartContainer title="Daily Bookings Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.bookings} isAnimationActive={false}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip content={customTooltip} />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke={chartColors.primary}
                dot={{ fill: chartColors.primary, r: 4 }}
                activeDot={{ r: 6 }}
                name="Bookings"
                strokeWidth={2}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Revenue Chart */}
        <ChartContainer title="Daily Revenue Trend">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.bookings} isAnimationActive={false}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip content={customTooltip} />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={chartColors.success}
                fill={chartColors.success}
                fillOpacity={0.2}
                name="Revenue (₹)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Driver Performance */}
        <ChartContainer title="Top 10 Drivers by Rides">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={analyticsData.drivers}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
              isAnimationActive={false}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="name" width={140} stroke="#6b7280" type="category" />
              <Tooltip content={customTooltip} />
              <Legend />
              <Bar dataKey="rides" fill={chartColors.purple} name="Rides" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Vehicle Distribution */}
        <ChartContainer title="Vehicle Type Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.vehicles}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={customPieLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={false}
              >
                {analyticsData.vehicles.map((entry, index) => (
                  <Cell key={`vehicle-${index}`} fill={Object.values(chartColors)[index % Object.values(chartColors).length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Booking Status Distribution */}
        <ChartContainer title="Booking Status Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.status}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={customPieLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={false}
              >
                {analyticsData.status.map((entry, index) => (
                  <Cell key={`status-${index}`} fill={Object.values(chartColors)[index % Object.values(chartColors).length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* User Growth */}
        <ChartContainer title="User Growth Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.userGrowth} isAnimationActive={false}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip content={customTooltip} />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke={chartColors.info}
                dot={{ fill: chartColors.info, r: 4 }}
                activeDot={{ r: 6 }}
                name="New Users"
                strokeWidth={2}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {loading && (
        <div className="loading-overlay" role="status" aria-live="polite">
          <div className="spinner">Loading analytics...</div>
        </div>
      )}
    </div>
  );
};

export default React.memo(AdminAnalytics);
