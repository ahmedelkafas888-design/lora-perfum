let state = {
    lang: localStorage.getItem('luxury_lang') || 'en',
    perfumes: [],
    settings: {},
    activeFilter: 'all',
    searchQuery: '',
    cart: []
};

// Application Language Configuration Mappings
const translations = {
    en: {
        navTitle: 'MAISON DE PARFUM',
        filterAll: 'All Fragrances',
        filterMen: 'Pour Homme',
        filterWomen: 'Pour Femme',
        filterUnisex: 'Unisex Collection',
        searchPlaceholder: 'Search exclusive catalog...',
        addToCart: 'Add to Collection',
        viewCart: 'Review Collection',
        checkoutTitle: 'Secure Boutique Checkout',
        fullName: 'Full Name',
        phone: 'Phone Number',
        gov: 'Governorate',
        city: 'City',
        address: 'Delivery Address',
        notes: 'Special Requests / Notes',
        submitCheckout: 'Place Order via WhatsApp',
        emptyCart: 'Your collection trunk is currently empty.',
        sizeLabel: 'Volume Select:',
        total: 'Total Estimation',
        itemsCount: 'Items',
        quickView: 'Quick View',
        inStock: 'Available in Vault',
        outOfStock: 'Allocation Depleted',
        validationErr: 'Please fill out all operational delivery parameters fields.',
        mensTitle: "MEN'S COLLECTION",
        womensTitle: "WOMEN'S COLLECTION",
        shopNow: "Discover Collection"
    },
    ar: {
        navTitle: 'دار العطور الفاخرة',
        filterAll: 'جميع العطور',
        filterMen: 'مجموعة الرجال',
        filterWomen: 'مجموعة النساء',
        filterUnisex: 'عطور للجنسين',
        searchPlaceholder: 'ابحث في العطور الحصرية...',
        addToCart: 'إضافة للمجموعة',
        viewCart: 'مراجعة طلباتك',
        checkoutTitle: 'إتمام الطلب الفاخر',
        fullName: 'الاسم الكامل',
        phone: 'رقم الهاتف',
        gov: 'المحافظة',
        city: 'المدينة / المنطقة',
        address: 'العنوان التفصيلي',
        notes: 'ملاحظات خاصة / طلبات إضافية',
        submitCheckout: 'إرسال الطلب عبر الواتساب',
        emptyCart: 'مجموعة التسوق الخاصة بك فارغة حالياً.',
        sizeLabel: 'اختر الحجم:',
        total: 'الإجمالي التقديري',
        itemsCount: 'القطع',
        quickView: 'نظرة سريعة',
        inStock: 'متوفر في الخزينة',
        outOfStock: 'نفدت الكمية',
        validationErr: 'يرجى ملء جميع الحقول المطلوبة لضمان دقة التوصيل.',
        mensTitle: "مجموعة الرجال",
        womensTitle: "مجموعة النساء",
        shopNow: "اكتشف المجموعة"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initializeCoreStore();
    document.getElementById('langToggle').addEventListener('click', toggleLanguage);
    document.getElementById('searchBar').addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase();
        renderProductGrid();
    });
    document.getElementById('checkoutForm').addEventListener('submit', executionCheckoutRouting);
});

async function initializeCoreStore() {
    try {
        updateLanguageContext();
        
        // Concurrent persistent data resolution
        const [perfumeRes, settingsRes] = await Promise.all([
            fetch('/api/perfumes'),
            fetch('/api/settings')
        ]);
        
        state.perfumes = await perfumeRes.json();
        state.settings = await settingsRes.json();
        
        renderPromoBanner();
        renderCategoryBanners();
        renderProductGrid();
        updateCartSidebar();
    } catch (err) {
        console.error("[System Boot Error] Initialization sequence compromised:", err);
    }
}

function toggleLanguage() {
    state.lang = state.lang === 'en' ? 'ar' : 'en';
    localStorage.setItem('luxury_lang', state.lang);
    updateLanguageContext();
    renderPromoBanner();
    renderCategoryBanners();
    renderProductGrid();
    updateCartSidebar();
}

