/**
 * LORA - Production Level Architecture Engine
 * Verified and Fixed Permanent Data Persistence Layer
 */

const EXCHANGE_RATE = 50.00;

// Universal Interface Matrix Translation Engine
const TRANSLATION_MATRIX = {
    en: {
        nav_home: "Home",
        nav_collection: "Collection",
        nav_women: "Women Line",
        nav_men: "Men Line",
        hero_sub: "HAUTE PARFUMERIE",
        hero_title: "Luxury Perfume Collection",
        hero_desc: "Discover premium fragrances for men and women.",
        hero_cta: "Shop Now",
        hero_promo_text: "Exclusive Discounts & Special Offers",
        featured_title: "The Curated Masterpieces",
        footer_rights: "All Rights Reserved.",
        catalog_header: "The Master Collection",
        catalog_subheader: "Pure extracts, timeless definitions",
        filter_cat: "Category",
        filter_avail: "Availability",
        filter_price: "Price Sequence",
        filter_discount_only: "Discounted Products Only",
        opt_all_cats: "All Classifications",
        opt_women: "Women Line",
        opt_men: "Men Line",
        opt_all_avail: "All Statuses",
        opt_default_sort: "Standard Reference",
        opt_low_high: "Low To High",
        opt_high_low: "High To Low",
        in_stock: "In Stock",
        low_stock: "Low Stock",
        sold_out: "Sold Out",
        search_placeholder: "Search our delicate formulations...",
        no_results: "No exquisite formulations found matching criteria.",
        btn_add_cart: "Add To Cart",
        btn_buy_now: "Buy Now",
        cart_title: "Your Order Cart",
        summary_header: "Summary",
        subtotal_label: "Subtotal",
        shipping_label: "Shipping",
        shipping_value: "Complimentary",
        coupon_field_lbl: "Apply Coupon Code",
        coupon_placeholder: "Enter Code",
        btn_apply: "Apply",
        total_due_lbl: "Total Due",
        btn_proceed: "Proceed to Logistics",
        cart_empty: "Your selection is currently empty.",
        btn_remove: "Remove",
        delivery_matrix_hdr: "Delivery Matrix",
        lbl_name: "Full Name",
        lbl_phone: "Phone Contact",
        lbl_country: "Country Zone",
        lbl_gov: "Governorate",
        lbl_city: "City / District",
        lbl_address: "Residential Address Line",
        lbl_notes: "Order Notes (Optional)",
        opt_select_gov: "Select Governorate",
        btn_submit_order: "Authorize Order & Route via WhatsApp"
    },
    ar: {
        nav_home: "الرئيسية",
        nav_collection: "المجموعة الكاملة",
        nav_women: "التشكيلة النسائية",
        nav_men: "التشكيلة الرجالية",
        hero_sub: "دار العطور الفاخرة",
        hero_title: "مجموعة العطور الفاخرة",
        hero_desc: "اكتشف العطور الاستثنائية المصممة للرجال والنساء.",
        hero_cta: "تسوق الآن",
        hero_promo_text: "خصومات وعروض حصرية",
        featured_title: "روائع عطرية مختارة",
        footer_rights: "جميع الحقوق محفوظة.",
        catalog_header: "المجموعة العطرية الشاملة",
        catalog_subheader: "خلاصات نقية، تعيد تعريف الفخامة",
        filter_cat: "الفئة",
        filter_avail: "حالة التوفر",
        filter_price: "ترتيب الأسعار",
        filter_discount_only: "المنتجات المشمولة بالخصم فقط",
        opt_all_cats: "جميع الفئات",
        opt_women: "التشكيلة النسائية",
        opt_men: "التشكيلة الرجالية",
        opt_all_avail: "جميع الحالات",
        opt_default_sort: "الترتيب الافتراضي",
        opt_low_high: "من الأقل للأعلى",
        opt_high_low: "من الأعلى للأقل",
        in_stock: "متوفر",
        low_stock: "كمية محدودة",
        sold_out: "نفدت الكمية",
        search_placeholder: "ابحث عن تركيباتنا العطرية النادرة...",
        no_results: "لم نجد أي نتائج تطابق خيارات البحث الحالية.",
        btn_add_cart: "إضافة للعربة",
        btn_buy_now: "شراء الآن",
        cart_title: "عربة التسوق الخاصة بك",
        summary_header: "ملخص الطلب",
        subtotal_label: "المجموع الفرعي",
        shipping_label: "الشحن والوجيستيات",
        shipping_value: "شحن مجاني فاخر",
        coupon_field_lbl: "تطبيق كود الخصم",
        coupon_placeholder: "أدخل رمز الخصم",
        btn_apply: "تفعيل",
        total_due_lbl: "الإجمالي النهائي",
        btn_proceed: "الانتقال لبيانات الشحن",
        cart_empty: "عربة التسوق فارغة حالياً.",
        btn_remove: "إزالة",
        delivery_matrix_hdr: "مصفوفة الشحن والتوصيل",
        lbl_name: "الاسم بالكامل",
        lbl_phone: "رقم الهاتف للتواصل",
        lbl_country: "الدولة",
        lbl_gov: "المحافظة",
        lbl_city: "المدينة / المنطقة",
        lbl_address: "العنوان السكني بالتفصيل",
        lbl_notes: "ملاحظات إضافية (اختياري)",
        opt_select_gov: "اختر محافظة الشحن",
        btn_submit_order: "تأكيد الطلب والتوجيه للواتساب"
    }
};

