import { db, doc, getDoc, setDoc, onSnapshot } from "./firebase.js";

const AppState = {
    lang: localStorage.getItem("lora_lang") || "en",
    whatsappNumber: "01208711729"
};

const Dictionary = {
    en: {
        navHome: "Home", navProducts: "Fragrances", navWishlist: "Wishlist", navAdmin: "Atelier Vault",
        promoText: "Exclusive Discounts & Special Offers", mensTitle: "MEN'S COLLECTION", womensTitle: "WOMEN'S COLLECTION",
        searchPlaceholder: "Search parameters...", addToCart: "Add to Bag", soldOut: "SOLD OUT",
        cartTitle: "Your Shopping Trunk", totalVal: "Total Cost", checkoutBtn: "Proceed to Checkout",
        shippingInfo: "Shipping Information", fullName: "Full Name", phoneNumber: "Phone Number",
        cityName: "City", fullAddress: "Address", orderNotes: "Order Notes (Optional)",
        executeCheckout: "Confirm Order via WhatsApp", orderSummary: "Order Summary",
        subtotal: "Subtotal", couponCode: "Have a coupon?", navBackToCart: "Return to Bag",
        wishlistTitle: "Your Curated Desires"
    },
    ar: {
        navHome: "الرئيسية", navProducts: "العطور", navWishlist: "الأمنيات", navAdmin: "منصة الإدارة",
        promoText: "خصومات وعروض حصرية", mensTitle: "مجموعة العطور الرجالية", womensTitle: "مجموعة العطور النسائية",
        searchPlaceholder: "ابحث في المجموعات...", addToCart: "إضافة للحقيبة", soldOut: "نفذت الكمية",
        cartTitle: "حقيبة المقتنيات", totalVal: "إجمالي التكلفة", checkoutBtn: "الاستمرار لتأكيد الطلب",
        shippingInfo: "بيانات الشحن والتوصيل", fullName: "الاسم الكامل", phoneNumber: "رقم الهاتف",
        cityName: "المدينة", fullAddress: "العنوان بالتفصيل", orderNotes: "ملاحظات إضافية (اختياري)",
        executeCheckout: "تأكيد الطلب عبر الواتساب", orderSummary: "ملخص الطلب",
        subtotal: "المجموع الفرعي", couponCode: "لديك كود خصم؟", navBackToCart: "العودة للحقيبة",
        wishlistTitle: "قائمة أمنياتك المنسقة"
    }
};

const Cart = {
    get: () => JSON.parse(localStorage.getItem("lora_cart")) || [],
    save: (items) => {
        localStorage.setItem("lora_cart", JSON.stringify(items));
        document.dispatchEvent(new CustomEvent("cartUpdated"));
    },
    add: (product, imageEl) => {
        let items = Cart.get();
        const existing = items.find(i => i.id === product.id);
        const hasDisc = product.discountPrice && parseFloat(product.discountPrice) < parseFloat(product.price);
        const finalPrice = hasDisc ? product.discountPrice : product.price;

        if (existing) {
            existing.qty = parseInt(existing.qty) + 1;
        } else {
            items.push({
                id: product.id,
                nameEn: product.nameEn,
                nameAr: product.nameAr,
                price: finalPrice,
                image: product.image,
                size: product.size || "100",
                qty: 1
            });
        }
        
        if (imageEl) {
            const target = document.getElementById("globalCartAnchor");
            if (target) {
                const rect = imageEl.getBoundingClientRect();
                const targetRect = target.getBoundingClientRect();
                
                const clone = imageEl.cloneNode();
                clone.className = "animating-product-node";
                clone.style.top = `${rect.top + window.scrollY}px`;
                clone.style.left = `${rect.left + window.scrollX}px`;
                clone.style.width = `${rect.width}px`;
                clone.style.height = `${rect.height}px`;
                
                const xDist = targetRect.left - rect.left;
                const yDist = targetRect.top - rect.top;
                
                clone.style.setProperty("--x", `${xDist}px`);
                clone.style.setProperty("--y", `${yDist}px`);
                clone.style.animation = "flyToCart 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards";
                
                document.body.appendChild(clone);
                setTimeout(() => clone.remove(), 800);
            }
        }

        Cart.save(items);
        UI.toast(AppState.lang === 'en' ? "Fragrance allocated inside shopping trunk." : "تم إضافة المقتنى للحقيبة بنجاح.");
    },
    remove: (id) => {
        let items = Cart.get().filter(i => i.id !== id);
        Cart.save(items);
    },
    updateQty: (id, qty) => {
        let items = Cart.get();
        const existing = items.find(i => i.id === id);
        if (existing) {
            existing.qty = parseInt(qty);
            Cart.save(items);
        }
    }
};

