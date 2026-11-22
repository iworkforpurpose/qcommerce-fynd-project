const { expect, test } = require('@playwright/test');

const orderIdPattern = /^ORD-[0-9A-F-]+$/;

function cartCount(page) {
  return page.getByRole('banner').getByRole('status');
}

function orderTotal(page) {
  return page.getByRole('status', { name: 'Order total', exact: true });
}

function confirmationHeading(page) {
  return page.getByRole('heading', { name: 'Order confirmed', exact: true });
}

function placeOrder(page) {
  return page.getByRole('button', { name: 'Place Order', exact: true });
}

async function clickEnabled(control) {
  await expect(control).toBeEnabled();
  await control.click();
}

async function openCheckout(page) {
  await clickEnabled(page.getByRole('link', { name: 'Go to Cart' }));
  await expect(page.getByRole('heading', { name: 'Cart', exact: true })).toBeVisible();
  await clickEnabled(page.getByRole('button', { name: 'Go to Checkout', exact: true }));
  await expect(page.getByRole('heading', { name: 'Checkout', exact: true })).toBeVisible();
}

async function prepareOrder(page, product = 'Protein') {
  await clickEnabled(page.getByRole('button', { name: `Add ${product}`, exact: true }));
  await expect(cartCount(page)).toHaveText('1 item added');
  await openCheckout(page);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(cartCount(page)).toHaveText('0 items added');
});

test('a valid checkout shows one confirmation with an order ID', async ({ page }) => {
  await prepareOrder(page);
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Asha Rao');
  await clickEnabled(placeOrder(page));

  await expect(confirmationHeading(page)).toHaveCount(1);
  await expect(confirmationHeading(page)).toBeVisible();
  await expect(page.getByRole('paragraph').filter({ hasText: /^Order ID: ORD-[0-9A-F-]+$/ })).toBeVisible();
});

test('a blank or whitespace-only name blocks checkout and preserves the entered data', async ({ page }) => {
  await prepareOrder(page, 'Creatine');
  const name = page.getByRole('textbox', { name: 'Name', exact: true });
  const alert = page.getByRole('alert');
  await expect(name).toHaveValue('');
  await clickEnabled(placeOrder(page));
  await expect(alert).toHaveText('Please enter your name to continue.');
  await expect(confirmationHeading(page)).toHaveCount(0);

  await name.fill('   ');
  await clickEnabled(placeOrder(page));

  await expect(alert).toHaveText('Please enter your name to continue.');
  await expect(name).toHaveValue('   ');
  await expect(page.getByRole('group', { name: 'Creatine', exact: true })).toBeVisible();
  await expect(orderTotal(page)).toHaveText('₹999');
  await expect(confirmationHeading(page)).toHaveCount(0);
});

test('quantity changes update the exact line and order totals', async ({ page }) => {
  const addProtein = page.getByRole('button', { name: 'Add Protein', exact: true });
  await expect(addProtein).toBeEnabled();
  await addProtein.dblclick();
  await clickEnabled(page.getByRole('button', { name: 'Add Creatine', exact: true }));

  await expect(page.getByRole('status', { name: 'Protein line total' })).toHaveText('₹4,998');
  await expect(page.getByRole('status', { name: 'Creatine line total' })).toHaveText('₹999');
  await expect(orderTotal(page)).toHaveText('₹5,997');

  await clickEnabled(page.getByRole('button', { name: 'Remove Creatine', exact: true }));
  await expect(orderTotal(page)).toHaveText('₹4,998');
});

test('double submit produces one confirmation', async ({ page }) => {
  await prepareOrder(page);
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Asha Rao');
  await expect(placeOrder(page)).toBeEnabled();
  const firstReference = await page.evaluate(() => {
    const form = document.forms.namedItem('order-form');
    form.requestSubmit();
    const reference = document.getElementById('order-id').textContent;
    form.requestSubmit();
    form.requestSubmit();
    return reference;
  });

  await expect(confirmationHeading(page)).toHaveCount(1);
  await expect(confirmationHeading(page)).toBeVisible();
  const orderReference = page.locator('#order-id');
  await expect(orderReference).toHaveCount(1);
  await expect(orderReference).toHaveText(orderIdPattern);
  await expect(orderReference).toHaveText(firstReference);
  await expect(orderReference).toBeVisible();
});

test('order ID fallback works without crypto.randomUUID', async ({ page }) => {
  await page.addInitScript(() => { delete Crypto.prototype.randomUUID; });
  await page.goto('/');
  await expect(cartCount(page)).toHaveText('0 items added');
  await prepareOrder(page);
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Asha Rao');
  await clickEnabled(placeOrder(page));

  await expect(confirmationHeading(page)).toBeVisible();
  await expect(page.getByRole('strong').filter({ hasText: orderIdPattern })).toBeVisible();
});

test('empty cart blocks checkout', async ({ page }) => {
  await page.goto('/#checkout');
  await expect(page.getByRole('heading', { name: 'Checkout', exact: true })).toBeVisible();
  await expect(placeOrder(page)).toBeDisabled();
  await expect(page.getByRole('paragraph').filter({
    hasText: /^0 items added\. Please add items to continue\.$/,
  })).toBeVisible();
  await expect(confirmationHeading(page)).toHaveCount(0);
});

test('start a new order resets state', async ({ page }) => {
  await clickEnabled(page.getByRole('button', { name: 'Add Protein', exact: true }));
  await clickEnabled(page.getByRole('button', { name: 'Add Creatine', exact: true }));
  await expect(cartCount(page)).toHaveText('2 items added');
  await openCheckout(page);
  const name = page.getByRole('textbox', { name: 'Name', exact: true });
  await name.fill('Asha Rao');
  await clickEnabled(placeOrder(page));
  await expect(confirmationHeading(page)).toBeVisible();
  await expect(cartCount(page)).toBeHidden();

  await clickEnabled(page.getByRole('button', { name: 'Start a new order', exact: true }));
  await expect(page).toHaveURL(/#shop$/);
  await expect(page.getByRole('heading', { name: 'Shop', exact: true })).toBeVisible();
  await expect(cartCount(page)).toBeVisible();
  await expect(cartCount(page)).toHaveText('0 items added');
  await expect(orderTotal(page)).toHaveText('₹0');
  await expect(confirmationHeading(page)).toHaveCount(0);
  await expect(page.getByRole('strong', { includeHidden: true })).toBeEmpty();

  await prepareOrder(page);
  await expect(name).toHaveValue('');
});

test('an unexpected ID error preserves the form and allows a retry', async ({ page }) => {
  await prepareOrder(page);
  const name = page.getByRole('textbox', { name: 'Name', exact: true });
  await name.fill('Asha Rao');
  await page.evaluate(() => {
    const randomUUID = Crypto.prototype.randomUUID;
    Crypto.prototype.randomUUID = () => {
      Crypto.prototype.randomUUID = randomUUID;
      throw new Error('Simulated ID generation error');
    };
  });

  await clickEnabled(placeOrder(page));
  const alert = page.getByRole('alert');
  await expect(alert).toBeVisible();
  await expect(alert).toHaveText('Something went wrong. Please try again.');
  await expect(name).toHaveValue('Asha Rao');
  await expect(orderTotal(page)).toHaveText('₹2,499');
  await expect(confirmationHeading(page)).toHaveCount(0);

  await clickEnabled(placeOrder(page));
  await expect(confirmationHeading(page)).toBeVisible();
  await expect(page.getByRole('strong').filter({ hasText: orderIdPattern })).toBeVisible();
});
