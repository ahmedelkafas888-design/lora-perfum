import { firestoreService } from "./firebase.js";
import { LoraProductsEngine } from "./products.js";
import { LoraApp } from "./script.js";

const LoraAdminWorkspace = {
    activeCustomSizesArray: [],

    initWorkspaceView() {
        this.verifyAccessValidationState();
        this.bindWorkspaceActions();
        this.renderCatalogListingRegistry();
        this.loadCurrentStoredSettings();
    },

    verifyAccessValidationState() {
        const loginToken = sessionStorage.getItem("lora_admin_verified_auth");
        if (loginToken !== "granted_ahmedelkafas888") {
            const screenOverlayGate = document.getElementById("adminAuthAccessGateModalWindow");
            if (screenOverlayGate) {
                screenOverlayGate.classList.remove("hidden");
                screenOverlayGate.classList.add("flex");
            }
        }
    },

    executeAuthenticationAttempt() {
        const inputPassValue = document.getElementById("adminSecurityAccessKeyField").value.trim();
        if (inputPassValue === "ahmedelkafas888@gmail.com") {
            sessionStorage.setItem("lora_admin_verified_auth", "granted_ahmedelkafas888");
            const screenOverlayGate = document.getElementById("adminAuthAccessGateModalWindow");
            if (screenOverlayGate) {
                screenOverlayGate.classList.add("hidden");
                screenOverlayGate.classList.remove("flex");
            }
            LoraApp.dispatchNotificationToast("Access Authorized. Atelier Vault unlocked.");
            window.location.reload();
        } else {
            alert("Unauthorized credentials security access trace rejected.");
        }
    },

    bindWorkspaceActions() {
        const productForm = document.getElementById("adminWorkspaceProductForm");
        if (productForm) {
            productForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                await this.saveProductProcess();
            });
        }

        const sizeAdditionTriggerBtn = document.getElementById("appendCustomSizeOptionSubBtn");
        if (sizeAdditionTriggerBtn) {
            sizeAdditionTriggerBtn.addEventListener("click", () => this.appendCustomSizeRowToStateList());
        }

        const settingsForm = document.getElementById("adminStoreGlobalSettingsForm");
        if (settingsForm) {
            settingsForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                await this.saveGlobalWhatsAppNumberSettings();
            });
        }
    },

    appendCustomSizeRowToStateList(sizeLabel = "", sizeValuePrice = "") {
        const sizeContainerListWrapper = document.getElementById("customBottleSizesDynamicSubContainer");
        if (!sizeContainerListWrapper) return;

        const dynamicRowDivUniqueId = "row_" + Date.now() + Math.random().toString(36).substring(2, 5);
        const structureNodeWrapper = document.createElement("div");
        structureNodeWrapper.id = dynamicRowDivUniqueId;
        structureNodeWrapper.className = "flex gap-2 items-center size-row-item-node";

        structureNodeWrapper.innerHTML = `
            <input type="text" placeholder="e.g., 100ml" value="${sizeLabel}" class="lux-input size-label-sub-input w-1/2" required style="background: #111; border: 1px solid #333; color:#fff; padding:0.4rem;">
            <input type="number" placeholder="Price" value="${sizeValuePrice}" class="lux-input size-price-sub-input w-1/2" required style="background: #111; border: 1px solid #333; color:#fff; padding:0.4rem;">
            <button type="button" onclick="this.parentElement.remove()" class="text-red-500 font-bold px-2">✕</button>
        `;
        sizeContainerListWrapper.appendChild(structureNodeWrapper);
    },

    extractSizesMatrixFromInputs() {
        const outputValidatedMatrix = [];
        const targetedInputNodes = document.querySelectorAll(".size-row-item-node");
        targetedInputNodes.forEach(row => {
            const labelStr = row.querySelector(".size-label-sub-input").value.trim();
            const valPrice = parseFloat(row.querySelector(".size-price-sub-input").value);
            if (labelStr && !isNaN(valPrice)) {
                outputValidatedMatrix.push({ sizeLabel: labelStr, priceValue: valPrice });
            }
        });
        return outputValidatedMatrix;
    },

    async saveProductProcess() {
        const structuralRecordId = document.getElementById("hiddenProductUniqueMetaId").value;
        const sizeConfigurationMatrix = this.extractSizesMatrixFromInputs();

        if (sizeConfigurationMatrix.length === 0) {
            alert("An architectural luxury perfume entry requires at least one custom volumetric bottle size and price specification node configured.");
            return;
        }

        const compositeProductPayload = {
            nameEn: document.getElementById("fieldProductNameEn").value.trim(),
            nameAr: document.getElementById("fieldProductNameAr").value.trim(),
            category: document.getElementById("fieldProductCategorySelect").value,
            image: document.getElementById("fieldProductImageRemoteURL").value.trim(),
            descEn: document.getElementById("fieldProductDescriptionEn").value.trim(),
            descAr: document.getElementById("fieldProductDescriptionAr").value.trim(),
            stockStatus: document.getElementById("fieldProductStockStatus").value,
            sizesMatrix: sizeConfigurationMatrix
        };

        if (structuralRecordId) {
            await LoraProductsEngine.updateExistingProductEntry(structuralRecordId, compositeProductPayload);
            LoraApp.dispatchNotificationToast("Product data mutations saved directly to cloud platform successfully.");
        } else {
            await LoraProductsEngine.persistNewProductEntry(compositeProductPayload);
            LoraApp.dispatchNotificationToast("New premium fragrance creation registered permanently inside live datastore.");
        }

        document.getElementById("adminWorkspaceProductForm").reset();
        document.getElementById("hiddenProductUniqueMetaId").value = "";
        document.getElementById("customBottleSizesDynamicSubContainer").innerHTML = "";
        await this.renderCatalogListingRegistry();
    },

    async triggerEditSequence(id) {
        const item = await LoraProductsEngine.retrieveSingleProduct(id);
        if (!item) return;

        document.getElementById("hiddenProductUniqueMetaId").value = item.id;
        document.getElementById("fieldProductNameEn").value = item.nameEn;
        document.getElementById("fieldProductNameAr").value = item.nameAr;
        document.getElementById("fieldProductCategorySelect").value = item.category;
        document.getElementById("fieldProductImageRemoteURL").value = item.image;
        document.getElementById("fieldProductStockStatus").value = item.stockStatus || "instock";
        document.getElementById("fieldProductDescriptionEn").value = item.descEn;
        document.getElementById("fieldProductDescriptionAr").value = item.descAr;

        const subContainerWrapper = document.getElementById("customBottleSizesDynamicSubContainer");
        subContainerWrapper.innerHTML = "";
        if (item.sizesMatrix && Array.isArray(item.sizesMatrix)) {
            item.sizesMatrix.forEach(node => {
                this.appendCustomSizeRowToStateList(node.sizeLabel, node.priceValue);
            });
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    },

    async triggerDeleteSequence(id) {
        if (confirm("Are you sure you want to permanently delete this product? This action cannot be undone.")) {
            await LoraProductsEngine.absolutePurgeProductEntry(id);
            LoraApp.dispatchNotificationToast("Item purged completely from core production database.");
            await this.renderCatalogListingRegistry();
        }
    },

    async renderCatalogListingRegistry() {
        const wrapperTargetContainer = document.getElementById("adminWorkspaceCatalogActiveDataWrapper");
        if (!wrapperTargetContainer) return;

        const liveDataList = await LoraProductsEngine.retrieveAllActiveProducts();
        if (liveDataList.length === 0) {
            wrapperTargetContainer.innerHTML = `<p class="text-xs text-zinc-500 font-sans p-4">No structured entries active inside primary collection database.</p>`;
            return;
        }

        wrapperTargetContainer.innerHTML = liveDataList.map(item => `
            <div class="bg-[#0e0e0e] border border-zinc-800 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                    <img src="${item.image}" class="w-14 h-14 object-cover border border-zinc-800 rounded-sm">
                    <div>
                        <h4 class="text-sm font-sans font-bold text-white">${item.nameEn} / ${item.nameAr}</h4>
                        <p class="text-xs text-amber-500 tracking-wider uppercase font-mono">${item.category} | ${item.sizesMatrix?.length || 0} Size Profiles Enabled</p>
                    </div>
                </div>
                <div class="flex gap-2 w-full sm:w-auto justify-end">
                    <button type="button" onclick="LoraAdminWorkspace.triggerEditSequence('${item.id}')" class="text-xs bg-zinc-900 border border-amber-500/30 text-amber-400 px-3 py-1 hover:bg-amber-500 hover:text-black transition">Modify</button>
                    <button type="button" onclick="LoraAdminWorkspace.triggerDeleteSequence('${item.id}')" class="text-xs bg-zinc-900 border border-red-500/20 text-red-400 px-3 py-1 hover:bg-red-600 hover:text-white transition">Purge</button>
                </div>
            </div>
        `).join('');
    },

    async loadCurrentStoredSettings() {
        try {
            const documentSettingsMap = await firestoreService.fetchDocument("settings", "config_ledger");
            const elementInputFieldNode = document.getElementById("storeManagementWhatsAppConfigInput");
            if (documentSettingsMap && documentSettingsMap.whatsappNumber && elementInputFieldNode) {
                elementInputFieldNode.value = documentSettingsMap.whatsappNumber;
            }
        } catch (error) {
            console.error("Configuration system parameters state alignment module extraction failed:", error);
        }
    },

    async saveGlobalWhatsAppNumberSettings() {
        const destinationNumValueString = document.getElementById("storeManagementWhatsAppConfigInput").value.trim();
        if (!destinationNumValueString) {
            alert("A valid operational base tracking number string parameter must be specified.");
            return;
        }

        await firestoreService.setDocumentExplicit("settings", "config_ledger", { whatsappNumber: destinationNumValueString });
        LoraApp.state.whatsappNumber = destinationNumValueString;
        LoraApp.dispatchNotificationToast("WhatsApp number system parameters mutated globally.");
    }
};

window.LoraAdminWorkspace = LoraAdminWorkspace;
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("adminWorkspaceProductForm") || document.getElementById("adminWorkspaceCatalogActiveDataWrapper")) {
        LoraAdminWorkspace.initWorkspaceView();
    }
});
export { LoraAdminWorkspace };
