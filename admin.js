import { dbEngine } from "./firebase.js";
import { StoreApp } from "./script.js";

const AdminDashboard = {
    async init() {
        this.bindEvents();
        await this.renderProductsList();
        await this.renderOrdersList();
    },

    bindEvents() {
        const form = document.getElementById("adminProductForm");
        if (form) {
            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                await this.handleFormSave();
            });
        }
    },

    async handleFormSave() {
        const id = document.getElementById("prodId").value;
        const payload = {
            nameEn: document.getElementById("prodNameEn").value,
            nameAr: document.getElementById("prodNameAr").value,
            category: document.getElementById("prodCategory").value,
            price: parseFloat(document.getElementById("prodPrice").value),
            stock: parseInt(document.getElementById("prodStock").value),
            image: document.getElementById("prodImage").value || "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80",
            descEn: document.getElementById("prodDescEn").value,
            descAr: document.getElementById("prodDescAr").value,
            rating: 5,
            isNew: true,
            isBest: false,
            discount: 0
        };

        if (id) {
            await dbEngine.updateDocument("products", id, payload);
            StoreApp.showNotification("Product updated successfully in permanent cloud storage.");
        } else {
            await dbEngine.createDocument("products", payload);
            StoreApp.showNotification("Product created permanently in live cloud database.");
        }

        document.getElementById("adminProductForm").reset();
        document.getElementById("prodId").value = "";
        await this.renderProductsList();
    },

    async editProduct(id) {
        const p = await dbEngine.getDocument("products", id);
        if (!p) return;
        document.getElementById("prodId").value = p.id;
        document.getElementById("prodNameEn").value = p.nameEn;
        document.getElementById("prodNameAr").value = p.nameAr;
        document.getElementById("prodCategory").value = p.category;
        document.getElementById("prodPrice").value = p.price;
        document.getElementById("prodStock").value = p.stock;
        document.getElementById("prodImage").value = p.image;
        document.getElementById("prodDescEn").value = p.descEn;
        document.getElementById("prodDescAr").value = p.descAr;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    async deleteProduct(id) {
        if (confirm("Execute absolute configuration drop on this asset permanently?")) {
            await dbEngine.deleteDocument("products", id);
            await this.renderProductsList();
            StoreApp.showNotification("Item purged completely.");
        }
    },

    async renderProductsList() {
        const target = document.getElementById("adminProductsGridContainer");
        if (!target) return;
        const list = await dbEngine.getCollection("products");
        target.innerHTML = list.map(p => `
            <div class="bg-[#1a1a1a] p-4 border border-zinc-800 flex justify-between items-center">
                <div class="flex items-center gap-4">
                    <img src="${p.image}" class="w-12 h-12 object-cover border border-zinc-700">
                    <div>
                        <h4 class="font-bold text-sm text-white">${StoreApp.state.lang === 'en' ? p.nameEn : p.nameAr}</h4>
                        <p class="text-xs text-amber-500">$${p.price} | Stock: ${p.stock}</p>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button type="button" onclick="AdminDashboard.editProduct('${p.id}')" class="text-xs px-3 py-1 bg-zinc-800 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-black">Edit</button>
                    <button type="button" onclick="AdminDashboard.deleteProduct('${p.id}')" class="text-xs px-3 py-1 bg-red-950/40 text-red-400 border border-red-500/20 hover:bg-red-600 hover:text-white">Delete</button>
                </div>
            </div>
        `).join('');
    },

    async renderOrdersList() {
        const target = document.getElementById("adminOrdersGridContainer");
        if (!target) return;
        const list = await dbEngine.getCollection("orders");
        if(list.length === 0) {
            target.innerHTML = `<p class="text-xs text-zinc-500 p-4">No consumer distribution logs synchronized yet.</p>`;
            return;
        }
        target.innerHTML = list.map(o => `
            <div class="bg-[#121212] p-6 border border-zinc-800 space-y-3">
                <div class="flex justify-between items-center border-b border-zinc-800 pb-2">
                    <span class="text-xs text-zinc-400 font-mono">${o.id}</span>
                    <span class="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 uppercase tracking-widest">${o.status || 'Pending Verification'}</span>
                </div>
                <div class="text-xs space-y-1">
                    <p class="font-bold text-white">${o.customer?.name} (${o.customer?.phone})</p>
                    <p class="text-zinc-400">${o.customer?.gov}, ${o.customer?.city} - ${o.customer?.address}</p>
                </div>
                <div class="border-t border-zinc-800/60 pt-2 flex justify-between items-center">
                    <span class="text-xs text-amber-500 font-bold">Valuation: $${o.totalValuation}</span>
                    <button type="button" onclick="AdminDashboard.advanceOrderStatus('${o.id}')" class="text-[10px] uppercase tracking-wider bg-zinc-800 text-white px-2 py-1 border border-zinc-700 hover:border-amber-500">Advance State</button>
                </div>
            </div>
        `).join('');
    },

    async advanceOrderStatus(id) {
        await dbEngine.updateDocument("orders", id, { status: "Dispatched to Destination Courier" });
        await this.renderOrdersList();
        StoreApp.showNotification("Distribution pipeline lifecycle logged onward.");
    }
};

window.AdminDashboard = AdminDashboard;
document.addEventListener("DOMContentLoaded", () => {
    if(document.getElementById("adminProductForm") || document.getElementById("adminProductsGridContainer")) {
        AdminDashboard.init();
    }
});
export { AdminDashboard };
