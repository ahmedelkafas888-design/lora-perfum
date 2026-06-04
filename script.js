import { firestoreService } from "./firebase.js";

// Global Runtime State Controller for the LORA Luxury Ecosystem
const LoraApp = {
    state: {
        lang: localStorage.getItem("lora_brand_lang") || "en",
        cart: JSON.parse(localStorage.getItem("lora_brand_cart")) || [],
        wishlist: JSON.parse(localStorage.getItem("lora_brand_wishlist")) || [],
        whatsappNumber: "01208711729" // Built-in active fallback, overwritten instantly dynamically via Firestore
    },

    async init() {
        this.applyLanguageConfigurationDOMState();
        this.bindCoreGlobalAppEvents();
        this.synchronizeBadgeMetrics();
        await this.syncStoreGlobalSettingsState();
    },

    async syncStoreGlobalSettingsState() {
        try {
            const settings = await firestoreService.fetchDocument("settings", "config_ledger");
            if (settings && settings.whatsappNumber) {
                this.state.whatsappNumber = settings.whatsappNumber;
            } else {
                // Initialize default permanent document container configuration if missing inside live project setup data footprint
                await firestoreService.setDocumentExplicit("settings", "config_ledger", { whatsappNumber: "01208711729" });
            }
        } catch (err) {
            console.warn("Unable to fetch Firestore system setup settings matrix dynamically. Retaining active state parameters configuration context:", err);
        }
    },

    applyLanguageConfigurationDOMState() {
        const root = document.documentElement;
        root.setAttribute("lang", this.state.lang);
        if (this.state.lang === "ar") {
            root.setAttribute("dir", "rtl");
            document.body.setAttribute("dir", "rtl");
        } else {
            root.setAttribute("dir", "ltr");
            document.body.setAttribute("dir", "ltr");
        }

        document.querySelectorAll("[data-i18n]").forEach(element => {
            const key = element.getAttribute("data-i18n");
            if (this.dictionary[this.state.lang][key]) {
                element.innerText = this.dictionary[this.state.lang][key];
            }
        });

        document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
            const key = element.getAttribute("data-i18n-placeholder");
            if (this.dictionary[this.state.lang][key]) {
                element.setAttribute("placeholder", this.dictionary[this.state.lang][key]);
            }
        });
    },

    switchActiveLanguageState() {
        this.state.lang = this.state.lang === "en" ? "ar" : "en";
        localStorage.setItem("lora_brand_lang", this.state.lang);
        this.applyLanguageConfigurationDOMState();
        window.location.reload();
    },

    bindCoreGlobalAppEvents() {
        const structuralSwitcherBtn = document.getElementById("langSwitcherBtn");
        if (structuralSwitcherBtn) {
            structuralSwitcherBtn.addEventListener("click", () => this.switchActiveLanguageState());
        }
    },

    synchronizeBadgeMetrics() {
        const cBadge = document.getElementById("cartCountBadge");
        const wBadge = document.getElementById("wishlistCountBadge");
        if (cBadge) cBadge.innerText = this.state.cart.reduce((total, item) => total + item.qty, 0);
        if (wBadge) wBadge.innerText = this.state.wishlist.length;
    },

    dispatchNotificationToast(msgStringTextKey) {
        const targetToastNode = document.getElementById("globalLoraSystemNotificationToast");
        if (targetToastNode) {
            targetToastNode.innerText = this.dictionary[this.state.lang][msgStringTextKey] || msgStringTextKey;
            targetToastNode.style.display = "block";
            targetToastNode.style.animation = "fadeUpSmooth 0.4s ease forwards";
            setTimeout(() => {
                targetToastNode.style.display = "none";
            }, 3500);
        }
    },

    generateWhatsAppRedirectionLink(messageStringPayloadText) {
        const formatDigitsStr = this.state.whatsappNumber.replace(/\D/g, "");
        // Build dynamic prefix parameters validation ensuring international dispatch integrity
        const cleanDestinationNumber = formatDigitsStr.startsWith("2") ? formatDigitsStr : "2" + formatDigitsStr;
        return `https://wa.me/${cleanDestinationNumber}?text=${encodeURIComponent(messageStringPayloadText)}`;
    },

    dictionary: {
        en: {
            navHome: "Home",
            navProducts: "Fragrances",
            navWishlist: "Wishlist",
            navAdmin: "Atelier Vault",
            promoText: "Exclusive Discounts & Special Offers",
            mensTitle: "MEN'S COLLECTION",
            womensTitle: "WOMEN'S COLLECTION",
            searchPlaceholder: "Search LORA signature collections...",
            addToCart: "Add to Bag",
            addedToCart: "Composition Allocated to Bag Successfully",
            addedToWishlist: "Added to Desires Manifest",
            removedFromWish: "Removed from Desires Manifest",
            totalVal: "Aggregated Valuation Total",
            checkoutBtn: "Complete Verification Purchase",
            fullName: "Full Name",
            phoneNumber: "Phone Number",
            govName: "Governorate",
            cityName: "City",
            fullAddress: "Exact Delivery Address",
            orderNotes: "Manifest Allocation Notes",
            executeCheckout: "Confirm Purchase via WhatsApp Verification"
        },
        ar: {
            navHome: "الرئيسية",
            navProducts: "العطور الفاخرة",
            navWishlist: "الأمنيات المنسقة",
            navAdmin: "منصة الإدارة",
            promoText: "خصومات وعروض حصرية",
            mensTitle: "مجموعة العطور الرجالية",
            womensTitle: "مجموعة العطور النسائية",
            searchPlaceholder: "ابحث في مجموعات لورا الحصرية...",
            addToCart: "إضافة المقتنى للحقيبة",
            addedToCart: "تمت إضافة المقتنى إلى حقيبتك بنجاح",
            addedToWishlist: "تمت الإضافة لقائمة الأمنيات المنسقة",
            removedFromWish: "تم الحذف من قائمة الرغبات والأمنيات",
            totalVal: "القيمة الإجمالية الإجمالية",
            checkoutBtn: "الانتقال لتوثيق وإنهاء الطلب",
            fullName: "الاسم الكامل",
            phoneNumber: "رقم الهاتف الخلوي",
            govName: "المحافظة",
            cityName: "المدينة أو المركز",
            fullAddress: "عنوان التوصيل الدقيق والمفصل",
            orderNotes: "ملاحظات وتوجيهات التسليم الخاصة",
            executeCheckout: "تأكيد وإرسال الطلب عبر الواتساب"
        }
    }
};

document.addEventListener("DOMContentLoaded", () => LoraApp.init());
window.LoraApp = LoraApp;
export { LoraApp };
