import { db, collection, getDocs } from './firebase.js';
import { generateProductCardsMarkup, applyTranslations, updateBadges } from './script.js';

async function loadAllProductsCatalog() {
    const container = document.getElementById('allProductsContainer');
    if(!container) return;
    
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        let products = [];
        querySnapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });
        
        if(products.length === 0) {
            container.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:var(--gray-muted);">No luxury fragrances currently available in the collection.</p>`;
            return;
        }
        
        container.innerHTML = generateProductCardsMarkup(products);
        applyTranslations();
    } catch (error) {
        container.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:red;">Error loading luxury pipeline matrix feed.</p>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadAllProductsCatalog();
});
