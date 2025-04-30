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
    await page.click('[data-testid="login-register-button"]'); // Opens Register modal first

    // Fill Registration Form
    await page.locator('[data-testid="register-name-input"]').fill('E2E Test Teacher');
    await page.locator('#email').fill(teacherEmail); // Uses the same email input id
    await page.locator('#password').fill(teacherPassword); // Uses the same password input id
    await page.locator('[data-testid="role-teacher-radio"]').check();
    await page.locator('[data-testid="register-submit-button"]').click();

    // --- Navigate to Teacher Dashboard ---
    // Wait longer for the link specifically
    await expect(page.locator('[data-testid="teacher-portal-link"]')).toBeVisible({ timeout: 10000 }); 
    await page.click('[data-testid="teacher-portal-link"]');
    
    // --- Verify on Dashboard --- 
    // Wait for navigation to dashboard page
    await expect(page.locator('h2:has-text("Class Manager")')).toBeVisible({ timeout: 10000 });

    // --- Create Class ---
    // Use a predictable name for the second test to find
    const predictableClassName = 'E2E Shared Class'; 
    await page.locator('[data-testid="class-name-input"]').fill(predictableClassName);
    
    // Check the 'public' checkbox (optional step, depends on desired state)
    // await page.locator('[data-testid="class-public-checkbox"]').check();

    // Select a skin (e.g., the second skin option if available)
    await page.locator('[data-testid="class-skin-select"]').selectOption({ index: 1 }); // Selects the second option

    // 3. Submit the form
    await page.locator('[data-testid="create-class-button"]').click();

    // 4. Verify Success
    // Check for success notification (adjust selector/text if needed)
    const successNotification = page.locator('[data-testid="notification-success"]'); // Assumed selector
    await expect(successNotification).toBeVisible();
    await expect(successNotification).toContainText('Class created successfully');

    // Check if the new class appears in the list
    const classListContainer = page.locator('[data-testid="class-list-container"]');
    await expect(classListContainer).toContainText(predictableClassName); // Check for predictable name
  });
}); 