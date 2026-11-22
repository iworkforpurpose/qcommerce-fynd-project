# Supplement Shop checkout

A single-page checkout for Protein (1 kg, ₹2,499) and Creatine (250 g, ₹999). Use the plus and minus buttons to update quantities in Shop, Cart, or Checkout. **Place Order** shows an order confirmation with a reference. **Start a new order** clears the cart and name and returns to Shop.

## Run the page

1. Install Node.js 20 or later.
2. In the project folder, run `npm start`.
3. Open [Supplement Shop](http://127.0.0.1:4173/) in your browser.

## Run the browser tests

1. Stop the local server with **Ctrl+C** if it is running. Playwright starts its own server on port 4173.
2. Install the locked dependencies and Chromium, then run the suite.

   ```sh
   npm ci
   npx playwright install chromium
   npm test
   ```

3. Open the report with `npx playwright show-report`. Each run also writes a trace per case under `test-results/`.

## Files

- [Test plan](TEST-PLAN.md) for checkout risks, automated cases, and manual steps.
- [Test results](TEST-RESULTS.md) for the recorded run, defect report, and evidence.
