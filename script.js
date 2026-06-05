import { db, collection, getDocs, doc, getDoc } from './firebase.js';

// --- INTERNATIONALIZATION SYSTEM ARCHITECTURE ---
const localizationDictionary = {
    en: {
        nav_home: "Home",
        nav_shop: "Shop",
        nav_wishlist: "Wishlist",
        nav_admin: "Admin",
        main_title: "LORA HAUTE PARFUMERIE",
        main_subtitle: "Exquisite Aromas Crafted For Royalty",
        cat_all: "All",
        cat_men: "Men",
        cat_women: "Women",
        cat_unisex: "Unisex",
        foot_about: "LORA STORE",
        foot_about_text: "An elite house of high luxury olfactory sensations.",
        foot_links: "NAVIGATION",
        foot_contact: "CONTACT",
        cart_label: "Cart",
        add_to_cart_btn: "Add To Cart",
        buy_now_btn: "Buy Now",
        cart_hero_title: "Your Shopping Cart",
        cart_hero_subtitle: "Luxury Awaits Your Final Confirmation",
        summary_title: "Order Summary",
        coupon_label: "Have a promo code?",
        coupon_apply: "Apply",
        subtotal_label: "Subtotal",
        discount_label: "Discount",
        total_label: "Final Total",
        checkout_btn: "Proceed To Checkout",
        cart_empty_msg: "Your shopping cart is currently empty.",
        check_hero_title: "Secure Checkout",
        check_hero_subtitle: "Complete your transaction via premium WhatsApp redirection",
        check_shipping_title: "Shipping Details",
        lbl_name: "Full Name *",
        lbl_phone: "Phone Number *",
        lbl_city: "City / Governorate *",
        lbl_address: "Detailed Address *",
        btn_place_order: "Confirm & Order via WhatsApp",
        check_summary_title: "Review Items",
        wish_hero_title: "Your Curated Wishlist",
        wish_hero_subtitle: "Saved premium preferences reserved for your consideration",
        wish_empty: "Your wishlist is empty.",
        adm_hero_title: "Management Hub",
        adm_hero_subtitle: "Control products, promo systems, and settings instantly",
        adm_tab_products: "Products",
        adm_tab_coupons: "Coupons",
        adm_tab_settings: "Global Settings",
        adm_prod_form_title: "Add New Luxury Product",
        lbl_prod_title: "Product Title *",
        lbl_prod_cat: "Category *",
        lbl_prod_price: "Standard Price (EGP) *",
        lbl_prod_disc: "Discount Price (EGP)",
        lbl_prod_size: "Size (ML) *",
        lbl_prod_stock: "Stock Units *",
        lbl_prod_img: "Product Media Image *",
        btn_save_prod: "Save Product",
        btn_cancel: "Cancel",
        adm_prod_list_title: "Existing Catalog",
        th_img: "Image",
        th_title: "Title",
        th_cat: "Category",
        th_size: "Size",
        th_stock: "Stock",
        th_price: "Price",
        th_actions: "Actions",
        adm_coup_form_title: "Create Promo Coupon",
        lbl_coup_code: "Coupon Code *",
        lbl_coup_type: "Deduction Rule *",
        lbl_coup_val: "Deduction Worth *",
        btn_add_coup: "Generate Coupon",
        adm_coup_list_title: "Active Promotional System Rules",
        th_code: "Code",
        th_type: "Type",
        th_val: "Value",
        adm_set_title: "Global Configuration Variables",
        lbl_set_wa: "WhatsApp Redirection Target Number (International Format) *",
        lbl_set_banner: "Storefront Promotional Alert Bar Text",
        btn_save_settings: "Commit Configurations",
        loading: "Curating luxury collection...",
        empty_shop: "No products available in the collection.",
        badge_sold_out: "SOLD OUT",
        warning_low_stock_prefix: "Only",
        warning_low_stock_suffix: "Left"
    },
    ar: {
        nav_home: "الرئيسية",
        nav_shop: "المتجر",
        nav_wishlist: "المفضلة",
        nav_admin: "الإدارة",
        main_title: "عطور لورا الفاخرة",
        main_subtitle: "روائح رائعة صُنعت خصيصاً للملوك",
        cat_all: "الكل",
        cat_men: "رجالي",
        cat_women: "نسائي",
        cat_unisex: "عطور للجنسين",
        foot_about: "متجر لورا",
        foot_about_text: "دار نخبوية لأرقى وأفخم الأحاسيس العطرية الساحرة.",
        foot_links: "تصفح الموقع",
        foot_contact: "اتصل بنا",
        cart_label: "السلة",
        add_to_cart_btn: "إضافة للسلة",
        buy_now_btn: "شراء الآن",
        cart_hero_title: "سلة التسوق الخاصة بك",
        cart_hero_subtitle: "الفخامة في انتظار تأكيدك النهائي",
        summary_title: "ملخص الطلب",
        coupon_label: "هل لديك كود خصم؟",
        coupon_apply: "تطبيق",
        subtotal_label: "المجموع الفرعي",
        discount_label: "الخصم",
        total_label: "الإجمالي النهائي",
        checkout_btn: "الانتقال لإتمام الشراء",
        cart_empty_msg: "سلة التسوق الخاصة بك فارغة حالياً.",
        check_hero_title: "إتمام الشراء الآمن",
        check_hero_subtitle: "أكمل معاملتك عبر التوجيه المباشر للواتساب الفاخر",
        check_shipping_title: "تفاصيل الشحن والتوصيل",
        lbl_name: "الاسم الكامل *",
        lbl_phone: "رقم الهاتف *",
        lbl_city: "المدينة / المحافظة *",
        lbl_address: "العنوان بالتفصيل *",
        btn_place_order: "تأكيد وإرسال الطلب عبر الواتساب",
        check_summary_title: "مراجعة المنتجات",
        wish_hero_title: "قائمة أمنياتك المنسقة",
        wish_hero_subtitle: "تفضيلات فاخرة تم حفظها خصيصاً من أجلك",
        wish_empty: "قائمة أمنياتك فارغة تماماً.",
        adm_hero_title: "مركز التحكم والإدارة",
        adm_hero_subtitle: "تحكم بالمنتجات، القسائم الترويجية، والإعدادات فوراً",
        adm_tab_products: "المنتجات",
        adm_tab_coupons: "قسائم الخصم",
        adm_tab_settings: "الإعدادات العامة",
        adm_prod_form_title: "إضافة منتج فاخر جديد",
        lbl_prod_title: "اسم المنتج *",
        lbl_prod_cat: "التصنيف *",
        lbl_prod_price: "السعر القياسي (جنيه) *",
        lbl_prod_disc: "السعر بعد الخصم (جنيه)",
        lbl_prod_size: "الحجم (مللي) *",
        lbl_prod_stock: "الكمية المتاحة بالمخزن *",
        lbl_prod_img: "صورة المنتج الإعلامية *",
        btn_save_prod: "حفظ المنتج",
        btn_cancel: "إلغاء",
        adm_prod_list_title: "الكتالوج الحالي",
        th_img: "الصورة",
        th_title: "الاسم",
        th_cat: "التصنيف",
        th_size: "الحجم",
        th_stock: "المخزون",
        th_price: "السعر",
        th_actions: "الإجراءات",
        adm_coup_form_title: "إنشاء قسيمة ترويجية",
        lbl_coup_code: "رمز الخصم (الكود) *",
        lbl_coup_type: "قاعدة الخصم *",
        lbl_coup_val: "قيمة الخصم *",
        btn_add_coup: "توليد وإنشاء القسيمة",
        adm_coup_list_title: "قواعد نظام الخصم النشطة",
        th_code: "الكود",
        th_type: "النوع",
        th_val: "القيمة",
        adm_set_title: "متغيرات التكوين العامة للمتجر",
        lbl_set_wa: "رقم الواتساب المستهدف للتوجيه (بصيغة دولية) *",
        lbl_set_banner: "نص شريط الإعلانات الترويجي في الواجهة",
        btn_save_settings: "اعتماد وتطبيق الإعدادات",
        loading: "جاري تحميل وتنسيق المجموعة الفاخرة...",
        empty_shop: "لا توجد منتجات متاحة في المجموعة حالياً.",
        badge_sold_out: "نفذت الكمية",
        warning_low_stock_prefix: "متبقي",
        warning_low_stock_suffix: "قطع فقط"
    }
};

