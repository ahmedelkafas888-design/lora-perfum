import { db, collection, getDocs, doc, getDoc } from './firebase.js';

const i18n = {
    en: {
        nav_home: "Home", nav_shop: "Shop", nav_wishlist: "Wishlist", nav_admin: "Admin",
        main_title: "LORA HAUTE PARFUMERIE", main_subtitle: "Exquisite Aromas Crafted For Royalty",
        cat_all: "All", cat_men: "Men", cat_women: "Women", cat_unisex: "Unisex",
        cart_label: "Cart", cart_hero_title: "Your Shopping Cart", cart_hero_subtitle: "Luxury Awaits Your Final Confirmation",
        summary_title: "Order Summary", coupon_label: "Have a promo code?", coupon_apply: "Apply",
        subtotal_label: "Subtotal", discount_label: "Discount", total_label: "Final Total", checkout_btn: "Proceed To Checkout",
        foot_about: "LORA STORE", foot_about_text: "An elite house of high luxury olfactory sensations.", foot_links: "NAVIGATION", foot_contact: "CONTACT"
    },
    ar: {
        nav_home: "الرئيسية", nav_shop: "المتجر", nav_wishlist: "المفضلة", nav_admin: "الإدارة",
        main_title: "عطور لورا الفاخرة", main_subtitle: "روائح رائعة صنعت للملوك والأمراء",
        cat_all: "الكل", cat_men: "رجال", cat_women: "نساء", cat_unisex: "عطور مشتركة",
        cart_label: "السلة", cart_hero_title: "سلة التسوق الخاصة بك", cart_hero_subtitle: "الفخامة في انتظار قرارك الأخير",
        summary_title: "ملخص الطلب", coupon_label: "هل لديك كود خصم؟", coupon_apply: "تطبيق",
        subtotal_label: "المجموع الفرعي", discount_label: "الخصم", total_label: "الإجمالي النهائي", checkout_btn: "المتابعة لإتمام الشراء",
        foot_about: "متجر لورا", foot_about_text: "دار نخبوية لأرقى الأحاسيس العطرية الفاخرة.", foot_links: "روابط سريعة", foot_contact: "اتصل بنا"
    }
};

let currentLanguage = localStorage.getItem('lora_project_language') || 'en';

export function runGlobalTranslationsEngine() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(i18n[currentLanguage][key]) el.innerText = i18n[currentLanguage][key];
    });
    
    if(currentLanguage === 'ar') {
        document.body.classList.add('rtl');
        document.getElementById('langToggle').innerText = "English";
    } else {
        document.body.classList.remove('rtl');
        document.getElementById('langToggle').innerText = "العربية";
    }
}

export function updateLayoutBadges() {
    const cart = JSON.parse(localStorage.getItem('lora_cart') || '[]');
    const wish = JSON.parse(localStorage.getItem('lora_wishlist') || '[]');
    
    const cEl = document.getElementById('cartCount');
    const wEl = document.getElementById('wishlistCount');
    
    if(cEl) cEl.innerText = cart.reduce((acc, obj) => acc + obj.qty, 0);
    if(wEl) wEl.innerText = wish.length;
}

export async function pullDynamicStoreMetadata() {
    const phoneField = document.getElementById('footerPhone');
    if(!phoneField) return;
    try {
        const snap = await getDoc(doc(db, "store", "settings"));
        if(snap.exists() && snap.data().whatsapp) {
            phoneField.innerText = `WhatsApp: +${snap.data().whatsapp}`;
        } else {
            phoneField.innerText = "WhatsApp: +201000000000";
        }
    } catch(e) {
        phoneField.innerText = "WhatsApp: +201000000000";
    }
}

