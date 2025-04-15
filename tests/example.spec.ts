import { test, expect } from '@playwright/test';
require('dotenv').config()

// check login routine
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

//check register routine
/*teacher flow
1. once logged in, check stats numbers.
2. goto message box, check messages. read one, send one, clear notifications.
3. upload a sample class via .md file. edit the lesson plan.
4. generate a sample quiz. edit a field and save.


/*student flow
1. once logged in, check stats numbers. 
2. goto message box, check messages. read one, send one, clear notifications.
3. search for a sample class and join it.
4. find a quiz and take one. get an answer wrong. 
5. retake quiz, get 100%, badge up
6. check report.

/* teacher verification flow
1. check roster that student joined successfully
2. check report