export function runGlobalTranslationsEngine() {
    const currentLang = localStorage.getItem('lora_language') || 'en';
    document.documentElement.lang = currentLang;
    
    if (currentLang === 'ar') {
        document.body.classList.add('rtl-mode');
    } else {
        document.body.classList.remove('rtl-mode');
    }

    const localizableElements = document.querySelectorAll('[data-i18n]');
    localizableElements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (localizationDictionary[currentLang] && localizationDictionary[currentLang][key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.setAttribute('placeholder', localizationDictionary[currentLang][key]);
            } else {
                element.innerText = localizationDictionary[currentLang][key];
            }
        }
    });

    const langToggleBtn = document.getElementById('langToggle');
    if (langToggleBtn) {
        langToggleBtn.innerText = currentLang === 'en' ? 'العربية' : 'English';
    }
}

function handleLanguageToggleClick() {
    const activeLang = localStorage.getItem('lora_language') || 'en';
    const nextLang = activeLang === 'en' ? 'ar' : 'en';
    localStorage.setItem('lora_language', nextLang);
    runGlobalTranslationsEngine();
    
    // Dispatch contextual reload requests to dependent runtime layout scripts if needed
    if (typeof window.fetchAndRenderCatalog === 'function') window.fetchAndRenderCatalog();
}

