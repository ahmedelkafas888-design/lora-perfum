import { db, storage, doc, setDoc, getDoc, collection, getDocs, deleteDoc, ref, uploadBytesResumable, getDownloadURL } from './firebase.js';
import { runGlobalTranslationsEngine, updateLayoutBadges, pullDynamicStoreMetadata } from './script.js';

// --- AUTHENTICATION SHIELD ---
function runAdminSecurityPortalCheck() {
    const sessionToken = sessionStorage.getItem('lora_admin_authenticated');
    if (sessionToken === 'true') {
        return;
    }
    
    const entryPass = prompt("LORA ACCESS PORTAL:\nPlease enter administrative security passcode:");
    if (entryPass === "LORA_PASS_2026") {
        sessionStorage.setItem('lora_admin_authenticated', 'true');
    } else {
        alert("Access Denied. Redirecting to showroom storefront.");
        window.location.href = "index.html";
    }
}

// --- TAB SWITCHING ARCHITECTURE ---
function initializeTabbedNavigation() {
    const tabButtons = document.querySelectorAll('.admin-menu-btn');
    const viewPanels = document.querySelectorAll('.admin-view');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            viewPanels.forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) targetPanel.classList.add('active');
        });
    });
}

// --- GLOBAL VARIABLES FOR STATE ---
let selectedProductImageFile = null;
let currentActiveProductImageUrl = "";

// --- PRODUCTS MANAGEMENT LOGIC ---
async function uploadProductMediaFile(file) {
    return new Promise((resolve, reject) => {
        const progressIndicator = document.getElementById('uploadProgressContainer');
        const internalStorageRef = ref(storage, `products_catalog/${Date.now()}_${file.name}`);
        const activeUploadTask = uploadBytesResumable(internalStorageRef, file);
        
        activeUploadTask.on('state_changed', 
            (snapshot) => {
                const calculatedProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (progressIndicator) {
                    progressIndicator.innerText = `Media upload progress: ${Math.round(calculatedProgress)}% complete`;
                }
            }, 
            (error) => {
                console.error("Storage structural upload failed:", error);
                if (progressIndicator) progressIndicator.innerText = "Media upload transaction failed!";
                reject(error);
            }, 
            async () => {
                const permanentDownloadUrl = await getDownloadURL(activeUploadTask.snapshot.ref);
                if (progressIndicator) progressIndicator.innerText = "Media committed successfully!";
                resolve(permanentDownloadUrl);
            }
        );
    });
}

async function handleProductFormSubmission() {
    const productRecordIdField = document.getElementById('editProductId').value.trim();
    const productTitleValue = document.getElementById('prodTitle').value.trim();
    const productCategoryValue = document.getElementById('prodCategory').value;
    const productPriceValue = document.getElementById('prodPrice').value.trim();
    const productDiscountPriceValue = document.getElementById('prodDiscountPrice').value.trim();
    const productSizeValue = document.getElementById('prodSize').value.trim();
    const productStockValue = document.getElementById('prodStock').value.trim();

    if (!productTitleValue || !productPriceValue || !productSizeValue || !productStockValue) {
        alert("Please fulfill all mandatory operational parameters.");
        return;
    }

    try {
        let finalResolvedImageUrl = currentActiveProductImageUrl;
        
        if (selectedProductImageFile) {
            finalResolvedImageUrl = await uploadProductMediaFile(selectedProductImageFile);
        }

        if (!finalResolvedImageUrl) {
            alert("Mandatory structural item requires an image file to proceed.");
            return;
        }

        const syntheticDocumentIdentifier = productRecordIdField || productTitleValue.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase() + "-" + Date.now();
        const documentReferencePayload = doc(db, "products", syntheticDocumentIdentifier);
        
        const contextualProductPayload = {
            title: productTitleValue,
            category: productCategoryValue,
            price: parseFloat(productPriceValue),
            discountPrice: productDiscountPriceValue ? parseFloat(productDiscountPriceValue) : null,
            size: productSizeValue,
            stock: parseInt(productStockValue),
            imageUrl: finalResolvedImageUrl
        };

        await setDoc(documentReferencePayload, contextualProductPayload, { merge: true });
        alert("Product record successfully committed to persistent warehouse storage.");
        resetProductFormState();
        await fetchAndRenderAdminCatalog();
        updateLayoutBadges();
    } catch (error) {
        console.error("Product submission block process exception:", error);
        alert("Error encountered committing system transaction record block variables.");
    }
}