// Initial Default Catalog Seeds (Used ONLY if storage is perfectly empty)
const PRODUCTION_FACTORY_PRODUCTS = [
    {
        id: "SKU-OR-LUXE",
        name: "Élixir d'Or",
        bottleSize: "100ML",
        image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80",
        price: 180.00,
        discount: 15,
        stockStatus: "In Stock",
        description: "An exceptional extraction anchored in Damask absolute, combined with threads of rare clean leather and warm golden honey notes.",
        category: "Women"
    },
    {
        id: "SKU-NUIT-IMP",
        name: "Nuit Impériale",
        bottleSize: "100ML",
        image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80",
        price: 210.00,
        discount: 0,
        stockStatus: "Low Stock",
        description: "A commanding masculine configuration of pure Calabrian bergamot, crisp cedarwood layers, and deep smoky Haitian vetiver.",
        category: "Men"
    },
    {
        id: "SKU-OPUS-MAG",
        name: "Opus Magnolia",
        bottleSize: "50ML",
        image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80",
        price: 140.00,
        discount: 0,
        stockStatus: "In Stock",
        description: "A velvet-soft cloud composition derived from local jasmines, white spring magnolias, and fresh morning citrus peel.",
        category: "Women"
    },
    {
        id: "SKU-OUD-NOIR",
        name: "Oud Noir Absolute",
        bottleSize: "150ML",
        image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80",
        price: 260.00,
        discount: 20,
        stockStatus: "Sold Out",
        description: "Enigmatic, deep dark woods crafted carefully with heavy amber layers, patchouli oils, and traditional natural resin musk.",
        category: "Men"
    }
];

// CRITICAL DATA PERSISTENCE COMPLIANCE CHECK
function initApp() {
    // If local database key exists, we NEVER wipe or overwrite it with factory state
    if (localStorage.getItem('lora_products') === null) {
        localStorage.setItem('lora_products', JSON.stringify(PRODUCTION_FACTORY_PRODUCTS));
    }
    if (localStorage.getItem('lora_cart') === null) {
        localStorage.setItem('lora_cart', JSON.stringify([]));
    }
    if (localStorage.getItem('lora_coupons') === null) {
        localStorage.setItem('lora_coupons', JSON.stringify([
            { code: "LORA10", percentage: 10, active: true },
            { code: "ROYAL30", percentage: 30, active: true }
        ]));
    }
    if (localStorage.getItem('lora_lang') === null) {
        localStorage.setItem('lora_lang', 'en');
    }
}

function getCurrentLang() {
    return localStorage.getItem('lora_lang') || 'en';
}

function toggleLanguageSystem() {
    const current = getCurrentLang();
    const target = current === 'en' ? 'ar' : 'en';
    localStorage.setItem('lora_lang', target);
    window.location.reload();
}