// --- BADGE SYNCHRONIZATION DATA LAYER ---
export function updateLayoutBadges() {
    const cartList = JSON.parse(localStorage.getItem('lora_cart') || '[]');
    let cartTotalUnitsCount = 0;
    cartList.forEach(item => {
        cartTotalUnitsCount += parseInt(item.quantity || 1);
    });

    const wishlistTotalUnitsCount = JSON.parse(localStorage.getItem('lora_wishlist') || '[]').length;

    const cartBadgeElement = document.getElementById('cartCount');
    const wishlistBadgeElement = document.getElementById('wishlistCount');

    if (cartBadgeElement) cartBadgeElement.innerText = cartTotalUnitsCount;
    if (wishlistBadgeElement) wishlistBadgeElement.innerText = wishlistTotalUnitsCount;
}

// --- FIRESTORE RUNTIME CONFIGURATION LOADING MATRIX ---
export async function pullDynamicStoreMetadata() {
    try {
        const snapshot = await getDoc(doc(db, "settings", "store_config"));
        if (snapshot.exists()) {
            const data = snapshot.data();
            
            // Build permanent alert top banner if configuration context specifies text string
            if (data.promoBanner && data.promoBanner.trim() !== "") {
                injectGlobalPromoTopBanner(data.promoBanner);
            } else {
                const legacyBanner = document.getElementById('globalPromoBanner');
                if (legacyBanner) legacyBanner.remove();
            }

            // Sync structural parameters across footers
            const rawWaStr = data.whatsapp || "201000000000";
            const processedPhoneLabel = document.getElementById('footerPhone');
            if (processedPhoneLabel) {
                processedPhoneLabel.innerHTML = `WhatsApp: <a href="https://wa.me/${rawWaStr.replace(/[^0-9]/g, "")}" target="_blank" style="color:var(--gold-light); text-decoration:none;">${rawWaStr}</a>`;
            }
        }
    } catch (err) {
        console.error("Dynamic global layout metadata intercept exception structural block failure:", err);
    }
}

function injectGlobalPromoTopBanner(messageText) {
    let targetElement = document.getElementById('globalPromoBanner');
    if (!targetElement) {
        targetElement = document.createElement('div');
        targetElement.id = 'globalPromoBanner';
        targetElement.className = 'top-promo-banner';
        document.body.insertBefore(targetElement, document.body.firstChild);
    }
    targetElement.innerText = messageText;
}

