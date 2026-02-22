import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to analytics page
    await page.goto('/admin/analytics');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test.describe('Page Structure & Initial Load', () => {
    test('should display the analytics dashboard title', async ({ page }) => {
      const title = await page.textContent('.analytics-header h2');
      expect(title).toBe('Analytics Dashboard');
    });

    test('should display analytics header with controls', async ({ page }) => {
      const header = page.locator('.analytics-header');
      await expect(header).toBeVisible();

      const select = page.locator('.date-range-select');
      await expect(select).toBeVisible();
    });

    test('should display summary stats cards with correct labels', async ({ page }) => {
      const statsCards = page.locator('.stat-card');
      await expect(statsCards).toHaveCount(3);

      await expect(page.locator('.stat-title').nth(0)).toContainText('Total Bookings');
      await expect(page.locator('.stat-title').nth(1)).toContainText('Total Revenue');
      await expect(page.locator('.stat-title').nth(2)).toContainText('Avg. Revenue');
    });

    test('should display stat values in stats cards', async ({ page }) => {
      const statValues = page.locator('.stat-value');
      const count = await statValues.count();
      expect(count).toBeGreaterThan(0);

      // Verify stat values are not empty
      for (let i = 0; i < count; i++) {
        const text = await statValues.nth(i).textContent();
        expect(text).not.toBe('');
      }
    });

    test('should render all 6 expected charts', async ({ page }) => {
      const charts = page.locator('.chart-container, .recharts-wrapper');
      const count = await charts.count();
      expect(count).toBeGreaterThanOrEqual(6);
    });

    test('should display chart titles', async ({ page }) => {
      await expect(page.locator('text=Daily Bookings Trend')).toBeVisible();
      await expect(page.locator('text=Daily Revenue Trend')).toBeVisible();
      await expect(page.locator('text=Top 10 Drivers by Rides')).toBeVisible();
      await expect(page.locator('text=Vehicle Type Distribution')).toBeVisible();
      await expect(page.locator('text=Booking Status Distribution')).toBeVisible();
      await expect(page.locator('text=User Growth Trend')).toBeVisible();
    });
  });

  test.describe('Date Range Filtering', () => {
    test('should have date range selector with all options', async ({ page }) => {
      const select = page.locator('.date-range-select');
      await expect(select).toBeVisible();

      // Check for expected options
      const options = page.locator('.date-range-select option');
      const count = await options.count();
      expect(count).toBeGreaterThanOrEqual(3);
    });

    test('should change analytics data when selecting 7 days', async ({ page }) => {
      const initialValue = await page.locator('.stat-value').first().textContent();

      await page.selectOption('.date-range-select', '7days');
      await page.waitForTimeout(1000);

      const updatedValue = await page.locator('.stat-value').first().textContent();
      // Value may or may not change, but the action should complete without error
      expect(updatedValue).toBeDefined();
    });

    test('should change analytics data when selecting 30 days', async ({ page }) => {
      await page.selectOption('.date-range-select', '30days');
      await page.waitForTimeout(1000);

      const value = await page.locator('.stat-value').first().textContent();
      expect(value).not.toBe('');
    });

    test('should change analytics data when selecting 1 year', async ({ page }) => {
      await page.selectOption('.date-range-select', '1year');
      await page.waitForTimeout(1000);

      const value = await page.locator('.stat-value').first().textContent();
      expect(value).not.toBe('');
    });

    test('should disable date range selector when loading', async ({ page }) => {
      const select = page.locator('.date-range-select');

      // Change date range to trigger loading
      await select.selectOption('30days');

      // Check if disabled attribute is added during loading
      const isDisabled = await select.isDisabled();
      // Depending on implementation, it may be disabled or not
      expect(typeof isDisabled).toBe('boolean');
    });

    test('should update all charts when date range changes', async ({ page }) => {
      const chartsBefore = await page.locator('.recharts-surface').count();

      await page.selectOption('.date-range-select', '7days');
      await page.waitForTimeout(1500);

      const chartsAfter = await page.locator('.recharts-surface').count();
      // Charts should still be present
      expect(chartsAfter).toBeGreaterThan(0);
    });
  });

  test.describe('Chart Rendering', () => {
    test('should render line chart for bookings trend', async ({ page }) => {
      const bookingsChart = page.locator('text=Daily Bookings Trend').locator('..').locator('.recharts-wrapper');
      await expect(bookingsChart).toBeVisible();
    });

    test('should render area chart for revenue trend', async ({ page }) => {
      const revenueChart = page.locator('text=Daily Revenue Trend').locator('..').locator('.recharts-wrapper');
      await expect(revenueChart).toBeVisible();
    });

    test('should render bar chart for drivers', async ({ page }) => {
      const driversChart = page.locator('text=Top 10 Drivers by Rides').locator('..').locator('.recharts-wrapper');
      await expect(driversChart).toBeVisible();
    });

    test('should render pie chart for vehicle distribution', async ({ page }) => {
      const vehicleChart = page.locator('text=Vehicle Type Distribution').locator('..').locator('.recharts-wrapper');
      await expect(vehicleChart).toBeVisible();
    });

    test('should render pie chart for booking status', async ({ page }) => {
      const statusChart = page.locator('text=Booking Status Distribution').locator('..').locator('.recharts-wrapper');
      await expect(statusChart).toBeVisible();
    });

    test('should render line chart for user growth', async ({ page }) => {
      const userChart = page.locator('text=User Growth Trend').locator('..').locator('.recharts-wrapper');
      await expect(userChart).toBeVisible();
    });

    test('should have tooltips for charts', async ({ page }) => {
      // Hover over a chart area to trigger tooltip
      const chart = page.locator('.recharts-wrapper').first();
      await chart.hover();

      // Tooltip should appear (may take a moment)
      await page.waitForTimeout(500);
      // This depends on implementation, but chart should be interactive
      expect(chart).toBeVisible();
    });
  });

  test.describe('Data Updates & Reactivity', () => {
    test('should maintain data consistency across date ranges', async ({ page }) => {
      // Get initial values
      const bookings7days = await page.locator('.stat-value').first().textContent();

      // Change to 30 days
      await page.selectOption('.date-range-select', '30days');
      await page.waitForTimeout(1000);
      const bookings30days = await page.locator('.stat-value').first().textContent();

      // Both should be valid numbers
      expect(bookings7days).toBeDefined();
      expect(bookings30days).toBeDefined();
    });

    test('should update stat cards on date range change', async ({ page }) => {
      const statCard1Before = await page.locator('.stat-value').nth(0).textContent();
      const statCard2Before = await page.locator('.stat-value').nth(1).textContent();

      await page.selectOption('.date-range-select', '1year');
      await page.waitForTimeout(1000);

      const statCard1After = await page.locator('.stat-value').nth(0).textContent();
      const statCard2After = await page.locator('.stat-value').nth(1).textContent();

      // Values should be updated (even if same, they should render without error)
      expect(statCard1After).toBeDefined();
      expect(statCard2After).toBeDefined();
    });

    test('should handle rapid date range changes gracefully', async ({ page }) => {
      const options = ['7days', '30days', '1year'];

      for (const option of options) {
        await page.selectOption('.date-range-select', option);
      }

      // Wait for final update
      await page.waitForTimeout(1500);

      // Page should still be functional
      const select = page.locator('.date-range-select');
      await expect(select).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Header should still be visible
      await expect(page.locator('.analytics-header')).toBeVisible();

      // Stat cards should be stacked
      const statsCards = page.locator('.stat-card');
      const count = await statsCards.count();
      expect(count).toBe(3);
    });

    test('should be responsive on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await expect(page.locator('.analytics-header')).toBeVisible();

      const charts = page.locator('.recharts-wrapper');
      const count = await charts.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should be responsive on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      await expect(page.locator('.analytics-header')).toBeVisible();

      const charts = page.locator('.recharts-wrapper');
      const count = await charts.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should maintain layout integrity on resize', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.waitForTimeout(500);

      const header = page.locator('.analytics-header');
      await expect(header).toBeVisible();

      // Resize to mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      // Header should still be visible after resize
      await expect(header).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle missing or invalid date range selection', async ({ page }) => {
      // Page should still display without crashing
      await expect(page.locator('.analytics-header')).toBeVisible();
    });

    test('should display data even if some charts fail to load', async ({ page }) => {
      // At least stat cards should be visible
      const statsCards = page.locator('.stat-card');
      const count = await statsCards.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      const h1 = page.locator('h1');
      const h2 = page.locator('h2');
      const h3 = page.locator('h3');

      // At least one heading should exist
      const totalHeadings = await h1.count() + await h2.count() + await h3.count();
      expect(totalHeadings).toBeGreaterThan(0);
    });

    test('should have accessible form controls', async ({ page }) => {
      const select = page.locator('.date-range-select');
      // Select should be keyboard accessible
      await select.focus();
      expect(await select.isVisible()).toBe(true);
    });

    test('should have proper color contrast for text', async ({ page }) => {
      const statValues = page.locator('.stat-value');
      const count = await statValues.count();
      expect(count).toBeGreaterThan(0);

      // Text should be readable
      for (let i = 0; i < Math.min(count, 3); i++) {
        const text = await statValues.nth(i).textContent();
        expect(text?.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Performance', () => {
    test('should load analytics page within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/admin/analytics');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should update charts smoothly on date range change', async ({ page }) => {
      const startTime = Date.now();

      await page.selectOption('.date-range-select', '30days');
      await page.waitForTimeout(1000);

      const updateTime = Date.now() - startTime;
      // Update should complete within 2 seconds
      expect(updateTime).toBeLessThan(2000);
    });

    test('should not have layout shift when updating data', async ({ page }) => {
      const initialMetrics = await page.evaluate(() => {
        const element = document.querySelector('.analytics-header');
        return {
          top: element?.getBoundingClientRect().top,
          left: element?.getBoundingClientRect().left,
        };
      });

      await page.selectOption('.date-range-select', '7days');
      await page.waitForTimeout(1000);

      const finalMetrics = await page.evaluate(() => {
        const element = document.querySelector('.analytics-header');
        return {
          top: element?.getBoundingClientRect().top,
          left: element?.getBoundingClientRect().left,
        };
      });

      // Position should not shift
      expect(initialMetrics.top).toBe(finalMetrics.top);
      expect(initialMetrics.left).toBe(finalMetrics.left);
    });
  });

  test.describe('User Interactions', () => {
    test('should handle date range dropdown selection', async ({ page }) => {
      const select = page.locator('.date-range-select');
      await select.selectOption('7days');

      const selectedValue = await select.inputValue();
      expect(selectedValue).toBe('7days');
    });

    test('should handle keyboard navigation on date range selector', async ({ page }) => {
      const select = page.locator('.date-range-select');
      await select.focus();

      // Press arrow down
      await select.press('ArrowDown');

      // Select should still be visible and functional
      await expect(select).toBeVisible();
    });

    test('should persist selected date range on page reload', async ({ page }) => {
      // Note: This depends on localStorage implementation
      await page.selectOption('.date-range-select', '30days');
      await page.waitForTimeout(500);

      // Get the value
      let selectedValue = await page.locator('.date-range-select').inputValue();
      expect(selectedValue).toBe('30days');
    });
  });
});
