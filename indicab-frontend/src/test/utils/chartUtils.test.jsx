import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';

import {
  chartColors,
  getChartConfig,
  getGradientId,
  formatChartData,
  truncateLabel,
  formatNumber,
  formatCurrency,
  customTooltip,
  customPieLabel,
  generateDateRange,
  generateMockBookingsData,
  generateMockDriverData,
  generateMockVehicleData,
  generateMockStatusData,
  generateMockUserGrowthData,
} from '../../utils/chartUtils';

describe('chartColors', () => {
  const expectedKeys = [
    'primary', 'success', 'warning', 'danger', 'info',
    'purple', 'pink', 'indigo', 'cyan', 'teal',
  ];

  it('should have all expected color keys', () => {
    expectedKeys.forEach((key) => {
      expect(chartColors).toHaveProperty(key);
    });
  });

  it('should contain valid 6-digit hex color values', () => {
    Object.values(chartColors).forEach((color) => {
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
    });
  });

  it('should have exactly the expected number of colors', () => {
    expect(Object.keys(chartColors)).toHaveLength(expectedKeys.length);
  });
});

describe('getChartConfig', () => {
  it('should return lineChart config with correct margin', () => {
    const config = getChartConfig('lineChart');
    expect(config).toEqual({
      margin: { top: 20, right: 30, left: 0, bottom: 20 },
      responsive: true,
      maintainAspectRatio: true,
    });
  });

  it('should return areaChart config', () => {
    const config = getChartConfig('areaChart');
    expect(config.responsive).toBe(true);
    expect(config.maintainAspectRatio).toBe(true);
  });

  it('should return barChart config with left margin of 60', () => {
    const config = getChartConfig('barChart');
    expect(config.margin.left).toBe(60);
  });

  it('should return pieChart config', () => {
    const config = getChartConfig('pieChart');
    expect(config.margin.left).toBe(20);
    expect(config.margin.right).toBe(20);
  });

  it('should return baseConfig fallback for unknown type', () => {
    const config = getChartConfig('unknownType');
    expect(config.responsive).toBe(true);
    expect(config.margin.left).toBe(0);
    expect(config.margin.right).toBe(30);
  });

  it('should return baseConfig when type is missing', () => {
    const config = getChartConfig(undefined);
    expect(config.responsive).toBe(true);
  });
});

describe('getGradientId', () => {
  it('should prefix name with gradient-', () => {
    expect(getGradientId('primary')).toBe('gradient-primary');
    expect(getGradientId('blue')).toBe('gradient-blue');
  });

  it('should handle empty string', () => {
    expect(getGradientId('')).toBe('gradient-');
  });
});

describe('formatChartData', () => {
  it('should return empty array for null, undefined, or non-array', () => {
    expect(formatChartData(null)).toEqual([]);
    expect(formatChartData(undefined)).toEqual([]);
    expect(formatChartData('string')).toEqual([]);
    expect(formatChartData(123)).toEqual([]);
    expect(formatChartData({})).toEqual([]);
  });

  it('should return empty array for empty input array', () => {
    expect(formatChartData([])).toEqual([]);
  });

  it('should format data reading name from name, label, or date fields', () => {
    const data = [
      { name: 'Alpha', value: 10 },
      { label: 'Beta', count: 20 },
      { date: '2024-01-01', value: 30 },
    ];
    const result = formatChartData(data);
    expect(result[0].name).toBe('Alpha');
    expect(result[0].value).toBe(10);
    expect(result[1].name).toBe('Beta');
    expect(result[1].value).toBe(20);
    expect(result[2].name).toBe('2024-01-01');
    expect(result[2].value).toBe(30);
  });

  it('should default to empty name and 0 value when fields missing', () => {
    const result = formatChartData([{ unrelated: 'data' }]);
    expect(result[0].name).toBe('');
    expect(result[0].value).toBe(0);
  });

  it('should preserve extra properties on the item', () => {
    const data = [{ name: 'Test', value: 5, extra: true }];
    const result = formatChartData(data);
    expect(result[0]).toHaveProperty('extra', true);
  });
});