async function fetchAndRenderAdminCatalog() {
    const tableBody = document.getElementById('adminProductsTableBody');
    if (!tableBody) return;

    try {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Retrieving high luxury catalog profiles...</td></tr>`;
        const productsSnapshot = await getDocs(collection(db, "products"));
        
        if (productsSnapshot.empty) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Catalog configuration manifest currently unpopulated.</td></tr>`;
            return;
        }

        let dynamicRowMarkup = '';
        productsSnapshot.forEach((docSnap) => {
            const id = docSnap.id;
            const data = docSnap.data();
            
            const priceExpression = data.discountPrice 
                ? `<span style="text-decoration:line-through; font-size:0.8rem; color:var(--gray-muted);">${data.price} EGP</span><br><span style="color:var(--gold-dark); font-weight:bold;">${data.discountPrice} EGP</span>` 
                : `<span>${data.price} EGP</span>`;

            const base64DataObj = btoa(encodeURIComponent(JSON.stringify({ id, ...data })));

            dynamicRowMarkup += `
                <tr>
                    <td><img src="${data.imageUrl}" alt="Media Profile"></td>
                    <td style="font-weight:600;">${data.title}</td>
                    <td style="text-transform:uppercase; font-size:0.8rem;">${data.category}</td>
                    <td>${data.size || '100'} ML</td>
                    <td><span class="${parseInt(data.stock) <= 3 ? 'low-stock' : ''}">${data.stock} units</span></td>
                    <td>${priceExpression}</td>
                    <td>
                        <button class="action-icon-btn edit-btn" onclick="triggerProductEditFlow('${base64DataObj}')" title="Edit Product"><i class="fa-regular fa-pen-to-square"></i></button>
                        <button class="action-icon-btn delete-btn" onclick="triggerProductDeletionFlow('${id}')" title="Delete Product"><i class="fa-regular fa-trash-can"></i></button>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = dynamicRowMarkup;
    } catch (error) {
        console.error("Admin catalog fetch routine failure exception:", error);
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--red-alert);">Failed to index active catalog variables.</td></tr>`;
    }
}

window.triggerProductEditFlow = function(base64Payload) {
    const unmarshalledObject = JSON.parse(decodeURIComponent(atob(base64Payload)));
    
    document.getElementById('editProductId').value = unmarshalledObject.id;
    document.getElementById('prodTitle').value = unmarshalledObject.title;
    document.getElementById('prodCategory').value = unmarshalledObject.category || 'unisex';
    document.getElementById('prodPrice').value = unmarshalledObject.price;
    document.getElementById('prodDiscountPrice').value = unmarshalledObject.discountPrice || '';
    document.getElementById('prodSize').value = unmarshalledObject.size || '100';
    document.getElementById('prodStock').value = unmarshalledObject.stock || '0';
    
    currentActiveProductImageUrl = unmarshalledObject.imageUrl;
    selectedProductImageFile = null;
    
    document.getElementById('productFormTitle').innerText = "Modify Luxury Product Profile";
    document.getElementById('cancelEditBtn').style.display = "inline-block";
    document.getElementById('uploadProgressContainer').innerText = "Existing image retained unless new payload provided.";
    
    window.scrollTo({ top: document.getElementById('productFormTitle').offsetTop - 100, behavior: 'smooth' });
};

window.triggerProductDeletionFlow = async function(id) {
    if (!confirm("Are you certain you wish to purge this unique premium product definition from live configuration parameters?")) {
        return;
    }
    try {
        await deleteDoc(doc(db, "products", id));
        alert("Product document profile purged.");
        await fetchAndRenderAdminCatalog();
        updateLayoutBadges();
    } catch (err) {
        console.error("Purging action caught routine error:", err);
    }
};

function resetProductFormState() {
    document.getElementById('editProductId').value = "";
    document.getElementById('productManagementForm').reset();
    selectedProductImageFile = null;
    currentActiveProductImageUrl = "";
    document.getElementById('productFormTitle').innerText = "Add New Luxury Product";
    document.getElementById('cancelEditBtn').style.display = "none";
    document.getElementById('uploadProgressContainer').innerText = "";
}

// --- COUPON MANAGEMENT LOGIC ---
async function handleCouponFormSubmission() {
    const couponCodeValue = document.getElementById('coupCode').value.trim().toUpperCase();
    const couponTypeValue = document.getElementById('coupType').value;
    const couponValueValue = document.getElementById('coupValue').value.trim();

    if (!couponCodeValue || !couponValueValue) {
        alert("Fulfill promotional rule configuration parameters matrix fully.");
        return;
    }

    try {
        const couponDocumentReference = doc(db, "coupons", couponCodeValue);
        await setDoc(couponDocumentReference, {
            type: couponTypeValue,
            value: parseFloat(couponValueValue)
        });
        alert(`Promotional Rule Variable "${couponCodeValue}" initialized.`);
        document.getElementById('couponManagementForm').reset();
        await fetchAndRenderAdminCoupons();
    } catch (err) {
        console.error("Coupon creation execution logic failure:", err);
    }
}

async function fetchAndRenderAdminCoupons() {
    const couponsTableBody = document.getElementById('adminCouponsTableBody');
    if (!couponsTableBody) return;

    try {
        couponsTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Retrieving active promo rules index matrix...</td></tr>`;
        const couponsSnapshot = await getDocs(collection(db, "coupons"));

        if (couponsSnapshot.empty) {
            couponsTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No valid dynamic discount rules found.</td></tr>`;
            return;
        }

        let matrixHtmlRows = '';
        couponsSnapshot.forEach(docSnap => {
            const code = docSnap.id;
            const data = docSnap.data();
            const ruleExpression = data.type === 'percentage' ? `${data.value}% Off Total` : `${data.value} EGP Flat Deduct`;

            matrixHtmlRows += `
                <tr>
                    <td style="font-weight:700; letter-spacing:1px; color:var(--gold-dark);">${code}</td>
                    <td style="text-transform:uppercase; font-size:0.8rem;">${data.type}</td>
                    <td>${ruleExpression}</td>
                    <td>
                        <button class="action-icon-btn delete-btn" onclick="triggerCouponDeletionFlow('${code}')" title="Purge Coupon"><i class="fa-regular fa-trash-can"></i></button>
                    </td>
                </tr>
            `;
        });

        couponsTableBody.innerHTML = matrixHtmlRows;
    } catch (error) {
        console.error("Coupons matrix indexing failure:", error);
    }
}

