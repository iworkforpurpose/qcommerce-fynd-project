# Checkout test plan

## 1. Scope and out of scope

Test the browser flow from Shop through Cart and Checkout to Order confirmed. Cover quantity changes and totals, validation, repeat submissions, reference generation, and starting a new order.

Payments, a backend, and persistence are out of scope. Each browser case starts with a fresh page, an empty cart, and a blank name.

## 2. Checkout risks

Likelihood and impact use H (high), M (medium), and L (low). P1 risks can block checkout or produce an invalid order. P2 risks primarily affect recovery or the next order.

| ID | Risk | Likelihood (H/M/L) | Impact (H/M/L) | Priority | Why | Covered by |
| --- | --- | --- | --- | --- | --- | --- |
| R1 | Wrong line total or order total | M | H | P1 | A missed click or stale quantity can show the customer the wrong amount. | A3 |
| R2 | Duplicate order or confirmation | M | H | P1 | A double-click or repeated submit event can replace the first reference or confirm multiple times. | A4, M2 |
| R3 | Empty cart can be submitted | M | H | P1 | A direct Checkout URL bypasses the Cart button, and removing the last item can leave Checkout open. | A6, M1 |
| R4 | Blank or whitespace-only name is accepted | H | M | P1 | Customers can skip the field or type spaces that pass a simple nonempty check. | A2 |
| R5 | Entered data is lost on validation error | M | M | P2 | Clearing the field or cart forces the customer to reconstruct their order. | A2 |
| R6 | Confirmation appears without a reference | L | H | P1 | A customer who sees success needs a reference to identify the order. | A1, A4, A5 |
| R7 | ID generation fails on a non-secure origin | M | H | P1 | The browser can omit the UUID API on plain HTTP outside localhost, which previously stopped submission. | A5 |
| R8 | Cart state remains after confirmation or reset | H | M | P2 | A visible count or carried-over items and name can make a new order look like the previous one. | A7 |
| R9 | Unexpected submission error leaves checkout unusable | L | H | P1 | A throwing ID provider can interrupt checkout. The customer needs feedback and a retry path. | A8 |

## 3. Test cases

| ID | Linked risk | Type | Steps | Expected result |
| --- | --- | --- | --- | --- |
| A1 | R6 | Automated | Add one Protein, open Cart and Checkout, enter `Asha Rao`, and click **Place Order**. | One **Order confirmed** heading and a visible `ORD-` reference with uppercase hex or UUID characters. |
| A2 | R4, R5 | Automated | Add one Creatine and open Checkout. Submit once with a blank name and again with three spaces. | Both submissions show the name alert and no confirmation. The whitespace stays in the field, Creatine stays in the order, and the total stays ₹999. |
| A3 | R1 | Automated | In Shop, add two Protein and one Creatine. Check both lines and the order total, then remove one Creatine. | Protein is ₹4,998, Creatine is ₹999, and the total is ₹5,997 before removal and ₹4,998 after it. |
| A4 | R2, R6 | Automated | Add one Protein and enter a name in Checkout. Call `requestSubmit()` three times and capture the reference from the first call. | Exactly one heading and one order ID element. The first reference remains visible and unchanged. |
| A5 | R6, R7 | Automated | Remove `Crypto.prototype.randomUUID` before load and complete an order. | The confirmation and a valid `ORD-` reference appear. |
| A6 | R3 | Automated | Open `/#checkout` with an empty cart. | **Place Order** is disabled, the empty-cart message is visible, and no confirmation appears. |
| A7 | R8 | Automated | Place an order containing both products, click **Start a new order**, then add one product and open Checkout again. | The count is hidden on confirmation. Reset returns to `#shop` with zero items, a ₹0 total, and no prior confirmation or reference. The next checkout has a blank name. |
| A8 | R9 | Automated | Make the UUID method throw on the first attempt only. Place an order, inspect the form, then retry. | A visible retry alert appears, the name and total remain, and **Place Order** is enabled. The retry shows confirmation and a reference. |
| M1 | R3 | Manual | Follow the empty-cart steps below. | The empty Cart and Checkout both block progression. Removing the final item also disables **Place Order**. |
| M2 | R2, R6 | Manual | Follow the rapid double-click steps below. | One confirmation and one visible reference remain after a physical double-click. |

## 4. Manual exploratory checks

Start the app with `npm start`. Repeat each case in a browser tab with a mouse.

### M1 · Empty cart

1. Open [Shop](http://127.0.0.1:4173/) in a fresh tab and check that the header reads **0 items added**.
2. Click **Go to Cart**. Confirm the total is ₹0. Click **Add items to continue** and verify the button is disabled and Cart stays open.
3. Paste `http://127.0.0.1:4173/#checkout` into the address bar and press Enter. Confirm the total is ₹0 and the page shows “0 items added. Please add items to continue.”
4. Type `Asha Rao` in **Name**. Click **Place Order** and verify it remains disabled and no confirmation appears.
5. Open Shop in a fresh tab, click **+** on Protein once, then click **Go to Cart** and **Go to Checkout**. Type `Asha Rao`, click **−** on Protein, and verify the warning returns, **Place Order** becomes disabled, and the typed name remains.

### M2 · Rapid double-click

1. Open [Shop](http://127.0.0.1:4173/) in a fresh tab. Click **+** on Protein once, then click **Go to Cart** and **Go to Checkout**.
2. Type `Asha Rao` in **Name** and confirm the total is ₹2,499.
3. Move the pointer onto **Place Order** and press the left mouse button twice rapidly without moving the pointer.
4. Verify that one **Order confirmed** screen appears with a green tick and one `ORD-` reference. Check that **Place Order** is no longer visible and that the displayed reference stays the same.

## 5. Defect reporting template

- **ID and severity**
- **Environment and steps to reproduce**
- **Expected result**
- **Actual result**
- **Evidence** such as a screenshot, browser trace, or console error
