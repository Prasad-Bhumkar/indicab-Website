import { test, expect } from '@playwright/test';

test.describe('Admin User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home first to set localStorage
    await page.goto('/');

    // Set mock admin session directly to bypass login form in tests
    await page.evaluate(() => {
      const mockToken = 'dev-admin-token-' + Date.now();
      const mockAdmin = {
        id: 99999,
        name: 'Development Admin',
        email: 'admin@example.com',
        role: 'ADMIN',
        authenticated: true
      };
      localStorage.setItem('token', mockToken);
      localStorage.setItem('userRole', 'ADMIN');
      // We also need to set the state in Redux, but usually app reads from localStorage on mount
      // or we can just navigate to admin and hope the app logic handles it.
    });

    // Navigate to admin dashboard
    await page.goto('/admin');

    // If redirected back to login, it means the bypass didn't work
    if (page.url().includes('login')) {
      await page.fill('input[name="email"]', 'admin@example.com');
      await page.fill('input[name="password"]', 'password');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/admin');
    }
  });

  test('Admin can manage users with sorting and filtering', async ({ page }) => {
    // 1. Navigate to User Management
    await page.click('text=Users');
    await expect(page).toHaveURL(/\/admin\/users/);
    await expect(page.locator('.management-title')).toContainText('User Management');

    // 2. Add a new user with real-time validation check
    await page.click('text=+ Add User');
    
    // Fill partial data and check validation
    const nameInput = page.locator('input[name="name"]');
    await nameInput.fill('J');
    await expect(page.locator('.form-error')).toContainText('Name must be at least 2 characters');
    
    await nameInput.fill('John Doe');
    await expect(page.locator('.form-error')).not.toBeVisible();

    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    await page.selectOption('select[name="status"]', 'active');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify success message
    await expect(page.locator('.alert-success')).toBeVisible();

    // 3. Test Sorting
    const nameHeader = page.locator('th:has-text("Name")');
    await nameHeader.click(); // Sort ASC
    await expect(nameHeader.locator('.sort-icon.up.active')).toBeVisible();
    
    await nameHeader.click(); // Sort DESC
    await expect(nameHeader.locator('.sort-icon.down.active')).toBeVisible();
    
    await nameHeader.click(); // Neutral (if allowed)
    
    // 4. Test Advanced Filtering
    await page.click('text=⚙️ Filters');
    await expect(page.locator('.advanced-filters-panel')).toBeVisible();
    
    // Filter by Role
    await page.selectOption('select[id="filter-role"]', 'admin');
    // (Wait for debounce)
    await page.waitForTimeout(500);
    
    // Search
    await page.fill('input[id="search-input"]', 'John');
    await page.waitForTimeout(500);
    
    // Reset Filters
    await page.click('text=Reset');
    await expect(page.locator('input[id="search-input"]')).toHaveValue('');
    
    // 5. Delete a user
    const firstUserRow = page.locator('.management-table tbody tr').first();
    const deleteBtn = firstUserRow.locator('.btn-delete');
    
    // Handle dialog
    page.on('dialog', dialog => dialog.accept());
    await deleteBtn.click();
    
    // Verify success
    await expect(page.locator('.alert-success')).toBeVisible();
  });

  test('Admin can manage drivers and bookings', async ({ page }) => {
    // Navigate to Driver Management
    await page.click('text=Drivers');
    await expect(page).toHaveURL(/\/admin\/drivers/);
    await expect(page.locator('.management-title')).toContainText('Driver Management');
    
    // Check advanced filters panel
    await page.click('text=⚙️ Filters');
    await expect(page.locator('.advanced-filters-panel')).toBeVisible();
    await expect(page.locator('label:has-text("Rating")')).toBeVisible();

    // Navigate to Booking Management
    await page.click('text=Bookings');
    await expect(page).toHaveURL(/\/admin\/bookings/);
    await expect(page.locator('.management-title')).toContainText('Booking Management');
    
    // Test sorting on Route
    const routeHeader = page.locator('th:has-text("Route")');
    await routeHeader.click();
    await expect(routeHeader.locator('.sort-icon.up.active')).toBeVisible();
  });
});