function applyLanguageDOM() {
    const lang = getCurrentLang();
    const dictionary = TRANSLATION_MATRIX[lang];
    const body = document.body;

    if (lang === 'ar') {
        body.classList.add('rtl-mode');
        document.documentElement.dir = 'rtl';
        const langBtn = document.getElementById('lang-btn');
        if (langBtn) langBtn.innerText = 'English';
    } else {
        body.classList.remove('rtl-mode');
        document.documentElement.dir = 'ltr';
        const langBtn = document.getElementById('lang-btn');
        if (langBtn) langBtn.innerText = 'العربية';
    }

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (dictionary[key]) {
            element.innerText = dictionary[key];
        }
    });

    document.querySelectorAll('[data-i18n-holder]').forEach(element => {
        const key = element.getAttribute('data-i18n-holder');
        if (dictionary[key]) {
            element.setAttribute('placeholder', dictionary[key]);
        }
    });
}

// SAFE DATABASE ACQUISITION FRAMEWORK
function getProducts() {
    return JSON.parse(localStorage.getItem('lora_products')) || [];
}

function getCart() {
    return JSON.parse(localStorage.getItem('lora_cart')) || [];
}

function calculateFinalPrice(usdPrice, discountPercentage) {
    const baseEgp = parseFloat(usdPrice) * EXCHANGE_RATE;
    const discount = parseInt(discountPercentage || 0);
    if (discount > 0) {
        return baseEgp - (baseEgp * (discount / 100));
    }
    return baseEgp;
}

function createProductCard(product) {
    const finalEgp = calculateFinalPrice(product.price, product.discount);
    const originalEgp = parseFloat(product.price) * EXCHANGE_RATE;
    const parsedDiscount = parseInt(product.discount || 0);
    const stockStatus = product.stockStatus || 'In Stock';
    const isSoldOut = stockStatus === 'Sold Out';
    const lang = getCurrentLang();

    let badgeHtml = parsedDiscount > 0 ? `<div class="discount-badge">-${parsedDiscount}%</div>` : '';
    let priceHtml = parsedDiscount > 0 
        ? `<span class="price"><span class="original-strike">${originalEgp.toFixed(0)} EGP</span>${finalEgp.toFixed(0)} EGP</span>`
        : `<span class="price">${finalEgp.toFixed(0)} EGP</span>`;

    let stockClass = 'badge-stock-in';
    let rawStockKey = 'in_stock';
    if (stockStatus === 'Low Stock') { stockClass = 'badge-stock-low'; rawStockKey = 'low_stock'; }
    if (stockStatus === 'Sold Out') { stockClass = 'badge-stock-out'; rawStockKey = 'sold_out'; }

    const stockLabelTranslated = TRANSLATION_MATRIX[lang][rawStockKey] || stockStatus;
    const btnCartText = TRANSLATION_MATRIX[lang]['btn_add_cart'];
    const btnBuyText = TRANSLATION_MATRIX[lang]['btn_buy_now'];

    const disabledAttr = isSoldOut ? 'disabled style="opacity:0.35; pointer-events:none;"' : '';

    return `
        <div class="product-card">
            ${badgeHtml}
            <div style="cursor:pointer;" onclick="window.location.href='product.html?id=${product.id}'">
                <div class="product-card-img-wrapper">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:0.5rem;">
                    <span class="product-stock-badge ${stockClass}">${stockLabelTranslated}</span>
                    <span class="product-size-badge">${product.bottleSize || '100ML'}</span>
                </div>
                <span class="category-tag">Maison ${product.category}</span>
                <h3>${product.name}</h3>
            </div>
            <div>
                ${priceHtml}
                <div class="product-card-buttons-group">
                    <button class="btn-cart" onclick="directInlineCartAdd('${product.id}')" ${disabledAttr}>${btnCartText}</button>
                    <button class="btn-buy" onclick="directInlineBuyNow('${product.id}')" ${disabledAttr}>${btnBuyText}</button>
                </div>
            </div>
        </div>
    `;
}

function showToastNotification(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => { toast.remove(); });
    }, 2800);
}

function directInlineCartAdd(id) {
    const isAr = getCurrentLang() === 'ar';
    addToCart(id, 1);
    showToastNotification(isAr ? "✓ تم إضافة المنتج لعربة التسوق" : "✓ Product added to cart");
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
        if (cart[idx].quantity <= 0) {
            cart.splice(idx, 1);
        }
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
