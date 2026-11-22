const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const products = [
  { name: 'Protein', size: '1 kg', price: 2499, quantity: 0 },
  { name: 'Creatine', size: '250 g', price: 999, quantity: 0 },
];

const views = {
  shop: document.querySelector('#shop'),
  cart: document.querySelector('#cart'),
  checkout: document.querySelector('#checkout'),
};
const cartCount = document.querySelector('#cart-count');
const totals = document.querySelectorAll('[data-order-total]');
const cartEmpty = document.querySelector('#cart-empty');
const checkoutEmpty = document.querySelector('#checkout-empty');
const checkoutProducts = document.querySelector('#checkout-products');
const checkoutButton = document.querySelector('#go-to-checkout');
const paymentForm = document.querySelector('#payment-form');
const confirmButton = document.querySelector('#confirm-payment');
const nameField = document.querySelector('#name');
const nameError = document.querySelector('#name-error');
const confirmation = document.querySelector('#confirmation');
const template = document.querySelector('#product-template');
let orderId = '';

function itemCount() {
  return products.reduce((count, product) => count + product.quantity, 0);
}

function mountProduct(container, product, showWhenEmpty) {
  const card = template.content.firstElementChild.cloneNode(true);
  const minus = card.querySelector('.decrease');
  const plus = card.querySelector('.increase');
  const quantity = card.querySelector('.quantity-value');
  const lineTotal = card.querySelector('output');

  card.setAttribute('aria-label', product.name);
  card.querySelector('h2').textContent = product.name;
  card.querySelector('.unit-price').textContent = `${rupees.format(product.price)} / ${product.size}`;
  minus.setAttribute('aria-label', `Remove ${product.name}`);
  plus.setAttribute('aria-label', `Add ${product.name}`);
  lineTotal.setAttribute('aria-label', `${product.name} line total`);
  minus.addEventListener('click', () => changeQuantity(product, -1));
  plus.addEventListener('click', () => changeQuantity(product, 1));
  container.append(card);

  return { product, card, minus, quantity, lineTotal, showWhenEmpty };
}

const productCards = Object.keys(views).flatMap((view) => {
  const container = document.querySelector(`#${view}-products`);
  return products.map((product) => mountProduct(container, product, view === 'shop'));
});

function setText(element, value) {
  if (element.textContent !== value) element.textContent = value;
}

function renderCart() {
  const count = itemCount();
  const total = products.reduce((sum, product) => sum + product.price * product.quantity, 0);
  const empty = count === 0;

  for (const { product, card, minus, quantity, lineTotal, showWhenEmpty } of productCards) {
    card.hidden = product.quantity === 0 && !showWhenEmpty;
    minus.disabled = product.quantity === 0;
    setText(quantity, String(product.quantity));
    setText(lineTotal, rupees.format(product.price * product.quantity));
  }

  setText(cartCount, `${count} ${count === 1 ? 'item' : 'items'} added`);
  totals.forEach((element) => setText(element, rupees.format(total)));
  cartEmpty.hidden = !empty;
  checkoutEmpty.hidden = !empty;
  checkoutProducts.hidden = empty;
  checkoutButton.disabled = empty;
  setText(checkoutButton, empty ? 'Add items to continue' : 'Go to Checkout');
  confirmButton.disabled = empty || Boolean(orderId);
}

function changeQuantity(product, delta) {
  if (orderId) return;
  product.quantity = Math.max(0, product.quantity + delta);
  renderCart();
}

function showView(moveFocus) {
  const route = window.location.hash.slice(1);
  const requestedView = Object.hasOwn(views, route) ? views[route] : views.shop;
  const current = orderId ? confirmation : requestedView;

  for (const view of [...Object.values(views), confirmation]) {
    view.hidden = view !== current;
  }

  if (moveFocus) {
    window.scrollTo(0, 0);
    current.querySelector('h1').focus({ preventScroll: true });
  }
}

function setNameError(invalid) {
  nameError.hidden = !invalid;
  if (invalid) {
    nameField.setAttribute('aria-invalid', 'true');
    nameField.setAttribute('aria-describedby', nameError.id);
  } else {
    nameField.removeAttribute('aria-invalid');
    nameField.removeAttribute('aria-describedby');
  }
}

nameField.addEventListener('input', () => {
  if (nameField.value.trim()) setNameError(false);
});

checkoutButton.addEventListener('click', () => {
  window.location.hash = 'checkout';
});

paymentForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (orderId || itemCount() === 0) return;

  if (!nameField.value.trim()) {
    setNameError(true);
    nameField.focus();
    return;
  }

  orderId = `ORD-${crypto.randomUUID().toUpperCase()}`;
  confirmButton.disabled = true;
  document.querySelector('#order-id').textContent = orderId;
  showView(true);
});

window.addEventListener('hashchange', () => showView(true));
renderCart();
showView(false);
