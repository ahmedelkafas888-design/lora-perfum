const StoreApp = {
    state: {
        lang: localStorage.getItem("lux_perfume_lang") || "en",
        cart: JSON.parse(localStorage.getItem("lux_perfume_cart")) || [],
        wishlist: JSON.parse(localStorage.getItem("lux_perfume_wishlist")) || []
    },

    init() {
        this.applyLanguageDOMChanges();
        this.bindGlobalUIEvents();
        this.updateBadgeCounts();
    },

    applyLanguageDOMChanges() {
        const body = document.documentElement;
        body.setAttribute("lang", this.state.lang);
        if (this.state.lang === "ar") {
            body.setAttribute("dir", "rtl");
            document.body.dir = "rtl";
        } else {
            body.setAttribute("dir", "ltr");
            document.body.dir = "ltr";
        }
        
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const translationKey = el.getAttribute("data-i18n");
            if (this.dictionary[this.state.lang][translationKey]) {
                el.innerText = this.dictionary[this.state.lang][translationKey];
            }
        });
        
        document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
            const translationKey = el.getAttribute("data-i18n-placeholder");
            if (this.dictionary[this.state.lang][translationKey]) {
                el.setAttribute("placeholder", this.dictionary[this.state.lang][translationKey]);
            }
        });
    },

    toggleLanguage() {
        this.state.lang = this.state.lang === "en" ? "ar" : "en";
        localStorage.setItem("lux_perfume_lang", this.state.lang);
        this.applyLanguageDOMChanges();
        window.location.reload();
    },

    bindGlobalUIEvents() {
        const sw = document.getElementById("langSwitcherBtn");
        if (sw) {
            sw.addEventListener("click", () => this.toggleLanguage());
        }
    },

    updateBadgeCounts() {
        const cBadge = document.getElementById("cartCountBadge");
        const wBadge = document.getElementById("wishlistCountBadge");
        if (cBadge) cBadge.innerText = this.state.cart.reduce((acc, item) => acc + item.qty, 0);
        if (wBadge) wBadge.innerText = this.state.wishlist.length;
    },

    showNotification(msgKey) {
        const toast = document.createElement("div");
        toast.className = "luxury-toast active";
        toast.innerText = this.dictionary[this.state.lang][msgKey] || msgKey;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.remove("active");
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    },

    dictionary: {
        en: {
            navHome: "Home",
            navProducts: "Fragrances",
            navWishlist: "Wishlist",
            navAdmin: "Atelier Panel",
            heroTitle: "Sculpting Liquid Artistry",
            heroSubtitle: "Experience haute parfumerie crafted for modern royalty.",
            discoverBtn: "Explore Collections",
            addToCart: "Allocate To Trunk",
            addedToCart: "Added to Collection Trunk Successfully",
            addedToWishlist: "Added to Desires Manifest",
            removedFromWish: "Removed from Desires Manifest",
            searchPlaceholder: "Search rare essences...",
            categoryAll: "All Compositions",
            categoryMen: "Pour Homme",
            categoryWomen: "Pour Femme",
            categoryUnisex: "Unisex Elixirs",
            checkoutTitle: "Secure Boutique Checkout",
            totalLabel: "Aggregated Valuation",
            placeOrder: "Transmit Absolute Verification Order",
            viewCart: "Review Collection"
        },
        ar: {
            navHome: "الرئيسية",
            navProducts: "العطور الفاخرة",
            navWishlist: "قائمة الأمنيات",
            navAdmin: "لوحة التحكم",
            heroTitle: "صياغة الفن السائل",
            heroSubtitle: "تجربة عطور فاخرة مخصصة للملوك المعاصرين.",
            discoverBtn: "اكتشف المجموعات",
            addToCart: "إضافة إلى حقيبة المقتنيات",
            addedToCart: "تمت الإضافة إلى حقيبة المقتنيات بنجاح",
            addedToWishlist: "تمت الإضافة إلى قائمة الرغبات الحصرية",
            removedFromWish: "تم الحذف من قائمة الرغبات",
            searchPlaceholder: "ابحث عن الجواهر العطرية النادرة...",
            categoryAll: "جميع التركيبات",
            categoryMen: "للرجال",
            categoryWomen: "للنساء",
            categoryUnisex: "عطور مشتركة",
            checkoutTitle: "إتمام الدفع الآمن",
            totalLabel: "القيمة الإجمالية المجمعة",
            placeOrder: "إرسال طلب التأكيد النهائي",
            viewCart: "مراجعة المقتنيات"
        }
    }
};

document.addEventListener("DOMContentLoaded", () => StoreApp.init());
export { StoreApp };