window.triggerCouponDeletionFlow = async function(code) {
    if (!confirm(`Purge promotion code "${code}"?`)) return;
    try {
        await deleteDoc(doc(db, "coupons", code));
        alert("Coupon rule removed.");
        await fetchAndRenderAdminCoupons();
    } catch (err) {
        console.error("Coupon deletion error code capture:", err);
    }
};

// --- SETTINGS CONFIGURATION MANAGEMENT ---
async function handleSettingsFormSubmission() {
    const waValue = document.getElementById('setWhatsApp').value.trim();
    const bannerValue = document.getElementById('setBanner').value.trim();

    try {
        const configurationReferenceObject = doc(db, "settings", "store_config");
        await setDoc(configurationReferenceObject, {
            whatsapp: waValue,
            promoBanner: bannerValue
        }, { merge: true });
        
        alert("Global configuration settings variables updated successfully.");
        await pullDynamicStoreMetadata();
    } catch (err) {
        console.error("Settings submission processing failed:", err);
    }
}

async function loadSettingsFormInitialValues() {
    try {
        const docSnap = await getDoc(doc(db, "settings", "store_config"));
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (document.getElementById('setWhatsApp')) document.getElementById('setWhatsApp').value = data.whatsapp || '';
            if (document.getElementById('setBanner')) document.getElementById('setBanner').value = data.promoBanner || '';
        }
    } catch (err) {
        console.error("Initial configuration loading intercepted failure:", err);
    }
}

// --- INITIALIZATION GATEWAY ---
document.addEventListener('DOMContentLoaded', async () => {
    runAdminSecurityPortalCheck();
    initializeTabbedNavigation();
    updateLayoutBadges();
    await pullDynamicStoreMetadata();

    // Load initial operational contexts
    await fetchAndRenderAdminCatalog();
    await fetchAndRenderAdminCoupons();
    await loadSettingsFormInitialValues();

    // Event Registration Wireframes
    const fileInputField = document.getElementById('prodImageFile');
    if (fileInputField) {
        fileInputField.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                selectedProductImageFile = e.target.files[0];
            }
        });
    }

    const saveProductButton = document.getElementById('saveProductBtn');
    if (saveProductButton) {
        saveProductButton.addEventListener('click', handleProductFormSubmission);
    }

    const cancelEditButton = document.getElementById('cancelEditBtn');
    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', resetProductFormState);
    }

    const saveCouponButton = document.getElementById('saveCouponBtn');
    if (saveCouponButton) {
        saveCouponButton.addEventListener('click', handleCouponFormSubmission);
    }

    const saveSettingsButton = document.getElementById('saveSettingsBtn');
    if (saveSettingsButton) {
        saveSettingsButton.addEventListener('click', handleSettingsFormSubmission);
    }

    const menuToggleButton = document.getElementById('menuToggle');
    const navLinksContainer = document.getElementById('navLinks');
    if (menuToggleButton && navLinksContainer) {
        menuToggleButton.addEventListener('click', () => {
            navLinksContainer.classList.toggle('open');
        });
    }

    runGlobalTranslationsEngine();
});
