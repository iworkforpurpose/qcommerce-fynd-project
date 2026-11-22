# Checkout test plan

Run each case from a fresh page so the cart starts at zero and the name is blank.

| Priority | Case | Steps | Expected |
| --- | --- | --- | --- |
| 1 | Rapid double-click (manual) | Add one Protein, open Cart and Checkout, enter `Asha Rao`, and double-click **Confirm Payment** as quickly as possible. | One confirmation appears with a green tick and one order ID. The payment button is no longer available. |
| 2 | Empty cart (manual) | Open Cart with zero items. Try to click **Add items to continue**. Then open `http://127.0.0.1:4173/#checkout` from a fresh page, enter `Asha Rao`, and try to click **Confirm Payment**. | The total is ₹0 in both views. Both buttons are disabled. Checkout displays “0 items added. Please add items to continue.” No confirmation appears. |
| 3 | Missing name (automated) | Add one Creatine, proceed to Checkout, enter only spaces for the name, and click **Confirm Payment**. | The name field shows “Please enter your name to continue.” The entered spaces and ₹999 cart remain. No confirmation appears. |
| 4 | Exact totals (automated) | In Shop, add two Protein and five Creatine with rapid clicks, then remove one Creatine. In Cart, rapidly remove two more Creatine. In Checkout, add one Protein. | Shop shows 7 items and ₹9,993, then 6 items. Cart starts at ₹8,994 and falls to ₹6,996. Checkout ends at 5 items and ₹9,495. The Creatine line total in Cart is ₹1,998 and the final Protein line total is ₹7,497. |
| 5 | Successful checkout (automated) | Add one Protein, open Cart and Checkout, enter `Asha Rao`, and click **Confirm Payment**. | One confirmation appears with an order ID. |

For any defect found, record the reproduction steps, expected and actual behavior, and a screenshot or trace in the results.
