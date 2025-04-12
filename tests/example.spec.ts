import { test, expect } from '@playwright/test';
require('dotenv').config()

test('has title', async ({ page }) => {
  //todo use env variable to get the url
  await page.goto(process.env.TEST_URL);

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/DifferenTest/);
});

test('click on the login button', async ({ page }) => {
  await page.goto(process.env.TEST_URL);
  // await page.getByRole('button', { name: 'Login' }).click();
  await page.locator('#login-button').click();
  //open modal
  await page.locator('#login-modal').click();
  //fill in email from env variable
  await page.locator('#email').fill(process.env.TEST_EMAIL);
  //fill in password: 123456
  await page.locator('#password').fill(process.env.TEST_PASSWORD);
  //click on the login button
  await page.locator('#login-submit-button').click();
  //expect to see the teacher portal
  await expect(page.locator('#teacher-portal')).toBeVisible();
});




