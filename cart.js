import { db, doc, getDoc } from './firebase.js';
import { applyTranslations, updateBadges } from './script.js';

let cartItems = [];
let activeDiscountPercent = parseFloat(localStorage.getItem('lora_active_discount') || '0');

function initCartPage() {
    cartItems = JSON.parse(localStorage.getItem('lora_cart') || '[]');
    renderCartItems();
    recalculateTotals();
}

function renderCartItems() {
    const container = document.getElementById('cartItemsList');
    if(!container) return;

    if(cartItems.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 40px 0;">
                <p style="color:var(--gray-muted); margin-bottom:20px;">Your luxury cart is empty.</p>
                <a href="products.html" class="btn-buy-now" style="padding:10px 20px; inline-block">Return to Shop</a>
            </div>
        `;
        return;
    }

    container.innerHTML = cartItems.map((item, index) => `
        <div class="cart-item">
            <img src="${item.imageUrl}" class="cart-item-img" alt="${item.title}">
            <div class="cart-item-details">
                <h4>${item.title}</h4>
                <div class="cart-item-meta">Price: ${item.price} AED</div>
                <div class="qty-control">
                    <button class="qty-btn" onclick="adjustQty(${index}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" onclick="adjustQty(${index}, 1)">+</button>
                </div>
            </div>
            <div style="text-align:right;">
                <div style="font-weight:600; color:var(--gold-dark);">${(item.price * item.qty).toFixed(2)} AED</div>
                <button style="background:none; border:none; color:red; cursor:pointer; font-size:0.8rem; margin-top:10px;" onclick="removeCartItem(${index})">Remove</button>
            </div>
        </div>
    `).join('');
}

window.adjustQty = function(index, delta) {
    cartItems[index].qty += delta;
    if(cartItems[index].qty <= 0) {
        cartItems.splice(index, 1);
    }
    saveAndReload();
};

window.removeCartItem = function(index) {
    cartItems.splice(index, 1);
    saveAndReload();
};

function saveAndReload() {
    localStorage.setItem('lora_cart', JSON.stringify(cartItems));
    renderCartItems();
    recalculateTotals();
    updateBadges();
}

function recalculateTotals() {
    let subtotal = cartItems.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
    let discount = subtotal * (activeDiscountPercent / 100);
    let total = subtotal - discount;

    document.getElementById('subtotalVal').innerText = subtotal.toFixed(2);
    document.getElementById('discountVal').innerText = discount.toFixed(2);
    document.getElementById('totalVal').innerText = total.toFixed(2);
    
    // CRITICAL REQUIREMENT 7: VALIDATE COUPON SYNCH INPUT VALUES
    const code = localStorage.getItem('lora_coupon_code');
    if(code) {
        document.getElementById('couponInput').value = code;
        document.getElementById('couponFeedback').className = "feedback-msg success";
        document.getElementById('couponFeedback').innerText = `Coupon active: ${activeDiscountPercent}% Discount applied.`;
    }
}

// CRITICAL REQUIREMENT 6 & 7: SYNCHRONIZED REAL-TIME COUPON EVALUATIONS ENGINE
document.getElementById('applyCouponBtn').addEventListener('click', async () => {
    const inputCode = document.getElementById('couponInput').value.trim().toUpperCase();
    const feedback = document.getElementById('couponFeedback');
    if(!inputCode) return;

    try {
        const snap = await getDoc(doc(db, "coupons", inputCode));
        if(snap.exists() && snap.data().active) {
            activeDiscountPercent = parseFloat(snap.data().percentage || 0);
            localStorage.setItem('lora_active_discount', activeDiscountPercent);
            localStorage.setItem('lora_coupon_code', inputCode);
            feedback.className = "feedback-msg success";
            feedback.innerText = `Success! ${activeDiscountPercent}% discount applied.`;
            recalculateTotals();
        } else {
            feedback.className = "feedback-msg error";
            feedback.innerText = "Invalid or expired coupon code.";
        }
    } catch(e) {
        feedback.className = "feedback-msg error";
        feedback.innerText = "Error syncing validation state servers.";
    }
});

document.getElementById('proceedToCheckoutBtn').addEventListener('click', () => {
    if(cartItems.length === 0) return;
    window.location.href = 'checkout.html';
});

document.addEventListener('DOMContentLoaded', () => {
    initCartPage();
});
