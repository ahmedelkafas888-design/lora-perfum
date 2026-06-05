import { db, storage, collection, addDoc, getDocs, deleteDoc, doc, setDoc, ref, uploadBytesResumable, getDownloadURL } from './firebase.js';

const dropzone = document.getElementById('adminUploadDropzone');
const hiddenInput = document.getElementById('hiddenFileInput');
const progressBar = document.getElementById('uploadInlineProgressIndicator');
const progressContainer = document.getElementById('uploadBarProgressContainer');
const uploadLog = document.getElementById('uploadLogString');
const urlBuffer = document.getElementById('finalizedProductImageUrl');

// High-Priority Image Upload Trigger Handlers
dropzone.addEventListener('click', () => hiddenInput.click());

hiddenInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(file) executeDeviceStorageUpload(file);
});

function executeDeviceStorageUpload(file) {
    const storagePathRef = ref(storage, `perfumes/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storagePathRef, file);

    progressContainer.style.display = 'block';
    uploadLog.style.color = 'var(--charcoal)';
    uploadLog.innerText = "Uploading image asset safely to cloud storage...";

    uploadTask.on('state_changed',
        (snap) => {
            const currentPct = (snap.bytesTransferred / snap.totalBytes) * 100;
            progressBar.style.width = currentPct + '%';
            uploadLog.innerText = `Transfer Progress: ${Math.round(currentPct)}%`;
        },
        (err) => {
            uploadLog.style.color = 'var(--red-alert)';
            uploadLog.innerText = `Error: ${err.message}`;
        },
        () => {
            getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                urlBuffer.value = url;
                uploadLog.style.color = 'var(--green-success)';
                uploadLog.innerText = "Image uploaded successfully! Persistent path confirmed.";
            });
        }
    );
}

// Persistent Catalog Submission Handler
document.getElementById('adminNewProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('pTitle').value.trim();
    const category = document.getElementById('pCategory').value;
    const size = document.getElementById('pSize').value;
    const price = parseFloat(document.getElementById('pPrice').value);
    const discPrice = document.getElementById('pDiscountPrice').value ? parseFloat(document.getElementById('pDiscountPrice').value) : null;
    const stock = parseInt(document.getElementById('pStock').value);
    const imageUrl = urlBuffer.value;

    if(!imageUrl) {
        alert("Please upload a product image first and wait for confirmation.");
        return;
    }

    await addDoc(collection(db, "products"), {
        title, category, size, price, discountPrice: discPrice, stock, imageUrl, created: Date.now()
    });

    alert("Product saved to Firebase successfully!");
    location.reload();
});

// Coupon Deployment Action Handler
document.getElementById('saveCouponBtn').addEventListener('click', async () => {
    const code = document.getElementById('couponCode').value.trim().toUpperCase();
    const percentage = parseFloat(document.getElementById('couponPercentage').value);

    if(!code || isNaN(percentage)) return;
    await setDoc(doc(db, "coupons", code), { code, percentage, active: true });
    alert(`Coupon ${code} deployed successfully!`);
    document.getElementById('couponCode').value = '';
    document.getElementById('couponPercentage').value = '';
});

// Hardware Sync System configurations
document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
    const wa = document.getElementById('whatsappSetting').value.trim();
    await setDoc(doc(db, "store", "settings"), { whatsapp: wa }, { merge: true });
    alert("WhatsApp settings updated successfully!");
});

async function pullAdminCatalogDisplay() {
    const container = document.getElementById('adminCatalogDisplayList');
    if(!container) return;
    
    const snap = await getDocs(collection(db, "products"));
    let layoutHtml = '';
    
    snap.forEach(documentObj => {
        const data = documentObj.data();
        layoutHtml += `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#fff; padding:12px; border:1px solid var(--gray-light);">
                <div style="display:flex; gap:12px; align-items:center;">
                    <img src="${data.imageUrl}" style="width:45px; height:50px; object-fit:cover; background:#f4f4f4;">
                    <div>
                        <span style="font-weight:600; font-size:0.85rem;">${data.title}</span><br>
                        <span style="font-size:0.75rem; color:var(--gray-muted);">${data.price} EGP | Stock: ${data.stock}</span>
                    </div>
                </div>
                <button style="background:var(--red-alert); color:white; border:none; padding:4px 8px; font-size:0.75rem; cursor:pointer;" onclick="deleteProductItem('${documentObj.id}')">Delete</button>
            </div>
        `;
    });
    container.innerHTML = layoutHtml;
}

window.deleteProductItem = async function(id) {
    if(confirm("Are you sure you want to delete this product?")) {
        await deleteDoc(doc(db, "products", id));
        location.reload();
    }
};

document.addEventListener('DOMContentLoaded', pullAdminCatalogDisplay);