function updateLanguageContext() {
    const d = translations[state.lang];
    document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = state.lang;
    
    document.getElementById('storeBrandTitle').innerText = d.navTitle;
    document.getElementById('langToggle').innerText = state.lang === 'en' ? 'العربية' : 'English';
    document.getElementById('searchBar').placeholder = d.searchPlaceholder;
    
    // Dynamic generation of contextually sensitive filtration controls
    const filterContainer = document.getElementById('filterNavigationContainer');
    filterContainer.innerHTML = `
        <button onclick="setProductFilter('all')" class="px-5 py-2 font-medium tracking-wider uppercase transition border-b-2 ${state.activeFilter === 'all' ? 'border-amber-600 text-amber-800' : 'border-transparent text-gray-500 hover:text-black'}">${d.filterAll}</button>
        <button onclick="setProductFilter('men')" class="px-5 py-2 font-medium tracking-wider uppercase transition border-b-2 ${state.activeFilter === 'men' ? 'border-amber-600 text-amber-800' : 'border-transparent text-gray-500 hover:text-black'}">${d.filterMen}</button>
        <button onclick="setProductFilter('women')" class="px-5 py-2 font-medium tracking-wider uppercase transition border-b-2 ${state.activeFilter === 'women' ? 'border-amber-600 text-amber-800' : 'border-transparent text-gray-500 hover:text-black'}">${d.filterWomen}</button>
        <button onclick="setProductFilter('unisex')" class="px-5 py-2 font-medium tracking-wider uppercase transition border-b-2 ${state.activeFilter === 'unisex' ? 'border-amber-600 text-amber-800' : 'border-transparent text-gray-500 hover:text-black'}">${d.filterUnisex}</button>
    `;
    
    // Static contextual parsing elements
    document.getElementById('checkoutHeaderTitle').innerText = d.checkoutTitle;
    document.getElementById('lblFullName').innerText = d.fullName;
    document.getElementById('lblPhone').innerText = d.phone;
    document.getElementById('lblGov').innerText = d.gov;
    document.getElementById('lblCity').innerText = d.city;
    document.getElementById('lblAddress').innerText = d.address;
    document.getElementById('lblNotes').innerText = d.notes;
    document.getElementById('btnSubmitOrder').innerText = d.submitCheckout;
}

function setProductFilter(cat) {
    state.activeFilter = cat;
    updateLanguageContext();
    renderProductGrid();
}

function renderPromoBanner() {
    const targetText = state.lang === 'en' ? state.settings.promoTextEn : state.settings.promoTextAr;
    document.getElementById('globalPromoMarqueeText').innerText = targetText || '';
}

function renderCategoryBanners() {
    const d = translations[state.lang];
    
    // Premium Men Collection Section Setup
    const menBox = document.getElementById('heroMenCollectionSection');
    menBox.className = "relative h-[550px] overflow-hidden bg-cover bg-center shadow-xl group";
    menBox.style.backgroundImage = "url('https://images.unsplash.com/photo-1615655096345-61a54750068d?auto=format&fit=crop&w=1200&q=80')";
    menBox.innerHTML = `
        <div class="absolute inset-0 transition-transform duration-1000 bg-black/40 group-hover:scale-105"></div>
        <div class="absolute inset-0 flex flex-col justify-end p-8 text-white hero-overlay">
            <h2 class="mb-2 text-3xl font-light tracking-widest text-amber-100 luxury-heading">${d.mensTitle}</h2>
            <p class="max-w-md mb-4 text-xs tracking-wider text-gray-300 uppercase">${state.lang === 'en' ? 'Crafted for sophistication and lasting strength' : 'صُنع خصيصاً للجاذبية، الفخامة والتميز المستمر'}</p>
            <button onclick="setProductFilter('men')" class="self-start px-6 py-2.5 text-xs tracking-widest text-black bg-white uppercase font-semibold hover:bg-amber-100 transition smooth-transition">${d.shopNow}</button>
        </div>
    `;

    // Premium Women Collection Section Setup
    const womenBox = document.getElementById('heroWomenCollectionSection');
    womenBox.className = "relative h-[550px] overflow-hidden bg-cover bg-center shadow-xl group";
    womenBox.style.backgroundImage = "url('https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80')";
    womenBox.innerHTML = `
        <div class="absolute inset-0 transition-transform duration-1000 bg-black/40 group-hover:scale-105"></div>
        <div class="absolute inset-0 flex flex-col justify-end p-8 text-white hero-overlay">
            <h2 class="mb-2 text-3xl font-light tracking-widest text-amber-100 luxury-heading">${d.womensTitle}</h2>
            <p class="max-w-md mb-4 text-xs tracking-wider text-gray-300 uppercase">${state.lang === 'en' ? 'Expressions of pure luxury, grace, and allure' : 'تعبيرات أصيلة عن الأناقة المطلقة والجاذبية الساحرة'}</p>
            <button onclick="setProductFilter('women')" class="self-start px-6 py-2.5 text-xs tracking-widest text-black bg-white uppercase font-semibold hover:bg-amber-100 transition smooth-transition">${d.shopNow}</button>
        </div>
    `;
}