// --- CARTS & TRANSACTIONS ENGINES ---
window.addToCartEngine = function(id, inputTitle, price, imageUrl, size, isBase64 = false) {
    const evaluatedTitle = isBase64 ? decodeURIComponent(atob(inputTitle)) : inputTitle;
    let cart = JSON.parse(localStorage.getItem('lora_cart') || '[]');
    
    const existingIndex = cart.findIndex(item => item.id === id);
    if (existingIndex > -1) {
        cart[existingIndex].quantity = parseInt(cart[existingIndex].quantity || 1) + 1;
    } else {
        cart.push({
            id: id,
            title: evaluatedTitle,
            price: parseFloat(price),
            imageUrl: imageUrl,
            size: size,
            quantity: 1
        });
    }

    localStorage.setItem('lora_cart', JSON.stringify(cart));
    alert(`"${evaluatedTitle}" has been added to your cart.`);
    updateLayoutBadges();
};

window.buyNowEngine = function(id, inputTitle, price, imageUrl, size, isBase64 = false) {
    const evaluatedTitle = isBase64 ? decodeURIComponent(atob(inputTitle)) : inputTitle;
    const targetedTransactionItem = {
        id: id,
        title: evaluatedTitle,
        price: parseFloat(price),
        imageUrl: imageUrl,
        size: size,
        quantity: 1
    };

    sessionStorage.setItem('buyNowItem', JSON.stringify(targetedTransactionItem));
    window.location.href = 'checkout.html';
};

// --- FRONT SHOWROOM DYNAMIC HOME CATALOG LOADING ENGINE ---
async function fetchAndRenderHomeShowroomGrid() {
    const container = document.getElementById('featuredProductsContainer');
    if (!container) return;

    try {
        container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; padding: 40px 0; color: var(--gold-dark);" data-i18n="loading">Curating luxury collection...</p>`;
        runGlobalTranslationsEngine();

        const querySnapshot = await getDocs(collection(db, "products"));
        if (querySnapshot.empty) {
            container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; padding: 40px 0; color: var(--gray-muted);" data-i18n="empty_shop">No products available in the collection.</p>`;
            runGlobalTranslationsEngine();
            return;
        }

        window.cachedHomeSnapshotDocsArray = [];
        querySnapshot.forEach(docSnap => {
            window.cachedHomeSnapshotDocsArray.push({ id: docSnap.id, ...docSnap.data() });
        });

        applyHomeShowroomCategoryFiltering('all');
    } catch (err) {
        console.error("Home grid generation runtime captured exception error:", err);
        container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; padding: 40px 0; color: var(--red-alert);">Failed to initialize collection grid.</p>`;
    }
}

