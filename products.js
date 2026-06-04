import { dbEngine } from "./firebase.js";

// Dedicated direct pipeline abstraction module for product asset management
const ProductsManager = {
    async fetchAllProducts() {
        return await dbEngine.getCollection("products");
    },

    async fetchSingleProduct(id) {
        return await dbEngine.getDocument("products", id);
    },

    async createProduct(productData) {
        return await dbEngine.createDocument("products", productData);
    },

    async updateProduct(id, productData) {
        return await dbEngine.updateDocument("products", id, productData);
    },

    async deleteProduct(id) {
        return await dbEngine.deleteDocument("products", id);
    }
};

export { ProductsManager };
