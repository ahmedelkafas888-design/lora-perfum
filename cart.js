import { db, doc, getDoc } from './firebase.js';
import { runGlobalTranslationsEngine, updateLayoutBadges, pullDynamicStoreMetadata } from './script.js';

function renderCartItems() {
    const cartContainer = document.getElementById('cartRowsContainer');
    if (!cartContainer) return;

    const cartItems = JSON.parse(localStorage.getItem('lora_cart') || '[]');

    if (cartItems.length === 0) {
        cartContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <p style="color: var(--gray-muted); margin-bottom: 20px;" data-i18n="cart_empty_msg">Your shopping cart is currently empty.</p>
                <a href="products.html" class="btn-checkout-action" style="display: inline-block; text-decoration: none;" data-i18n="nav_shop">Shop Our Collection</a>
            </div>
        `;
        recalculateCartTotals();
        runGlobalTranslationsEngine();
        return;
    }

    let htmlPayload = '';
    cartItems.forEach(item => {
        const itemSubtotal = parseFloat(item.price) * parseInt(item.quantity || 1);
        htmlPayload += `
            <div class="cart-row-item" id="cart-item-${item.id}">
                <div class="cart-item-meta">
                    <img src="${item.imageUrl}" alt="${item.title}">
                    <div>
                        <h4 class="cart-item-title">${item.title}</h4>
                        <p class="cart-item-spec">${item.size || '100'} ML</p>
                        <p class="cart-item-price-unit">${item.price} EGP</p>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <div class="qty-stepper">
                        <button class="step-btn" onclick="updateQtyEngine('${item.id}', -1)">-</button>
                        <span class="qty-val">${item.quantity || 1}</span>
                        <button class="step-btn" onclick="updateQtyEngine('${item.id}', 1)">+</button>
                    </div>
                    <div class="cart-item-subtotal">
                        <span>${itemSubtotal.toFixed(2)} EGP</span>
                    </div>
                    <button class="cart-remove-btn" onclick="removeItemFromCartEngine('${item.id}')">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;
    });

    cartContainer.innerHTML = htmlPayload;
    recalculateCartTotals();
    runGlobalTranslationsEngine();
}

window.updateQtyEngine = function(id, delta) {
    let cart = JSON.parse(localStorage.getItem('lora_cart') || '[]');
    const idx = cart.findIndex(x => x.id === id);
    if (idx > -1) {
        let currentQty = parseInt(cart[idx].quantity || 1);
        currentQty += delta;
        if (currentQty <= 0) {
            cart.splice(idx, 1);
        } else {
            cart[idx].quantity = currentQty;
        }
        localStorage.setItem('lora_cart', JSON.stringify(cart));
        updateLayoutBadges();
        renderCartItems();
    }
};

window.removeItemFromCartEngine = function(id) {
    let cart = JSON.parse(localStorage.getItem('lora_cart') || '[]');
    cart = cart.filter(x => x.id !== id);
    localStorage.setItem('lora_cart', JSON.stringify(cart));
    updateLayoutBadges();
    renderCartItems();
};

function recalculateCartTotals() {
    const cartItems = JSON.parse(localStorage.getItem('lora_cart') || '[]');
    let subtotal = 0;

    cartItems.forEach(item => {
        subtotal += parseFloat(item.price) * parseInt(item.quantity || 1);
    });

    const couponData = JSON.parse(sessionStorage.getItem('appliedCoupon') || 'null');
    let discount = 0;

    if (couponData) {
        if (couponData.type === 'percentage') {
            discount = (subtotal * parseFloat(couponData.value)) / 100;
        } else {
            discount = parseFloat(couponData.value);
        }
    }

    const total = Math.max(0, subtotal - discount);

    const subtotalEl = document.getElementById('subtotalValue');
    const discountEl = document.getElementById('discountValue');
    const totalEl = document.getElementById('totalValue');

    if (subtotalEl) subtotalEl.innerText = subtotal.toFixed(2);
    if (discountEl) discountEl.innerText = discount.toFixed(2);
    if (totalEl) totalEl.innerText = total.toFixed(2);
}

async function validateAndApplyCoupon() {
    const codeInput = document.getElementById('couponField');
    const feedback = document.getElementById('couponFeedback');
    if (!codeInput || !feedback) return;

    const enteredCode = codeInput.value.trim().toUpperCase();
    if (!enteredCode) {
        feedback.className = "feedback-msg error";
        feedback.innerText = "Please enter a coupon code.";
        return;
    }

    try {
        feedback.className = "feedback-msg";
        feedback.innerText = "Verifying promotional rules...";

        const couponRef = doc(db, "coupons", enteredCode);
        const couponSnap = await getDoc(couponRef);

        if (couponSnap.exists()) {
            const data = couponSnap.data();
            sessionStorage.setItem('appliedCoupon', JSON.stringify({
                code: enteredCode,
                type: data.type,
                value: data.value
            }));
            feedback.className = "feedback-msg success";
            feedback.innerText = `Coupon "${enteredCode}" applied successfully!`;
            recalculateCartTotals();
        } else {
            feedback.className = "feedback-msg error";
            feedback.innerText = "Invalid coupon code. Please try another code.";
        }
    } catch (err) {
        console.error("Coupon validation error: ", err);
        feedback.className = "feedback-msg error";
        feedback.innerText = "Error verifying coupon. Please try again.";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateLayoutBadges();
    pullDynamicStoreMetadata();
    renderCartItems();

    const applyBtn = document.getElementById('applyCouponBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', validateAndApplyCoupon);
    }

    const checkoutBtn = document.getElementById('goToCheckoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const cart = JSON.parse(localStorage.getItem('lora_cart') || '[]');
            if (cart.length === 0) {
                alert("Your cart is empty. Add products before proceeding to checkout.");
                return;
            }
            sessionStorage.removeItem('buyNowItem');
            window.location.href = 'checkout.html';
        });
    }

    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });
    }
});
