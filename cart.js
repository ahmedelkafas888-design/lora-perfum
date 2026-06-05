import { db, doc, getDoc } from './firebase.js';
import { runGlobalTranslationsEngine, updateLayoutBadges } from './script.js';

let runningCart = [];
let activeDiscountPctValue = parseFloat(localStorage.getItem('lora_active_discount_pct') || '0');

function initializeCartProcessing() {
    runningCart = JSON.parse(localStorage.getItem('lora_cart') || '[]');
    drawCartLayoutRows();
    updateRecalculatedOutputBreakdown();
}

function drawCartLayoutRows() {
    const displayContainer = document.getElementById('cartRowsContainer');
    if(!displayContainer) return;

    if(runningCart.length === 0) {
        displayContainer.innerHTML = `
            <div style="text-align:center; padding:30px 0;">
                <p style="color:var(--gray-muted); margin-bottom:15px;">Your cart is completely empty.</p>
                <a href="products.html" class="btn-buy-now" style="padding:8px 16px;">Continue Shopping</a>
            </div>
        `;
        return;
    }

    displayContainer.innerHTML = runningCart.map((item, pos) => `
        <div class="cart-item">
            <img src="${item.imageUrl}" class="cart-item-img" alt="${item.title}">
            <div class="cart-item-details">
                <h4>${item.title}</h4>
                <div class="cart-item-meta">${item.size} ml | ${item.price} EGP</div>
                <div class="qty-control">
                    <button class="qty-btn" onclick="mutateCartQuantity(${pos}, -1)">-</button>
                    <span style="font-size:0.85rem; font-weight:600;">${item.qty}</span>
                    <button class="qty-btn" onclick="mutateCartQuantity(${pos}, 1)">+</button>
                </div>
            </div>
            <div style="text-align:right;">
                <div style="font-weight:600; font-size:0.95rem;">${(item.price * item.qty).toFixed(2)} EGP</div>
                <button style="background:none; border:none; color:var(--red-alert); font-size:0.75rem; cursor:pointer; margin-top:8px;" onclick="dropCartRowItem(${pos})">Remove</button>
            </div>
        </div>
    `).join('');
}

window.mutateCartQuantity = function(pos, delta) {
    runningCart[pos].qty += delta;
    if(runningCart[pos].qty <= 0) runningCart.splice(pos, 1);
    commitCartChangesState();
};

window.dropCartRowItem = function(pos) {
    runningCart.splice(pos, 1);
    commitCartChangesState();
};

function commitCartChangesState() {
    localStorage.setItem('lora_cart', JSON.stringify(runningCart));
    drawCartLayoutRows();
    updateRecalculatedOutputBreakdown();
    updateLayoutBadges();
}

function updateRecalculatedOutputBreakdown() {
    let subtotal = runningCart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
    let discount = subtotal * (activeDiscountPctValue / 100);
    let finalTotal = subtotal - discount;

    document.getElementById('subtotalValue').innerText = subtotal.toFixed(2);
    document.getElementById('discountValue').innerText = discount.toFixed(2);
    document.getElementById('totalValue').innerText = finalTotal.toFixed(2);

    const activeCode = localStorage.getItem('lora_active_coupon_code');
    if(activeCode) {
        document.getElementById('couponField').value = activeCode;
        document.getElementById('couponFeedback').className = "feedback-msg success";
        document.getElementById('couponFeedback').innerText = `Active Coupon: ${activeDiscountPctValue}% Off Applied`;
    }
}

document.getElementById('applyCouponBtn').addEventListener('click', async () => {
    const val = document.getElementById('couponField').value.trim().toUpperCase();
    const feedback = document.getElementById('couponFeedback');
    if(!val) return;

    const snapshot = await getDoc(doc(db, "coupons", val));
    if(snapshot.exists() && snapshot.data().active) {
        activeDiscountPctValue = parseFloat(snapshot.data().percentage || 0);
        localStorage.setItem('lora_active_discount_pct', activeDiscountPctValue);
        localStorage.setItem('lora_active_coupon_code', val);
        feedback.className = "feedback-msg success";
        feedback.innerText = "Coupon code applied successfully!";
        updateRecalculatedOutputBreakdown();
    } else {
        feedback.className = "feedback-msg error";
        feedback.innerText = "Invalid or expired promo code.";
    }
});

document.getElementById('goToCheckoutBtn').addEventListener('click', () => {
    if(runningCart.length === 0) return;
    window.location.href = 'checkout.html';
});

document.addEventListener('DOMContentLoaded', initializeCartProcessing);