function renderProductGrid() {
    const grid = document.getElementById('mainStoreProductsGrid');
    grid.innerHTML = '';
    const d = translations[state.lang];

    const filtered = state.perfumes.filter(p => {
        const matchesCategory = state.activeFilter === 'all' || p.category === state.activeFilter;
        const targetName = state.lang === 'en' ? p.nameEn : p.nameAr;
        const matchesSearch = targetName.toLowerCase().includes(state.searchQuery);
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-20 text-gray-400 tracking-wider text-sm uppercase">${state.lang === 'en' ? 'No items matching criteria found.' : 'لم يتم العثور على عطور تطابق خيارات البحث.'}</div>`;
        return;
    }

    filtered.forEach(p => {
        const name = state.lang === 'en' ? p.nameEn : p.nameAr;
        const desc = state.lang === 'en' ? p.descriptionEn : p.descriptionAr;
        
        // Sorting individual size variants by ascending pricing intervals
        const sortedSizes = [...p.sizes].sort((a,b) => a.price - b.price);
        const primaryVariant = sortedSizes[0] || { size: 'N/A', price: 0 };

        const card = document.createElement('div');
        card.className = "bg-white border border-gray-100 overflow-hidden perfume-card flex flex-col justify-between";
        card.innerHTML = `
            <div class="relative overflow-hidden group bg-gray-50 h-72">
                <img src="${p.imageUrl}" alt="${name}" class="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110">
                <div class="absolute top-3 left-3 bg-black/80 px-2.5 py-1 text-[10px] text-amber-200 uppercase tracking-widest">
                    ${p.category}
                </div>
            </div>
            <div class="p-6 flex-grow flex flex-col justify-between">
                <div>
                    <h3 class="text-lg font-medium text-gray-900 tracking-wide mb-1">${name}</h3>
                    <p class="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">${desc}</p>
                </div>
                
                <div>
                    <div class="mb-4">
                        <label class="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">${d.sizeLabel}</label>
                        <select id="size_select_${p._id}" onchange="recalculateCardPrice('${p._id}')" class="w-full bg-gray-50 border border-gray-200 text-xs rounded-none p-2 focus:border-amber-500 focus:outline-none">
                            ${sortedSizes.map((v, idx) => `<option value="${v._id}" data-price="${v.price}">${v.size} - $${v.price}</option>`).join('')}
                        </select>
                    </div>

                    <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span id="price_display_${p._id}" class="text-xl font-light text-amber-900">$${primaryVariant.price}</span>
                        <button onclick="appendItemToCart('${p._id}')" class="px-4 py-2 bg-black text-white text-[11px] font-medium tracking-widest uppercase hover:bg-amber-700 transition smooth-transition">
                            ${d.addToCart}
                        </button>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function recalculateCardPrice(id) {
    const selector = document.getElementById(`size_select_${id}`);
    const selectedOption = selector.options[selector.selectedIndex];
    const targetPrice = selectedOption.getAttribute('data-price');
    document.getElementById(`price_display_${id}`).innerText = `$${targetPrice}`;
}

function appendItemToCart(perfumeId) {
    const perfume = state.perfumes.find(p => p._id === perfumeId);
    if (!perfume) return;

    const selector = document.getElementById(`size_select_${perfumeId}`);
    const selectedSizeId = selector.value;
    const sizeObj = perfume.sizes.find(s => s._id === selectedSizeId);
    
    const cartSearchKey = `${perfumeId}_${selectedSizeId}`;
    const existingElement = state.cart.find(item => item.cartKey === cartSearchKey);

    if (existingElement) {
        existingElement.quantity += 1;
    } else {
        state.cart.push({
            cartKey: cartSearchKey,
            perfumeId: perfumeId,
            nameEn: perfume.nameEn,
            nameAr: perfume.nameAr,
            size: sizeObj.size,
            price: sizeObj.price,
            quantity: 1
        });
    }
    updateCartSidebar();
}

function removeCartItem(cartKey) {
    state.cart = state.cart.filter(item => item.cartKey !== cartKey);
    updateCartSidebar();
}

function updateCartSidebar() {
    const container = document.getElementById('cartItemsInjectContainer');
    const footer = document.getElementById('cartTotalsMetaFooter');
    const d = translations[state.lang];
    
    container.innerHTML = '';
    if (state.cart.length === 0) {
        container.innerHTML = `<p class="text-center text-xs text-gray-400 py-12">${d.emptyCart}</p>`;
        footer.classList.add('hidden');
        return;
    }

    let dynamicTotal = 0;
    state.cart.forEach(item => {
        const name = state.lang === 'en' ? item.nameEn : item.nameAr;
        const aggregatePrice = item.price * item.quantity;
        dynamicTotal += aggregatePrice;

        const row = document.createElement('div');
        row.className = "flex items-start justify-between p-3 bg-gray-50 border border-gray-100 gap-2";
        row.innerHTML = `
            <div class="flex-grow">
                <h4 class="text-xs font-semibold text-gray-900">${name}</h4>
                <p class="text-[10px] text-amber-700 mt-0.5 tracking-wider uppercase">${item.size} (${item.quantity}x)</p>
                <span class="text-xs font-light text-gray-600 block mt-1">$${aggregatePrice}</span>
            </div>
            <button onclick="removeCartItem('${item.cartKey}')" class="text-gray-400 hover:text-red-700 text-sm p-1">✕</button>
        `;
        container.appendChild(row);
    });

    footer.classList.remove('hidden');
    document.getElementById('cartAggregateTotalPriceSum').innerText = `$${dynamicTotal}`;
}

function executionCheckoutRouting(e) {
    e.preventDefault();
    const d = translations[state.lang];

    if (state.cart.length === 0) {
        alert(d.emptyCart);
        return;
    }

    // Capture precise checkout form fields
    const fullName = document.getElementById('inputFullName').value.trim();
    const phone = document.getElementById('inputPhone').value.trim();
    const gov = document.getElementById('inputGov').value.trim();
    const city = document.getElementById('inputCity').value.trim();
    const address = document.getElementById('inputAddress').value.trim();
    const notes = document.getElementById('inputNotes').value.trim();

    if (!fullName || !phone || !gov || !city || !address) {
        alert(d.validationErr);
        return;
    }

    // Format structured checkout confirmation data text payload for WhatsApp
    let txt = `* luxury Fragrance Manifest - Order Request *\n`;
    txt += `====================================\n\n`;
    txt += `*Customer Context Details:*\n`;
    txt += `• Name: ${fullName}\n`;
    txt += `• Contact Phone: ${phone}\n`;
    txt += `• Governorate: ${gov}\n`;
    txt += `• City: ${city}\n`;
    txt += `• Physical Address: ${address}\n`;
    if (notes) txt += `• Manifest Notes: ${notes}\n`;
    txt += `\n*Selected Allocated Scents:*\n`;
    
    let totalSum = 0;
    state.cart.forEach((item, idx) => {
        const itemTitle = state.lang === 'en' ? item.nameEn : item.nameAr;
        txt += `${idx + 1}. ${itemTitle} | Size: ${item.size} | Qty: ${item.quantity} | Subtotal: $${item.price * item.quantity}\n`;
        totalSum += item.price * item.quantity;
    });

    txt += `\n====================================\n`;
    txt += `*Total Aggregated Invoicing Value:* $${totalSum}\n`;
    
    // Construct the absolute WhatsApp routing baseline from persistent system context configuration
    const cleanNumber = state.settings.whatsappNumber.replace(/[^0-9+]/g, '');
    const cleanEscapedMessage = encodeURIComponent(txt);
    const destinationUrl = `https://wa.me/${cleanNumber}?text=${cleanEscapedMessage}`;
    
    // Purge cart post transaction handoff execution
    state.cart = [];
    updateCartSidebar();
    document.getElementById('checkoutForm').reset();
    
    window.open(destinationUrl, '_blank');
}
