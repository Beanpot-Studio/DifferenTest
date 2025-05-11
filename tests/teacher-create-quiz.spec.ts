import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Teacher Quiz Management', () => {
  test('Teacher can create a new quiz from a lesson plan file', async ({ page }) => {
    // Use environment variables for credentials
    const teacherEmail = process.env.TEST_TEACHER_EMAIL;
    const teacherPassword = process.env.TEST_EMAIL_PASSWORD;

    // Ensure credentials are loaded
    if (!teacherEmail || !teacherPassword) {
      throw new Error('Test requires TEST_TEACHER_EMAIL and TEST_EMAIL_PASSWORD environment variables');
    }

    // --- Login Teacher --- 
    await page.goto('/');
    await page.click('button:has-text("Get Started")'); 
    await page.click('[data-testid="switch-to-login-link"]'); // Switch to Login modal
    await page.locator('#email').fill(teacherEmail); 
    await page.locator('#password').fill(teacherPassword); 
    await page.locator('#login-submit-button').click();

    // --- Navigate to Teacher Dashboard ---
    await expect(page.locator('[data-testid="teacher-portal-link"]')).toBeVisible({ timeout: 10000 }); 
    await page.click('[data-testid="teacher-portal-link"]');

    // --- Verify on Dashboard --- 
    await expect(page.locator('h2:has-text("Class Manager")')).toBeVisible({ timeout: 10000 });

    const predictableClassName = 'E2E Shared Class'; // Use the same name as the first test

    // --- Navigate to Quiz Manager ---
    await page.locator('button:has-text("Quizzes")').click();
    await expect(page.locator('h2:has-text("Quiz Manager")')).toBeVisible();

    // --- Initiate Quiz Creation ---
    await page.locator('button:has-text("Create Quiz")').click();

    // --- Fill Create Quiz Modal ---
    const createModal = page.locator('[data-testid="create-quiz-modal"]');
    await expect(createModal).toBeVisible();

    // Select the prerequisite class
    await page.locator('select').selectOption({ label: predictableClassName });

    // Fill in the title
    const uniqueQuizTitle = `E2E Quiz - Mitochondria ${Date.now()}`;
    await page.locator('input[placeholder="Enter quiz title"]').fill(uniqueQuizTitle);

    // Set number of questions
    await page.locator('input[type="number"]').fill('3');

    // Upload the lesson plan file
    const filePath = path.join(__dirname, 'e2e-test-curriculum.txt');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    // Wait for the question generation notification
    const generationNotification = page.locator('[data-testid="notification-success"]');
    await expect(generationNotification).toContainText('Questions generated successfully!');

    // --- Save the Quiz ---
    await page.locator('button:has-text("Save Quiz")').click();

    // --- Verify Success ---
    const successNotification = page.locator('[data-testid="notification-success"]:has-text("Quiz created successfully")');
    await expect(successNotification).toBeVisible({ timeout: 10000 });

    // Verify the modal is closed
    await expect(createModal).not.toBeVisible();

    // Check if the new quiz appears in the list
    const quizListContainer = page.locator('[data-testid="quiz-list-container"]');
    await expect(quizListContainer).toContainText(uniqueQuizTitle);

    // --- Assign Quiz to Class ---
    await page.locator('button:has-text("Classes")').click();
    await expect(page.locator('h2:has-text("Class Manager")')).toBeVisible();

    // Find the container for the specific class
    const classContainer = page.locator('[data-testid="class-list-container"] div.border:has(h3:has-text("E2E Shared Class"))');
    await expect(classContainer).toBeVisible();

    // Check if the quiz title appears in the assigned list
    const assignedQuizList = classContainer.locator('div:has(> h4:has-text("Quizzes")) div.space-y-2'); 
    await expect(assignedQuizList).toBeVisible();
    await expect(assignedQuizList).toContainText(uniqueQuizTitle, { timeout: 10000 });
  });
}); 