function applyHomeShowroomCategoryFiltering(categoryKey) {
    const container = document.getElementById('featuredProductsContainer');
    if (!container || !window.cachedHomeSnapshotDocsArray) return;

    const dataset = categoryKey === 'all' 
        ? window.cachedHomeSnapshotDocsArray 
        : window.cachedHomeSnapshotDocsArray.filter(x => x.category === categoryKey);

    if (dataset.length === 0) {
        container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; padding: 40px 0; color: var(--gray-muted);" data-i18n="empty_shop">No products available in the collection.</p>`;
        runGlobalTranslationsEngine();
        return;
    }

    let htmlPayload = '';
    dataset.forEach(product => {
        const pid = product.id;
        const stockCount = parseInt(product.stock || 0);
        const isOut = stockCount <= 0;
        const isLow = stockCount > 0 && stockCount <= 3;
        
        let stockBannerHtml = '';
        if (isOut) {
            stockBannerHtml = `<div class="sold-out-overlay" data-i18n="badge_sold_out">SOLD OUT</div>`;
        } else if (isLow) {
            stockBannerHtml = `<div class="low-stock-warning-badge"><span data-i18n="warning_low_stock_prefix">Only</span> ${stockCount} <span data-i18n="warning_low_stock_suffix">Left</span></div>`;
        }

        let priceDisplayHtml = '';
        let discountBadgeHtml = '';
        
        if (product.discountPrice && parseFloat(product.discountPrice) < parseFloat(product.price)) {
            const percentSaved = Math.round(((parseFloat(product.price) - parseFloat(product.discountPrice)) / parseFloat(product.price)) * 100);
            discountBadgeHtml = `<div class="discount-badge">${percentSaved}% OFF</div>`;
            priceDisplayHtml = `
                <span class="current-price">${product.discountPrice} EGP</span>
                <span class="old-price">${product.price} EGP</span>
            `;
        } else {
            priceDisplayHtml = `<span class="current-price">${product.price} EGP</span>`;
        }

        const encodedTitle = btoa(encodeURIComponent(product.title));
        const targetedPrice = product.discountPrice && parseFloat(product.discountPrice) < parseFloat(product.price) ? product.discountPrice : product.price;

        let wishlist = JSON.parse(localStorage.getItem('lora_wishlist') || '[]');
        const isInWishlist = wishlist.some(item => item.id === pid);
        const heartIconClass = isInWishlist ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        const heartColorStyle = isInWishlist ? 'color: var(--red-alert);' : '';

        htmlPayload += `
            <div class="product-card">
                <div class="product-img-wrapper">
                    ${stockBannerHtml}
                    ${discountBadgeHtml}
                    <a href="product.html?id=${pid}">
                        <img src="${product.imageUrl}" class="product-img" alt="${product.title}">
                    </a>
                    <button class="wishlist-btn" style="${heartColorStyle}" onclick="toggleHomeWishlist('${pid}', '${encodedTitle}', ${parseFloat(targetedPrice)}, '${product.imageUrl}', '${product.size || '100'}')">
                        <i class="${heartIconClass}"></i>
                    </button>
                </div>
                <div class="product-details">
                    <a href="product.html?id=${pid}" style="text-decoration:none; color:inherit;">
                        <h3 class="product-title">${product.title}</h3>
                    </a>
                    <p class="product-meta">${product.size || '100'} ML</p>
                    <div class="price-container">
                        ${priceDisplayHtml}
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        <button class="card-btn" style="flex: 1; background: transparent; color: var(--charcoal); border: 1px solid var(--charcoal);" ${isOut ? 'disabled' : ''} onclick="window.addToCartEngine('${pid}', '${encodedTitle}', ${parseFloat(targetedPrice)}, '${product.imageUrl}', '${product.size || '100'}', true)">Add To Cart</button>
                        <button class="card-btn" style="flex: 1;" ${isOut ? 'disabled' : ''} onclick="window.buyNowEngine('${pid}', '${encodedTitle}', ${parseFloat(targetedPrice)}, '${product.imageUrl}', '${product.size || '100'}', true)">Buy Now</button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = htmlPayload;
    runGlobalTranslationsEngine();
}

window.toggleHomeWishlist = function(id, base64Title, price, imageUrl, size) {
    const rawTitle = decodeURIComponent(atob(base64Title));
    let wishlist = JSON.parse(localStorage.getItem('lora_wishlist') || '[]');
    const currentIdx = wishlist.findIndex(item => item.id === id);

    if (currentIdx > -1) {
        wishlist.splice(currentIdx, 1);
        alert(`${rawTitle} removed from wishlist.`);
    } else {
        wishlist.push({ id, title: rawTitle, price, imageUrl, size });
        alert(`${rawTitle} added to wishlist.`);
    }

    localStorage.setItem('lora_wishlist', JSON.stringify(wishlist));
    updateLayoutBadges();
    
    const activeTab = document.querySelector('.tab-btn.active');
    const currentCatKey = activeTab ? activeTab.getAttribute('data-category') : 'all';
    applyHomeShowroomCategoryFiltering(currentCatKey);
};

function initTabsLayoutBinds() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const targetCategory = tab.getAttribute('data-category');
            applyHomeShowroomCategoryFiltering(targetCategory);
        });
    });
}

// --- SYSTEM BOOTSTRAPPING ENGINE ---
document.addEventListener('DOMContentLoaded', () => {
    runGlobalTranslationsEngine();
    updateLayoutBadges();
    pullDynamicStoreMetadata();
    fetchAndRenderHomeShowroomGrid();
    initTabsLayoutBinds();

    const toggleLangBtn = document.getElementById('langToggle');
    if (toggleLangBtn) {
        toggleLangBtn.addEventListener('click', handleLanguageToggleClick);
    }

    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });
    }
});