describe('truncateLabel', () => {
  it('should return empty string for falsy input', () => {
    expect(truncateLabel(null)).toBe('');
    expect(truncateLabel(undefined)).toBe('');
    expect(truncateLabel('')).toBe('');
  });

  it('should return label unchanged when shorter than maxLength', () => {
    expect(truncateLabel('Hi', 10)).toBe('Hi');
    expect(truncateLabel('Hello', 5)).toBe('Hello');
  });

  it('should use custom maxLength when provided', () => {
    const long = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    expect(truncateLabel(long, 10)).toBe('ABCDEFGHIJ...');
    expect(truncateLabel(long, 20)).toBe('ABCDEFGHIJKLMNOPQRST...');
  });

  it('should use default maxLength of 15', () => {
    const long = '12345678901234567890';
    expect(truncateLabel(long)).toBe('123456789012345...');
  });

  it('should not truncate when length exactly equals maxLength', () => {
    expect(truncateLabel('Exactly 15!!!', 15)).toBe('Exactly 15!!!');
  });
});

describe('formatNumber', () => {
  it('should return string representation for values under 1000', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(500)).toBe('500');
    expect(formatNumber(999)).toBe('999');
  });

  it('should format thousands with K suffix', () => {
    expect(formatNumber(1000)).toBe('1.0K');
    expect(formatNumber(2500)).toBe('2.5K');
    expect(formatNumber(100000)).toBe('100.0K');
  });

  it('should format millions with M suffix', () => {
    expect(formatNumber(1000000)).toBe('1.0M');
    expect(formatNumber(1500000)).toBe('1.5M');
    expect(formatNumber(10000000)).toBe('10.0M');
  });
});

describe('formatCurrency', () => {
  it('should prefix with rupee symbol and show 2 decimals', () => {
    expect(formatCurrency(100)).toBe('₹100.00');
    expect(formatCurrency(99.5)).toBe('₹99.50');
  });

  it('should return ₹0.00 for null or undefined', () => {
    expect(formatCurrency(null)).toBe('₹0.00');
    expect(formatCurrency(undefined)).toBe('₹0.00');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('₹0.00');
  });
});

describe('customTooltip', () => {
  it('should return null when not active', () => {
    expect(customTooltip({ active: false, payload: [{ value: 10 }] })).toBeNull();
  });

  it('should return null when payload is empty', () => {
    expect(customTooltip({ active: true, payload: [] })).toBeNull();
  });

  it('should return null when payload is missing', () => {
    expect(customTooltip({ active: true })).toBeNull();
  });

  it('should render tooltip structure when active with payload', () => {
    const props = {
      active: true,
      payload: [{
        name: 'Revenue',
        value: 2500,
        color: '#ff0000',
        payload: { name: 'Revenue' },
      }],
    };
    const { container } = render(customTooltip(props));
    expect(container.querySelector('.custom-tooltip')).toBeTruthy();
    expect(container.querySelector('.tooltip-label')).toBeTruthy();
    expect(container.querySelector('.tooltip-value')).toBeTruthy();
    expect(container.querySelector('.tooltip-value').textContent).toBe('2.5K');
  });

  it('should display string values directly', () => {
    const props = {
      active: true,
      payload: [{
        name: 'Label',
        value: 'N/A',
        color: '#00ff00',
        payload: { name: 'Label' },
      }],
    };
    const { container } = render(customTooltip(props));
    expect(container.querySelector('.tooltip-value').textContent).toBe('N/A');
  });
});