const Wishlist = {
    get: () => JSON.parse(localStorage.getItem("lora_wish")) || [],
    has: (id) => Wishlist.get().includes(id),
    toggle: (id) => {
        let items = Wishlist.get();
        if (items.includes(id)) {
            items = items.filter(i => i !== id);
            UI.toast(AppState.lang === 'en' ? "Removed from curation registry." : "تم الحذف من قائمة الأمنيات المنسقة.");
        } else {
            items.push(id);
            UI.toast(AppState.lang === 'en' ? "Saved inside desires manifest." : "تم الحفظ في قائمة الرغبات.");
        }
        localStorage.setItem("lora_wish", JSON.stringify(items));
        document.dispatchEvent(new CustomEvent("wishlistUpdated"));
        UI.syncBadges();
    }
};

const UI = {
    localizeDOM: () => {
        const root = document.documentElement;
        root.setAttribute("lang", AppState.lang);
        root.setAttribute("dir", AppState.lang === 'ar' ? 'rtl' : 'ltr');
        document.body.setAttribute("dir", AppState.lang === 'ar' ? 'rtl' : 'ltr');

        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (Dictionary[AppState.lang][key]) el.innerText = Dictionary[AppState.lang][key];
        });
        document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
            const key = el.getAttribute("data-i18n-placeholder");
            if (Dictionary[AppState.lang][key]) el.setAttribute("placeholder", Dictionary[AppState.lang][key]);
        });
        
        const langToggle = document.getElementById("globalLangToggle");
        if (langToggle) langToggle.innerText = AppState.lang === 'en' ? "العربية" : "English";
    },
    syncBadges: () => {
        const cBadge = document.getElementById("cartBadgeCount");
        const wBadge = document.getElementById("wishlistBadgeCount");
        
        if (cBadge) cBadge.innerText = Cart.get().reduce((sum, i) => sum + parseInt(i.qty), 0);
        if (wBadge) wBadge.innerText = Wishlist.get().length;
    },
    toast: (msg) => {
        const stack = document.getElementById("toastContainerStack");
        if (!stack) return;
        const node = document.createElement("div");
        node.className = "toast-node";
        node.innerText = msg;
        stack.appendChild(node);
        setTimeout(() => {
            node.style.animation = "slideInUp 0.4s reverse ease forwards";
            setTimeout(() => node.remove(), 400);
        }, 3000);
    },
    renderProductCards: (list, targetNode) => {
        targetNode.innerHTML = "";
        const activeWishList = Wishlist.get();
        
        list.forEach(p => {
            const isWish = activeWishList.includes(p.id);
            const isSoldOut = parseInt(p.stock || 0) === 0;
            const isLowStock = !isSoldOut && parseInt(p.stock || 0) <= 3;
            const hasDisc = p.discountPrice && parseFloat(p.discountPrice) < parseFloat(p.price);
            
            let pricingBlock = "";
            if (isSoldOut) {
                pricingBlock = `<span class="text-sm font-bold text-neutral-400 line-through font-mono">${p.price} EGP</span>`;
            } else if (hasDisc) {
                pricingBlock = `
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-bold text-neutral-900 font-mono">${p.discountPrice} EGP</span>
                        <span class="text-xs text-neutral-400 line-through font-mono">${p.price} EGP</span>
                    </div>
                `;
            } else {
                pricingBlock = `<span class="text-sm font-bold text-neutral-900 font-mono">${p.price} EGP</span>`;
            }

            let badgeBlock = "";
            if (isSoldOut) {
                badgeBlock = `<span class="absolute top-3 left-3 bg-neutral-900 text-white text-[9px] tracking-widest uppercase px-2 py-0.5 font-sans z-10">${AppState.lang === 'en' ? 'SOLD OUT' : 'نفذت الكمية'}</span>`;
            } else if (hasDisc) {
                const pct = Math.round(((parseFloat(p.price) - parseFloat(p.discountPrice)) / parseFloat(p.price)) * 100);
                badgeBlock = `<span class="absolute top-3 left-3 bg-red-600 text-white text-[9px] tracking-widest uppercase px-2 py-0.5 font-sans z-10">-${pct}%</span>`;
            }

            let stockWarningHTML = "";
            if (isLowStock) {
                stockWarningHTML = `<p class="text-[10px] font-bold text-amber-600 font-sans mt-0.5">${AppState.lang === 'en' ? `Only ${p.stock} left` : `متبقي ${p.stock} فقط`}</p>`;
            }

            const card = document.createElement("div");
            card.className = "lux-card p-4 flex flex-col justify-between h-full group";
            card.innerHTML = `
                <div class="relative">
                    ${badgeBlock}
                    <button class="wish-toggle-btn absolute top-3 right-3 bg-white/80 hover:bg-white text-neutral-900 w-8 h-8 rounded-full flex items-center justify-center shadow-sm z-10 transition duration-300">
                        <svg class="w-4 h-4 ${isWish ? 'text-red-600 fill-red-600' : 'text-neutral-600'}" fill="${isWish ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                    </button>
                    <a href="product.html?id=${p.id}" class="block overflow-hidden bg-neutral-50 mb-4 border border-neutral-100/50">
                        <img src="${p.image}" class="w-full h-72 sm:h-80 object-cover transition-transform duration-700 group-hover:scale-105 card-img-node">
                    </a>
                    <a href="product.html?id=${p.id}" class="block group-hover:text-amber-600 transition-colors">
                        <h4 class="text-base font-light tracking-wide text-neutral-900 mb-0.5">${AppState.lang === 'en' ? p.nameEn : p.nameAr}</h4>
                    </a>
                    <p class="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">${p.size || '100'}ml // ${p.category}</p>
                    ${stockWarningHTML}
                </div>
                <div class="flex items-center justify-between pt-4 mt-4 border-t border-neutral-100">
                    ${pricingBlock}
                    <button ${isSoldOut ? 'disabled' : ''} class="add-to-cart-direct-btn text-[10px] tracking-widest uppercase bg-neutral-900 text-white font-medium px-3 py-2 hover:bg-amber-500 hover:text-black transition duration-300 disabled:opacity-40 disabled:hover:bg-neutral-900 disabled:hover:text-white">
                        ${AppState.lang === 'en' ? 'Add' : 'إضافة'}
                    </button>
                </div>
            `;

            card.querySelector(".wish-toggle-btn").addEventListener("click", () => Wishlist.toggle(p.id));
            if (!isSoldOut) {
                card.querySelector(".add-to-cart-direct-btn").addEventListener("click", () => {
                    Cart.add(p, card.querySelector(".card-img-node"));
                });
            }

            targetNode.appendChild(card);
        });

        UI.localizeDOM();
    },

    renderStandalonePage: (p, targetNode) => {
        const hasDisc = p.discountPrice && parseFloat(p.discountPrice) < parseFloat(p.price);
        const isSoldOut = parseInt(p.stock || 0) === 0;
        const isLowStock = !isSoldOut && parseInt(p.stock || 0) <= 3;
        
        let priceHTML = "";
        if (isSoldOut) {
            priceHTML = `<span class="text-2xl font-bold text-neutral-400 line-through font-mono">${p.price} EGP</span>`;
        } else if (hasDisc) {
            const pct = Math.round(((parseFloat(p.price) - parseFloat(p.discountPrice)) / parseFloat(p.price)) * 100);
            priceHTML = `
                <div class="flex items-center gap-4">
                    <span class="text-2xl font-bold text-neutral-900 font-mono">${p.discountPrice} EGP</span>
                    <span class="text-sm text-neutral-400 line-through font-mono">${p.price} EGP</span>
                    <span class="bg-red-600 text-white text-[10px] tracking-widest uppercase px-2 py-0.5 font-sans">-${pct}%</span>
                </div>
            `;
        } else {
            priceHTML = `<span class="text-2xl font-bold text-neutral-900 font-mono">${p.price} EGP</span>`;
        }

        let statusHTML = "";
        if (isSoldOut) {
            statusHTML = `<p class="text-xs uppercase tracking-widest font-bold text-red-600 font-sans">${AppState.lang === 'en' ? 'SOLD OUT' : 'نفذت الكمية'}</p>`;
        } else if (isLowStock) {
            statusHTML = `<p class="text-xs uppercase tracking-widest font-bold text-amber-600 font-sans">${AppState.lang === 'en' ? `Only ${p.stock} left` : `متبقي ${p.stock} فقط`}</p>`;
        }

        targetNode.innerHTML = `
            <div class="bg-neutral-50 border border-neutral-100 p-4 relative">
                <img id="focusProfileImg" src="${p.image}" class="w-full h-auto max-h-[550px] object-cover mx-auto">
            </div>
            <div class="space-y-6 pt-4">
                <div class="space-y-1">
                    <span class="text-xs tracking-widest uppercase text-amber-600 font-bold font-mono">${p.category} // Collection</span>
                    <h1 class="text-3xl sm:text-4xl font-light text-neutral-900">${AppState.lang === 'en' ? p.nameEn : p.nameAr}</h1>
                    <p class="text-xs font-mono text-neutral-400">${p.size || '100'}ml</p>
                </div>
                
                <div class="py-2 border-t border-b border-neutral-100">
                    ${priceHTML}
                </div>

                ${statusHTML}

                <p class="text-sm text-neutral-600 font-sans leading-relaxed pt-2">${AppState.lang === 'en' ? p.descEn : p.descAr}</p>
                
                <div class="pt-6 flex flex-col sm:flex-row gap-4">
                    <button id="profileMainActionBtn" ${isSoldOut ? 'disabled' : ''} class="lux-btn flex-1 py-4 text-xs tracking-widest disabled:opacity-40">Add to Bag</button>
                    <button id="profileWishlistToggleActionBtn" class="border border-neutral-200 hover:border-neutral-900 p-4 transition-colors flex items-center justify-center">
                        <svg id="profileHeartIcon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                    </button>
                </div>
            </div>
        `;

        UI.localizeDOM();
        
        const btnHeart = document.getElementById("profileHeartIcon");
        const updateHeart = () => {
            if (Wishlist.has(p.id)) {
                btnHeart.setAttribute("fill", "#bc2c2c");
                btnHeart.setAttribute("stroke", "#bc2c2c");
            } else {
                btnHeart.setAttribute("fill", "none");
                btnHeart.setAttribute("stroke", "currentColor");
            }
        };
        updateHeart();

        document.getElementById("profileWishlistToggleActionBtn").addEventListener("click", () => {
            Wishlist.toggle(p.id);
            updateHeart();
        });

        if (!isSoldOut) {
            document.getElementById("profileMainActionBtn").addEventListener("click", () => {
                Cart.add(p, document.getElementById("focusProfileImg"));
            });
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    onSnapshot(doc(db, "settings", "config_ledger"), (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.data();
            if (data.whatsappNumber) AppState.whatsappNumber = data.whatsappNumber;
        } else {
            setDoc(doc(db, "settings", "config_ledger"), { whatsappNumber: "01208711729" });
        }
    });

    const switcher = document.getElementById("globalLangToggle");
    if (switcher) {
        switcher.addEventListener("click", () => {
            AppState.lang = AppState.lang === 'en' ? 'ar' : 'en';
            localStorage.setItem("lora_lang", AppState.lang);
            UI.localizeDOM();
            window.location.reload();
        });
    }

    const burger = document.getElementById("mobileNavTrigger");
    const expandedPane = document.getElementById("mobileExpandedNavPane");
    if (burger && expandedPane) {
        burger.addEventListener("click", () => {
            burger.classList.toggle("mobile-menu-active");
            expandedPane.classList.toggle("hidden");
        });
    }

    document.addEventListener("cartUpdated", () => UI.syncBadges());
    document.addEventListener("wishlistUpdated", () => UI.syncBadges());
    
    UI.localizeDOM();
    UI.syncBadges();
});

export { AppState, Cart, Wishlist, UI };
