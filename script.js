import { db, collection, getDocs, doc, getDoc } from './firebase.js';

// Fully operational unified dictionary configuration mapping arrays
const i18n = {
    en: {
        nav_home: "Home", nav_shop: "Shop", nav_wishlist: "Wishlist", nav_admin: "Admin",
        main_title: "LORA HAUTE PARFUMERIE", main_subtitle: "Exquisite Aromas Crafted For Royalty",
        cart_label: "Cart", cart_hero_title: "Your Shopping Cart", cart_hero_subtitle: "Luxury Awaits Your Final Command",
        summary_title: "Order Summary", coupon_label: "Have a promo code?", coupon_apply: "Apply",
        subtotal_label: "Subtotal", discount_label: "Discount", total_label: "Final Total", checkout_btn: "Proceed To Checkout",
        foot_about: "LORA STORE", foot_about_text: "An elite house of high luxury olfactory sensations.", foot_links: "NAVIGATION", foot_contact: "CONTACT"
    },
    ar: {
        nav_home: "الرئيسية", nav_shop: "المتجر", nav_wishlist: "المفضلة", nav_admin: "الإدارة",
        main_title: "عطور لورا الفاخرة", main_subtitle: "روائح رائعة صنعت للملوك والأمراء",
        cart_label: "السلة", cart_hero_title: "سلة التسوق الخاصة بك", cart_hero_subtitle: "الفخامة في انتظار قرارك الأخير",
        summary_title: "ملخص الطلب", coupon_label: "هل لديك كود خصم؟", coupon_apply: "تطبيق",
        subtotal_label: "المجموع الفرعي", discount_label: "الخصم", total_label: "الإجمالي النهائي", checkout_btn: "المتابعة لإتمام الشراء",
        foot_about: "متجر لورا", foot_about_text: "دار نخبوية لأرقى الأحاسيس العطرية الفاخرة.", foot_links: "روابط سريعة", foot_contact: "اتصل بنا"
    }
};

let currentLang = localStorage.getItem('lora_lang') || 'en';

export function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[currentLang][key]) {
            el.innerText = i18n[currentLang][key];
        }
    });
    if(currentLang === 'ar') {
        document.body.classList.add('rtl');
        document.getElementById('langToggle').innerText = "English";
    } else {
        document.body.classList.remove('rtl');
        document.getElementById('langToggle').innerText = "العربية";
    }
}

export function updateBadges() {
    const cart = JSON.parse(localStorage.getItem('lora_cart') || '[]');
    const wishlist = JSON.parse(localStorage.getItem('lora_wishlist') || '[]');
    
    const cartCountEl = document.getElementById('cartCount');
    const wishlistCountEl = document.getElementById('wishlistCount');
    
    if(cartCountEl) cartCountEl.innerText = cart.reduce((acc, c) => acc + c.qty, 0);
    if(wishlistCountEl) wishlistCountEl.innerText = wishlist.length;
}

export async function fetchStoreSettings() {
    const footerPhone = document.getElementById('footerPhone');
    if(!footerPhone) return;
    try {
        const snap = await getDoc(doc(db, "store", "settings"));
        if(snap.exists() && snap.data().whatsapp) {
            footerPhone.innerText = `WhatsApp: +${snap.data().whatsapp}`;
        } else {
            footerPhone.innerText = `WhatsApp: +971500000000`;
        }
    } catch (e) {
        footerPhone.innerText = `WhatsApp: +971500000000`;
    }
}

// Global Core Infrastructure Pipelines Handler
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('langToggle');
    if(toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'ar' : 'en';
            localStorage.setItem('lora_lang', currentLang);
            applyTranslations();
        });
    }
    applyTranslations();
    updateBadges();
    fetchStoreSettings();
});

// UI Product Cards Generator Module
export function generateProductCardsMarkup(productsArray) {
    return productsArray.map(p => {
        let wishlist = JSON.parse(localStorage.getItem('lora_wishlist') || '[]');
        let isWish = wishlist.some(w => w.id === p.id) ? 'active' : '';
        return `
            <div class="product-card" data-id="${p.id}">
                <div class="card-img-wrapper">
                    <button class="wishlist-toggle ${isWish}" onclick="toggleWishlist('${p.id}', '${p.title.replace(/'/g, "\\'")}', '${p.price}', '${p.imageUrl}')">
                        <i class="fa-solid fa-heart"></i>
                    </button>
                    <a href="product.html?id=${p.id}">
                        <img src="${p.imageUrl}" class="card-img" alt="${p.title}" loading="lazy">
                    </a>
                </div>
                <div class="card-info">
                    <div>
                        <div class="product-brand">${p.brand || 'LORA'}</div>
                        <div class="product-title">${p.title}</div>
                    </div>
                    <div class="price-container">
                        <span class="current-price">${p.price} AED</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-add-cart" onclick="handleAddToCart('${p.id}', '${p.title.replace(/'/g, "\\'")}', '${p.price}', '${p.imageUrl}')">Add To Cart</button>
                    <button class="btn-buy-now" onclick="handleBuyNow('${p.id}', '${p.title.replace(/'/g, "\\'")}', '${p.price}', '${p.imageUrl}')">Buy Now</button>
                </div>
            </div>
        `;
    }).join('');
}

// Global window actions binding to allow execution from templates raw markup lines
window.handleAddToCart = function(id, title, price, imageUrl) {
    let cart = JSON.parse(localStorage.getItem('lora_cart') || '[]');
    let index = cart.findIndex(item => item.id === id);
    if(index > -1) {
        cart[index].qty += 1;
    } else {
        cart.push({ id, title, price: parseFloat(price), imageUrl, qty: 1 });
    }
    localStorage.setItem('lora_cart', JSON.stringify(cart));
    updateBadges();
};

window.handleBuyNow = function(id, title, price, imageUrl) {
    const directItem = { id, title, price: parseFloat(price), imageUrl, qty: 1 };
    localStorage.setItem('direct_checkout_item', JSON.stringify(directItem));
    window.location.href = 'checkout.html?direct=true';
};

window.toggleWishlist = function(id, title, price, imageUrl) {
    let wishlist = JSON.parse(localStorage.getItem('lora_wishlist') || '[]');
    let index = wishlist.findIndex(item => item.id === id);
    if(index > -1) {
        wishlist.splice(index, 1);
    } else {
        wishlist.push({ id, title, price: parseFloat(price), imageUrl });
    }
    localStorage.setItem('lora_wishlist', JSON.stringify(wishlist));
    updateBadges();
    location.reload();
};

async function loadIndexCatalog() {
    const container = document.getElementById('featuredProductsContainer');
    if(!container) return;
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        let products = [];
        querySnapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });
        container.innerHTML = generateProductCardsMarkup(products);
    } catch(e) {
        container.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:red;">Database Connection Offline.</p>`;
    }
}

if(document.getElementById('featuredProductsContainer')) {
    loadIndexCatalog();
}
