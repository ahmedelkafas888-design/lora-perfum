import { firestoreService } from "./firebase.js";

// LORA Unified Production Datastore Sync Engine Module
const LoraProductsEngine = {
    async retrieveAllActiveProducts() {
        // Enforces absolute requirement: Cloud Firestore is the ONLY source of truth. No mocks or local storage fallbacks.
        try {
            return await firestoreService.fetchCollection("products");
        } catch (error) {
            console.error("Critical fault retrieving live product data ledger from remote Firestore cloud instance:", error);
            return [];
        }
    },

    async retrieveSingleProduct(id) {
        try {
            return await firestoreService.fetchDocument("products", id);
        } catch (error) {
            console.error(`Fault locating singular item data map matching parameters explicitly on index id ${id}:`, error);
            return null;
        }
    },

    async persistNewProductEntry(productObjectData) {
        try {
            return await firestoreService.createDocument("products", productObjectData);
        } catch (error) {
            console.error("Failed validation entry parameters allocation trace inside active database schema write command:", error);
            throw error;
        }
    },

    async updateExistingProductEntry(id, partialOrFullModifiedDataPayload) {
        try {
            return await firestoreService.updateDocument("products", id, partialOrFullModifiedDataPayload);
        } catch (error) {
            console.error(`Exception writing live patch parameter stack directly to reference instance index record map ${id}:`, error);
            throw error;
        }
    },

    async absolutePurgeProductEntry(id) {
        try {
            return await firestoreService.deleteDocument("products", id);
        } catch (error) {
            console.error(`Erase operational state trace sequence execution crashed on specific database item document row ${id}:`, error);
            throw error;
        }
    }
};

window.LoraProductsEngine = LoraProductsEngine;
export { LoraProductsEngine };