export function generateProductCardsMarkup(products) {
    return products.map(p => {
        const stockCount = parseInt(p.stock || 0);
        const isOut = stockCount <= 0;
        const isLow = stockCount > 0 && stockCount <= 3;
        
        let stockStatusHtml = '';
        if(isOut) stockStatusHtml = `<div class="stock-status out">SOLD OUT</div>`;
        else if(isLow) stockStatusHtml = `<div class="stock-status low">Only ${stockCount} left</div>`;
        else stockStatusHtml = `<div class="stock-status" style="color:var(--green-success);">In Stock</div>`;

        let priceHtml = '';
        let discountBadgeHtml = '';
        if(p.discountPrice && parseFloat(p.discountPrice) < parseFloat(p.price)) {
            const pct = Math.round(((p.price - p.discountPrice) / p.price) * 100);
            discountBadgeHtml = `<div class="discount-badge">${pct}% OFF</div>`;
            priceHtml = `<span class="current-price">${p.discountPrice} EGP</span><span class="old-price">${p.price} EGP</span>`;
        } else {
            priceHtml = `<span class="current-price">${p.price} EGP</span>`;
        }

        const wishItems = JSON.parse(localStorage.getItem('lora_wishlist') || '[]');
        const isInWishlist = wishItems.some(i => i.id === p.id) ? 'active' : '';

        return `
            <div class="product-card">
                <div class="card-img-wrapper">
                    ${discountBadgeHtml}
                    <button class="wishlist-toggle ${isInWishlist}" onclick="triggerWishlistAction('${p.id}', '${p.title.replace(/'/g, "\\'")}', '${p.discountPrice || p.price}', '${p.imageUrl}', '${p.size || '100'}')">
                        <i class="fa-solid fa-heart"></i>
                    </button>
                    <a href="product.html?id=${p.id}"><img src="${p.imageUrl}" class="card-img" alt="${p.title}"></a>
                </div>
                <div class="card-info">
                    <div class="product-title">${p.title}</div>
                    <div class="product-size">${p.size || '100'} ml</div>
                    <div class="price-container">${priceHtml}</div>
                    ${stockStatusHtml}
                </div>
                <div class="card-actions">
                    <button class="btn-add-cart" ${isOut ? 'disabled' : ''} onclick="addToCartEngine('${p.id}', '${p.title.replace(/'/g, "\\'")}', '${p.discountPrice || p.price}', '${p.imageUrl}', '${p.size || '100'}')">Add to Cart</button>
                    <button class="btn-buy-now" ${isOut ? 'disabled' : ''} onclick="buyNowEngine('${p.id}', '${p.title.replace(/'/g, "\\'")}', '${p.discountPrice || p.price}', '${p.imageUrl}', '${p.size || '100'}')">Buy Now</button>
                </div>
            </div>
        `;
    }).join('');
}

window.addToCartEngine = function(id, title, price, imageUrl, size) {
    let cart = JSON.parse(localStorage.getItem('lora_cart') || '[]');
    let idx = cart.findIndex(item => item.id === id);
    if(idx > -1) {
        cart[idx].qty += 1;
    } else {
        cart.push({ id, title, price: parseFloat(price), imageUrl, size, qty: 1 });
    }
    localStorage.setItem('lora_cart', JSON.stringify(cart));
    updateLayoutBadges();
};

window.buyNowEngine = function(id, title, price, imageUrl, size) {
    const directObj = { id, title, price: parseFloat(price), imageUrl, size, qty: 1 };
    localStorage.setItem('lora_direct_item', JSON.stringify(directObj));
    window.location.href = 'checkout.html?direct=true';
};

window.triggerWishlistAction = function(id, title, price, imageUrl, size) {
    let wish = JSON.parse(localStorage.getItem('lora_wishlist') || '[]');
    let idx = wish.findIndex(i => i.id === id);
    if(idx > -1) {
        wish.splice(idx, 1);
    } else {
        wish.push({ id, title, price: parseFloat(price), imageUrl, size });
    }
    localStorage.setItem('lora_wishlist', JSON.stringify(wish));
    updateLayoutBadges();
    location.reload();
};

document.addEventListener('DOMContentLoaded', () => {
    const lBtn = document.getElementById('langToggle');
    if(lBtn) {
        lBtn.addEventListener('click', () => {
            currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
            localStorage.setItem('lora_project_language', currentLanguage);
            runGlobalTranslationsEngine();
        });
    }

    const mToggle = document.getElementById('menuToggle');
    const linksMenu = document.getElementById('navLinks');
    if(mToggle && linksMenu) {
        mToggle.addEventListener('click', () => linksMenu.classList.toggle('open'));
    }

    runGlobalTranslationsEngine();
    updateLayoutBadges();
    pullDynamicStoreMetadata();
});

async function loadIndexGrid() {
    const grid = document.getElementById('featuredProductsContainer');
    if(!grid) return;
    const snapshot = await getDocs(collection(db, "products"));
    let items = [];
    snapshot.forEach(doc => { items.push({ id: doc.id, ...doc.data() }); });
    grid.innerHTML = generateProductCardsMarkup(items);

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const cat = e.target.getAttribute('data-category');
            const filtered = (cat === 'all') ? items : items.filter(i => i.category === cat);
            grid.innerHTML = generateProductCardsMarkup(filtered);
        });
    });
}

if(document.getElementById('featuredProductsContainer')) {
    loadIndexGrid();
}
