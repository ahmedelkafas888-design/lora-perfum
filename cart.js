import { StoreApp } from "./script.js";

const CartEngine = {
    addToCart(productId, qty = 1) {
        let cart = StoreApp.state.cart;
        const existingIdx = cart.findIndex(item => item.id === productId);
        
        if (existingIdx !== -1) {
            cart[existingIdx].qty += qty;
        } else {
            cart.push({ id: productId, qty: qty });
        }
        
        localStorage.setItem("lux_perfume_cart", JSON.stringify(cart));
        StoreApp.updateBadgeCounts();
        StoreApp.showNotification("addedToCart");
    },

    removeFromCart(productId) {
        let cart = StoreApp.state.cart;
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem("lux_perfume_cart", JSON.stringify(cart));
        StoreApp.updateBadgeCounts();
        if (typeof this.renderCartPage === "function") {
            this.renderCartPage();
        }
    },

    updateQuantity(productId, newQty) {
        if (newQty <= 0) {
            this.removeFromCart(productId);
            return;
        }
        let cart = StoreApp.state.cart;
        const item = cart.find(i => i.id === productId);
        if (item) {
            item.qty = parseInt(newQty);
            localStorage.setItem("lux_perfume_cart", JSON.stringify(cart));
            StoreApp.updateBadgeCounts();
            if (typeof this.renderCartPage === "function") {
                this.renderCartPage();
            }
        }
    }
};

window.CartEngine = CartEngine;
export { CartEngine };
