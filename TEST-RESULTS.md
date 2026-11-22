# Checkout test results

Verified on 22 November 2026 on macOS with Node.js 20.20.0, Playwright 1.64.1, and Chromium 156.0.8078.4.

## Automated run

`npm test` passed all eight checks. The project owner also ran the suite locally on their Mac and shared the result `8 passed (3.4s)`. [Recorded terminal output](evidence/playwright-run.txt)

| Case | Actual result |
| --- | --- |
| A1 · Successful checkout | One **Order confirmed** heading appeared with a visible order reference. |
| A2 · Blank or whitespace name | Both attempts showed the validation alert. The entered spaces, Creatine, and ₹999 total remained. |
| A3 · Exact totals | Two Protein and one Creatine gave line totals of ₹4,998 and ₹999 and an order total of ₹5,997. Removing Creatine reduced the total to ₹4,998. |
| A4 · Repeated submission | Three `requestSubmit()` calls produced one confirmation and one order ID element. The first reference stayed unchanged. |
| A5 · Missing UUID API | Checkout showed a valid reference after `Crypto.prototype.randomUUID` was removed before load. |
| A6 · Empty checkout | A direct visit showed the warning and disabled **Place Order**. No confirmation appeared. |
| A7 · New order | The header count was hidden on confirmation. Reset returned to Shop with zero items, cleared the reference, and left the next checkout's name blank. |
| A8 · Unexpected ID error | Checkout showed a retry alert and preserved the name and cart. The next submission succeeded. |

## Manual checks reported by the project owner

| Check | Observed result |
| --- | --- |
| M1 · Empty Cart and direct Checkout | Cart showed ₹0 and **Add items to continue** was disabled. On the direct Checkout URL, entering a name left **Place Order** disabled. The empty-cart message stayed visible and no confirmation appeared. |
| M2 · Rapid double-click | A rapid double-click on **Place Order** produced one **Order confirmed** heading and one order ID. |

The owner also checked the total before and after removing Creatine, the blank-name warning, and the return to Shop with zero items after clicking **Start a new order**. These manual results are based on the owner's report. The screenshots and trace below come from the separate Playwright sessions.

## DEFECT-1 · Checkout fails silently without `crypto.randomUUID`

- **Severity** Medium.
- **Discovery** Found during code review. The project owner separately reported reproducing the original missing-`randomUUID` failure.
- **Steps** Open the original build over a non-secure HTTP origin, or remove `Crypto.prototype.randomUUID` with a browser init script to simulate the missing API. Add one Protein, proceed to Checkout, enter `Asha Rao`, and click the order submission button.
- **Expected** An order confirmation appears with an order ID.
- **Actual before the fix** The browser reported `TypeError: crypto.randomUUID is not a function`. Checkout stayed open with no alert or confirmation, and the submit button remained enabled.
- **Fix** `makeOrderId()` generates the reference before updating order state. It uses `randomUUID`, then `getRandomValues`, then `Math.random` as the available APIs allow. A `try/catch` shows an alert on unexpected failure and preserves the form for retry.
- **Verification on the current build** The saved Playwright output records A5 passing with `randomUUID` removed and A8 passing after an injected error and retry. [Recorded terminal output](evidence/playwright-run.txt)
- **Reported development runs** During development, an earlier version of A5 was reported to fail against the original code. A separate Chromium run at `http://checkout.test:4173/`, mapped to loopback, was reported to show an order reference with `isSecureContext === false` and `randomUUID` unavailable. Those two observations have no archived run logs or traces for independent verification. A separate probe also reported success with both crypto methods removed. The screenshot shows the confirmation UI and its reference. [Current confirmation screenshot](evidence/order-confirmation.png)

## Headed browser checks

The earlier empty-cart and rapid double-click checks were driven with Playwright pointer input in a headed Chromium window. They were previously called manual checks. They show how that browser responded to the recorded pointer actions. They do not establish behavior for physical mouse timing, touch input, other browsers, or devices. The historical screenshots and trace show the original build.

| Case | Observed behavior in the earlier run | Evidence |
| --- | --- | --- |
| Empty cart | Cart showed ₹0 with progression disabled. Opening Checkout directly and entering a name left submission disabled, with no order confirmation. | [Cart screenshot](evidence/empty-cart.png), [Checkout screenshot](evidence/empty-checkout.png) |
| Rapid double-click | The browser displayed one confirmation with a green tick and one order reference. The submit button disappeared. | [Original confirmation screenshot](evidence/double-click-confirmation.png) |

The updated build also passed the headed Playwright pointer checks for the empty Cart, direct empty Checkout, and rapid double-click. A separate browser check removed the last item from Checkout and verified that **Place Order** became disabled while the entered name remained. [Earlier headed browser trace](evidence/manual-browser-trace.zip)

**No other defects found in these checks.**
