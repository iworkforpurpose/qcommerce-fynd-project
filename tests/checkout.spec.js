const { expect, test } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('0 items added', { exact: true })).toBeVisible();
});

test('a valid checkout shows one payment confirmation with an order ID', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Protein', exact: true }).click();
  await page.getByRole('link', { name: 'Go to Cart' }).click();
  await page.getByRole('button', { name: 'Go to Checkout' }).click();
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Asha Rao');
  await page.getByRole('button', { name: 'Confirm Payment' }).click();

  await expect(page.getByRole('heading', { name: 'Payment confirmed' })).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Payment confirmed' })).toBeVisible();
  await expect(page.getByText(/^Order ID: ORD-[0-9A-F-]+$/)).toBeVisible();
});

test('a whitespace-only name blocks checkout and preserves the entered data', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Creatine', exact: true }).click();
  await page.getByRole('link', { name: 'Go to Cart' }).click();
  await page.getByRole('button', { name: 'Go to Checkout' }).click();
  const name = page.getByRole('textbox', { name: 'Name', exact: true });
  await name.fill('   ');
  await page.getByRole('button', { name: 'Confirm Payment' }).click();

  await expect(page.getByRole('alert')).toHaveText('Please enter your name to continue.');
  await expect(name).toHaveValue('   ');
  await expect(page.getByRole('group', { name: 'Creatine', exact: true })).toBeVisible();
  await expect(page.getByRole('status', { name: 'Order total' })).toHaveText('₹999');
  await expect(page.getByRole('heading', { name: 'Payment confirmed' })).toHaveCount(0);
});

test('quantity changes update the exact line and order totals across all views', async ({ page }) => {
  const total = page.getByRole('status', { name: 'Order total' });
  await page.getByRole('button', { name: 'Add Protein', exact: true }).dblclick();
  const addCreatine = page.getByRole('button', { name: 'Add Creatine', exact: true });
  await addCreatine.dblclick();
  await addCreatine.dblclick();
  await addCreatine.click();
  await expect(page.getByText('7 items added', { exact: true })).toBeVisible();
  await expect(total).toHaveText('₹9,993');

  await page.getByRole('button', { name: 'Remove Creatine', exact: true }).click();
  await expect(page.getByText('6 items added', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Go to Cart' }).click();
  await expect(page.getByRole('heading', { name: 'Cart', exact: true })).toBeVisible();
  await expect(total).toHaveText('₹8,994');
  await page.getByRole('button', { name: 'Remove Creatine', exact: true }).dblclick();
  await expect(page.getByRole('status', { name: 'Creatine line total' })).toHaveText('₹1,998');
  await expect(total).toHaveText('₹6,996');

  await page.getByRole('button', { name: 'Go to Checkout' }).click();
  await expect(page.getByRole('heading', { name: 'Checkout', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Add Protein', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Protein line total' })).toHaveText('₹7,497');
  await expect(total).toHaveText('₹9,495');
  await expect(page.getByText('5 items added', { exact: true })).toBeVisible();
});
