import { db, storage, collection, addDoc, getDocs, deleteDoc, doc, setDoc, ref, uploadBytesResumable, getDownloadURL } from './firebase.js';

const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('prodImageFile');
const progressBar = document.getElementById('progressBar');
const progressBarContainer = document.getElementById('progressBarContainer');
const statusMsg = document.getElementById('uploadStatusMsg');
const urlHiddenInput = document.getElementById('prodImageUrl');

// CRITICAL REQUIREMENT 1: MULTI-PLATFORM MOBILE/DESKTOP PERSISTENCE STORAGE PIPELINES
uploadZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleImageUploadPipeline(file);
});

function handleImageUploadPipeline(file) {
    // Unique naming tracking signature patterns prevention algorithms maps
    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    progressBarContainer.style.display = 'block';
    statusMsg.style.color = 'var(--charcoal)';
    statusMsg.innerText = "Initializing cross-platform persistent upload connection...";

    uploadTask.on('state_changed', 
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progressBar.style.width = progress + '%';
            statusMsg.innerText = `Uploading: ${Math.round(progress)}% completed.`;
        }, 
        (error) => {
            statusMsg.style.color = '#C62828';
            statusMsg.innerText = `Upload Failed: ${error.message}`;
        }, 
        () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                urlHiddenInput.value = downloadURL;
                statusMsg.style.color = '#2E7D32';
                statusMsg.innerText = "Upload verification successful! URL saved permanently.";
            });
        }
    );
}

// Save document catalog item configurations
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('prodTitle').value;
    const brand = document.getElementById('prodBrand').value || 'LORA';
    const price = parseFloat(document.getElementById('prodPrice').value);
    const stock = parseInt(document.getElementById('prodStock').value);
    const imageUrl = urlHiddenInput.value;

    if(!imageUrl) {
        alert("Please wait for the secure asset upload connection tracker pipeline to finalize verification matches.");
        return;
    }

    await addDoc(collection(db, "products"), { title, brand, price, stock, imageUrl, timestamp: Date.now() });
    alert("Fragrance logged permanently inside live production catalog cluster indices profiles.");
    location.reload();
});

// Outbound Settings Management 
document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
    const whatsapp = document.getElementById('settingWhatsapp').value.trim();
    await setDoc(doc(db, "store", "settings"), { whatsapp }, { merge: true });
    alert("System operational configurations profiles deployed tracking matrices matches updated successfully!");
});

async function loadAdminCatalog() {
    const container = document.getElementById('adminCatalogList');
    if(!container) return;
    const snap = await getDocs(collection(db, "products"));
    let html = "";
    snap.forEach(docItem => {
        const d = docItem.data();
        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; background:white; padding:15px; border:1px solid var(--gray-light);">
                <div style="display:flex; gap:15px; align-items:center;">
                    <img src="${d.imageUrl}" style="width:50px; height:50px; object-fit:cover;">
                    <div>
                        <strong>${d.title}</strong><br>
                        <span style="font-size:0.8rem; color:var(--gray-muted);">${d.price} AED - Stock: ${d.stock}</span>
                    </div>
                </div>
                <button style="background:#C62828; color:white; border:none; padding:5px 10px; cursor:pointer;" onclick="deleteProduct('${docItem.id}')">Delete</button>
            </div>
        `;
    });
    container.innerHTML = html;
}

window.deleteProduct = async function(id) {
    if(confirm("Confirm immediate absolute purge extraction command criteria matching?")) {
        await deleteDoc(doc(db, "products", id));
        location.reload();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    loadAdminCatalog();
});
