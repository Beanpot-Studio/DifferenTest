import { test, expect } from '@playwright/test';

test.describe('Teacher Class Management', () => {
  test('Teacher can create a new class', async ({ page }) => {
    // Use environment variables for credentials
    const teacherEmail = process.env.TEST_TEACHER_EMAIL;
    const teacherPassword = process.env.TEST_EMAIL_PASSWORD;

    // Ensure credentials are loaded
    if (!teacherEmail || !teacherPassword) {
      throw new Error('Test requires TEST_TEACHER_EMAIL and TEST_EMAIL_PASSWORD environment variables');
    }

    // --- Register Teacher --- 
    await page.goto('/');
    
    // Try both ways to click the Get Started button
    try {
      await page.click('button:has-text("Get Started")');
    } catch (e) {
      // If direct click fails, try dispatching the custom event
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('show-register-modal'));
      });
    }

    // Fill Registration Form
    await page.locator('#name').fill('E2E Test Teacher');
    await page.locator('#email').fill(teacherEmail);
    await page.locator('#password').fill(teacherPassword);
    await page.locator('input[type="radio"][value="teacher"]').check();
    await page.locator('button[type="submit"]').click();

    // --- Navigate to Teacher Dashboard ---
    await expect(page.locator('[data-testid="teacher-portal-link"]')).toBeVisible({ timeout: 10000 }); 
    await page.click('[data-testid="teacher-portal-link"]');
    
    // --- Verify on Dashboard --- 
    await expect(page.locator('h2:has-text("Class Manager")')).toBeVisible({ timeout: 10000 });

    // --- Create Class ---
    const predictableClassName = 'E2E Shared Class'; 
    await page.locator('input[placeholder="Enter class name"]').fill(predictableClassName);

    // Submit the form
    await page.locator('button:has-text("Create Class")').click();

    // Wait for loading state to finish
    await expect(page.locator('text=Loading classes...')).not.toBeVisible({ timeout: 10000 });

    // Make sure we're on the active tab
    await page.locator('[data-testid="active-classes-tab"]').click();

    // Wait for the class to appear in the list
    await expect(page.locator('h3:has-text("' + predictableClassName + '")')).toBeVisible({ timeout: 10000 });

    // Optional: Check if the form is reset
    await expect(page.locator('input[placeholder="Enter class name"]')).toHaveValue('');
  });
}); 