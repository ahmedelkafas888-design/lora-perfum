import { db, collection, getDocs } from './firebase.js';
import { generateProductCardsMarkup, runGlobalTranslationsEngine } from './script.js';

async function displayAllProducts() {
    const container = document.getElementById('allProductsContainer');
    if(!container) return;
    
    try {
        const snap = await getDocs(collection(db, "products"));
        let productsList = [];
        snap.forEach(doc => {
            productsList.push({ id: doc.id, ...doc.data() });
        });
        
        if(productsList.length === 0) {
            container.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:var(--gray-muted);">No products found in the collection.</p>`;
            return;
        }
        
        container.innerHTML = generateProductCardsMarkup(productsList);
        runGlobalTranslationsEngine();
    } catch(err) {
        container.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:var(--red-alert);">Failed to load product items.</p>`;
    }
}

document.addEventListener('DOMContentLoaded', displayAllProducts);
