# Checkout test results

Run on 22 November 2026 on macOS with Playwright 1.64.1 and Chromium 156.0.8078.4.

## Automated

`npm test` passed all three checks. [Playwright output](evidence/playwright-run.txt)

| Case | Actual result |
| --- | --- |
| Successful checkout | One visible confirmation and one order ID. |
| Missing name | The name warning appeared, the entered spaces and ₹999 total remained, and checkout stayed open. |
| Exact totals | Rapid quantity clicks updated the count and totals as expected. The final Checkout showed 5 items and ₹9,495. |

## Manual

I drove a separate, headed Chromium session one step at a time using Playwright browser input. Follow the [test plan](TEST-PLAN.md) to repeat the checks with a mouse.

| Case | Actual result | Evidence |
| --- | --- | --- |
| Empty cart | Cart showed ₹0 and the disabled **Add items to continue** button. Clicking it left Cart open. Opening Checkout directly showed ₹0, the empty-cart message, and a disabled **Confirm Payment** button. Entering a name and attempting to click still produced zero confirmations. | [Cart](evidence/empty-cart.png), [Checkout](evidence/empty-checkout.png) |
| Rapid double-click | A double-click on **Confirm Payment** showed a green tick and one order ID, `ORD-B9EBD2D0-04A3-4C75-9DDE-6A16B8A4174F`. The confirmation count was 1 and the payment button disappeared. | [Confirmation](evidence/double-click-confirmation.png) |

Zero checkout defects were observed in these checks.

The [manual browser trace](evidence/manual-browser-trace.zip) records the empty-cart click attempts and the rapid double-click. Open it locally with `npx playwright show-trace evidence/manual-browser-trace.zip`.
