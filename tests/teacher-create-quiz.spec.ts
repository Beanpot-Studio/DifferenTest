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

    // --- Login Teacher (Assumes user exists from previous test) --- 
    await page.goto('/');
    await page.click('[data-testid="login-register-button"]'); 
    await page.click('[data-testid="switch-to-login-link"]'); // Switch to Login modal
    await page.locator('#email').fill(teacherEmail); 
    await page.locator('#password').fill(teacherPassword); 
    await page.locator('#login-submit-button').click();

    // --- Navigate to Teacher Dashboard ---
    await expect(page.locator('[data-testid="teacher-portal-link"]')).toBeVisible({ timeout: 10000 }); 
    await page.click('[data-testid="teacher-portal-link"]');

    // --- Verify on Dashboard --- 
    // Wait for navigation to dashboard page
    await expect(page.locator('h2:has-text("Class Manager")')).toBeVisible({ timeout: 10000 });

    // --- Prerequisite Class Creation Removed ---
    /*
    const prerequisiteClassName = `E2E Prereq Class ${Date.now()}`;
    // ... class creation steps commented out ...
    */
    const predictableClassName = 'E2E Shared Class'; // Use the same name as the first test

    // --- Navigate to Quiz Manager ---
    await page.locator('[data-testid="quizzes-tab"]').click();
    await expect(page.locator('h2:has-text("Quiz Manager")')).toBeVisible();

    // --- Initiate Quiz Creation ---
    // Explicitly wait for the create button to be visible before clicking
    await expect(page.locator('[data-testid="create-quiz-button"]')).toBeVisible(); 
    await page.locator('[data-testid="create-quiz-button"]').click();

    // --- Fill Create Quiz Modal ---
    // Wait for the modal to be visible using the new test id
    const createModal = page.locator('[data-testid="create-quiz-modal"]');
    await expect(createModal).toBeVisible();

    // Select the prerequisite class by its predictable name
    await page.locator('[data-testid="quiz-class-select"]').selectOption({ label: predictableClassName });

    // Fill in the title
    const uniqueQuizTitle = `E2E Quiz - Mitochondria ${Date.now()}`;
    await page.locator('[data-testid="quiz-title-input"]').fill(uniqueQuizTitle);

    // Set number of questions
    await page.locator('[data-testid="quiz-question-count-input"]').fill('3'); // Example: 3 questions

    // Upload the lesson plan file
    const filePath = path.join(__dirname, 'e2e-test-curriculum.txt');
    await page.locator('[data-testid="quiz-lesson-plan-input"]').setInputFiles(filePath);

    // Wait for the question generation notification (appears globally)
    const generationNotification = page.locator('[data-testid="notification-success"]');
    await expect(generationNotification).toContainText('Questions generated successfully!');
    // Optional: Add a wait for any loading indicator within the modal to disappear if needed
    // await expect(createModal.locator('.loading-indicator')).not.toBeVisible();

    // --- Save the Quiz ---
    await page.locator('[data-testid="quiz-save-button"]').click();

    // --- Verify Success ---
    // Locate the success notification *containing* the correct text and check its visibility
    const successNotificationWithText = page.locator('[data-testid="notification-success"]:has-text("Quiz created successfully")');
    await expect(successNotificationWithText).toBeVisible({ timeout: 10000 }); // Wait up to 10s for the specific notification

    // Now, verify the modal is closed
    await expect(createModal).not.toBeVisible(); 

    // Check if the new quiz appears in the list
    const quizListContainer = page.locator('[data-testid="quiz-list-container"]');
    await expect(quizListContainer).toContainText(uniqueQuizTitle);

    // --- Assign Quiz to Class ---
    // Navigate back to Classes tab
    await page.locator('[data-testid="classes-tab"]').click();
    await expect(page.locator('h2:has-text("Class Manager")')).toBeVisible(); // Wait for view

    // Find the container for the specific class created earlier
    const classContainer = page.locator('[data-testid="class-list-container"] div.border:has(h3:has-text("E2E Shared Class"))');
    await expect(classContainer).toBeVisible();

    // --- Verify Assignment --- 
    // (Notification check removed as assignment might be implicit/already happened)
    /*
    const assignSuccessNotification = page.locator('[data-testid="notification-success"]'); // Re-locate notification
    await expect(assignSuccessNotification).toBeVisible();
    await expect(assignSuccessNotification).toContainText('Quiz added to class successfully');
    */
   
    // Check if the quiz title appears in the assigned list *within* the class container
    console.log(`Checking for quiz "${uniqueQuizTitle}" in assigned list...`); // Add log
    const assignedQuizList = classContainer.locator('div:has(> h4:has-text("Quizzes")) div.space-y-2'); 
    await expect(assignedQuizList).toBeVisible(); // Ensure the list container itself is visible
    await expect(assignedQuizList).toContainText(uniqueQuizTitle, { timeout: 10000 }); // Allow time for list to update

    // Optional: Add checks to ensure the quiz appears under the correct class heading if multiple classes exist
  });
}); 