describe('customPieLabel', () => {
  it('should format entry with truncated name and percentage', () => {
    expect(customPieLabel({ name: 'Sedan', value: 50, percent: 0.25 })).toBe('Sedan 25%');
  });

  it('should truncate long names', () => {
    const longName = 'Luxury Sports Utility Vehicle';
    expect(customPieLabel({ name: longName, value: 30, percent: 0.5 })).toBe('Luxury Sports U... 50%');
  });

  it('should handle 0 percent', () => {
    expect(customPieLabel({ name: 'Test', value: 0, percent: 0 })).toBe('Test 0%');
  });
});

describe('generateDateRange', () => {
  it('should return array of specified length', () => {
    expect(generateDateRange(7)).toHaveLength(7);
    expect(generateDateRange(1)).toHaveLength(1);
    expect(generateDateRange(365)).toHaveLength(365);
  });

  it('should default to 30 days', () => {
    expect(generateDateRange()).toHaveLength(30);
  });

  it('should return items with date and label', () => {
    const result = generateDateRange(2);
    expect(result[0]).toHaveProperty('date');
    expect(result[0]).toHaveProperty('label');
    expect(result[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should return dates in chronological order', () => {
    const result = generateDateRange(5);
    for (let i = 1; i < result.length; i++) {
      expect(new Date(result[i].date) >= new Date(result[i - 1].date)).toBe(true);
    }
  });
});

describe('generateMockBookingsData', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return array of specified length', () => {
    expect(generateMockBookingsData(5)).toHaveLength(5);
  });

  it('should default to 30 days', () => {
    expect(generateMockBookingsData()).toHaveLength(30);
  });

  it('should include count, revenue, date, and label on each item', () => {
    const data = generateMockBookingsData(1);
    expect(data[0]).toHaveProperty('count');
    expect(data[0]).toHaveProperty('revenue');
    expect(data[0]).toHaveProperty('date');
    expect(data[0]).toHaveProperty('label');
  });
});

describe('generateMockDriverData', () => {
  let randomSpy;

  beforeEach(() => {
    randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  it('should return specified count', () => {
    expect(generateMockDriverData(3)).toHaveLength(3);
  });

  it('should default to 10 drivers', () => {
    expect(generateMockDriverData()).toHaveLength(10);
  });

  it('should have id, name, rides, and rating fields', () => {
    const data = generateMockDriverData(1);
    expect(data[0]).toHaveProperty('id', 1);
    expect(data[0]).toHaveProperty('name');
    expect(data[0]).toHaveProperty('rides');
    expect(data[0]).toHaveProperty('rating');
  });
});

describe('generateMockVehicleData', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return exactly 5 vehicle types', () => {
    expect(generateMockVehicleData()).toHaveLength(5);
  });

  it('should have name and value on each entry', () => {
    generateMockVehicleData().forEach((item) => {
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('value');
      expect(typeof item.value).toBe('number');
    });
  });

  it('should contain Sedan, SUV, Economy, Luxury, Premium', () => {
    const names = generateMockVehicleData().map((i) => i.name);
    expect(names).toEqual(['Sedan', 'SUV', 'Economy', 'Luxury', 'Premium']);
  });
});

describe('generateMockStatusData', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return exactly 4 status entries', () => {
    expect(generateMockStatusData()).toHaveLength(4);
  });

  it('should have name and value on each entry', () => {
    generateMockStatusData().forEach((item) => {
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('value');
    });
  });

  it('should include all status types', () => {
    const names = generateMockStatusData().map((i) => i.name);
    expect(names).toContain('Completed');
    expect(names).toContain('Pending');
    expect(names).toContain('Ongoing');
    expect(names).toContain('Cancelled');
  });
});

describe('generateMockUserGrowthData', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return specified number of weeks', () => {
    expect(generateMockUserGrowthData(4)).toHaveLength(4);
  });

  it('should default to 12 weeks', () => {
    expect(generateMockUserGrowthData()).toHaveLength(12);
  });

  it('should have week, users, and date fields', () => {
    const data = generateMockUserGrowthData(1);
    expect(data[0]).toHaveProperty('week');
    expect(data[0]).toHaveProperty('users');
    expect(data[0]).toHaveProperty('date');
  });
});
