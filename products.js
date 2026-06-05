import { db, collection, getDocs } from './firebase.js';
import { runGlobalTranslationsEngine, updateLayoutBadges, pullDynamicStoreMetadata } from './script.js';

async function fetchAndRenderCatalog() {
    const container = document.getElementById('allProductsContainer');
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

        let htmlPayload = '';
        
        querySnapshot.forEach((docSnap) => {
            const product = docSnap.data();
            const pid = docSnap.id;
            
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
                        <button class="wishlist-btn" style="${heartColorStyle}" onclick="toggleCatalogWishlist('${pid}', '${encodedTitle}', ${parseFloat(targetedPrice)}, '${product.imageUrl}', '${product.size || '100'}')">
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
    } catch (error) {
        console.error("Error loading products catalog grid:", error);
        container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; padding: 40px 0; color: var(--red-alert);">Failed to initialize collection. please try refreshing.</p>`;
    }
}

window.toggleCatalogWishlist = function(id, base64Title, price, imageUrl, size) {
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
    fetchAndRenderCatalog();
};

document.addEventListener('DOMContentLoaded', () => {
    updateLayoutBadges();
    pullDynamicStoreMetadata();
    fetchAndRenderCatalog();

    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });
    }
});
