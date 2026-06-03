/**
 * LORA PARFUMS - Business Architecture Engine
 */

const EXCHANGE_RATE = 50.00; 

const DEFAULT_CATALOG = [
    {
        id: "SKU-GOLD",
        name: "Élixir d'Or Luxe",
        image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80",
        price: 180.00,
        discount: 15,
        description: "An exceptional extraction anchored in Damask absolute, combined with threads of rare clean leather and warm golden honey notes.",
        category: "Women"
    },
    {
        id: "SKU-IMP",
        name: "Nuit Impériale Intense",
        image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80",
        price: 210.00,
        discount: 0,
        description: "A commanding masculine configuration of pure Calabrian bergamot, crisp cedarwood layers, and deep smoky Haitian vetiver.",
        category: "Men"
    },
    {
        id: "SKU-MAG",
        name: "Opus Magnolia Flora",
        image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80",
        price: 165.00,
        discount: 10,
        description: "A velvet-soft cloud composition derived from local jasmines, white spring magnolias, and fresh morning citrus peel.",
        category: "Women"
    },
    {
        id: "SKU-OUD",
        name: "Oud Noir Collection",
        image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80",
        price: 240.00,
        discount: 0,
        description: "Enigmatic, deep dark woods crafted carefully with heavy amber layers, patchouli oils, and traditional natural resin musk.",
        category: "Men"
    }
];

function initApp() {
    if (!localStorage.getItem('lora_products')) {
        localStorage.setItem('lora_products', JSON.stringify(DEFAULT_CATALOG));
    }
    if (!localStorage.getItem('lora_cart')) {
        localStorage.setItem('lora_cart', JSON.stringify([]));
    }
    if (!localStorage.getItem('lora_coupons')) {
        localStorage.setItem('lora_coupons', JSON.stringify([
            { code: "WELCOME10", percentage: 10, active: true },
            { code: "LORA50", percentage: 50, active: true }
        ]));
    }
}

function getProducts() {
    return JSON.parse(localStorage.getItem('lora_products')) || [];
}

function getCart() {
    return JSON.parse(localStorage.getItem('lora_cart')) || [];
}

function calculateFinalPrice(usdPrice, discountPercentage) {
    const baseEgp = parseFloat(usdPrice) * EXCHANGE_RATE;
    const discount = parseInt(discountPercentage || 0);
    if(discount > 0) {
        return baseEgp - (baseEgp * (discount / 100));
    }
    return baseEgp;
}

// Rigid Responsive Symmetrical Card Component Factory Blueprint
function createProductCard(product) {
    const finalEgp = calculateFinalPrice(product.price, product.discount);
    const originalEgp = parseFloat(product.price) * EXCHANGE_RATE;
    const parsedDiscount = parseInt(product.discount || 0);

    let badgeHtml = parsedDiscount > 0 ? `<div class="discount-badge">-${parsedDiscount}%</div>` : '';
    let priceHtml = parsedDiscount > 0 
        ? `<span class="price"><span class="original-strike">${originalEgp.toFixed(0)} EGP</span>${finalEgp.toFixed(0)} EGP</span>`
        : `<span class="price">${finalEgp.toFixed(0)} EGP</span>`;

    return `
        <div class="product-card">
            ${badgeHtml}
            <div style="cursor:pointer;" onclick="window.location.href='product.html?id=${product.id}'">
                <div class="product-card-img-wrapper">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <span class="category-tag">Maison ${product.category}</span>
                <h3>${product.name}</h3>
                ${priceHtml}
            </div>
            <div class="product-card-buttons-group">
                <button class="btn-cart" onclick="directInlineCartAdd('${product.id}')">Add To Cart</button>
                <button class="btn-buy" onclick="directInlineBuyNow('${product.id}')">Buy Now</button>
            </div>
        </div>
    `;
}

function directInlineCartAdd(id) {
    addToCart(id, 1);
    alert('Added to your selection bag.');
}

function directInlineBuyNow(id) {
    addToCart(id, 1);
    window.location.href = 'checkout.html';
}

function addToCart(productId, quantity = 1) {
    let cart = getCart();
    const idx = cart.findIndex(i => i.id === productId);
    if (idx > -1) {
        cart[idx].quantity += quantity;
    } else {
        cart.push({ id: productId, quantity: quantity });
    }
    localStorage.setItem('lora_cart', JSON.stringify(cart));
    updateCartBadge();
}

function updateCartItemQty(productId, delta) {
    let cart = getCart();
    const idx = cart.findIndex(i => i.id === productId);
    if (idx > -1) {
        cart[idx].quantity += delta;
        if (cart[idx].quantity <= 0) cart.splice(idx, 1);
        localStorage.setItem('lora_cart', JSON.stringify(cart));
        updateCartBadge();
    }
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(i => i.id !== productId);
    localStorage.setItem('lora_cart', JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.innerText = getCart().reduce((acc, i) => acc + i.quantity, 0);
    }
}
