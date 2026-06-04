import { LoraApp } from "./script.js";

const LoraCartController = {
    addItemToCart(id, targetSelectedSizeStr, unitValueCostPrice) {
        let currentCartDataItems = LoraApp.state.cart;
        const matchingIndexRef = currentCartDataItems.findIndex(i => i.id === id && i.selectedSize === targetSelectedSizeStr);

        if (matchingIndexRef !== -1) {
            currentCartDataItems[matchingIndexRef].qty += 1;
        } else {
            currentCartDataItems.push({
                id: id,
                selectedSize: targetSelectedSizeStr,
                price: parseFloat(unitValueCostPrice),
                qty: 1
            });
        }

        localStorage.setItem("lora_brand_cart", JSON.stringify(currentCartDataItems));
        LoraApp.synchronizeBadgeMetrics();
        LoraApp.dispatchNotificationToast("addedToCart");
    },

    removeItemFromCart(id, targetSelectedSizeStr) {
        let currentCartDataItems = LoraApp.state.cart;
        currentCartDataItems = currentCartDataItems.filter(i => !(i.id === id && i.selectedSize === targetSelectedSizeStr));
        localStorage.setItem("lora_brand_cart", JSON.stringify(currentCartDataItems));
        LoraApp.synchronizeBadgeMetrics();
        if (typeof window.reHydrateCartDisplayDOMView === "function") {
            window.reHydrateCartDisplayDOMView();
        }
    },

    modifyItemQuantity(id, targetSelectedSizeStr, numericalAmountDeltaQty) {
        let currentCartDataItems = LoraApp.state.cart;
        const matchingIndexRef = currentCartDataItems.findIndex(i => i.id === id && i.selectedSize === targetSelectedSizeStr);

        if (matchingIndexRef !== -1) {
            currentCartDataItems[matchingIndexRef].qty = parseInt(numericalAmountDeltaQty);
            if (currentCartDataItems[matchingIndexRef].qty <= 0) {
                this.removeItemFromCart(id, targetSelectedSizeStr);
                return;
            }
            localStorage.setItem("lora_brand_cart", JSON.stringify(currentCartDataItems));
            LoraApp.synchronizeBadgeMetrics();
            if (typeof window.reHydrateCartDisplayDOMView === "function") {
                window.reHydrateCartDisplayDOMView();
            }
        }
    }
};

window.LoraCartController = LoraCartController;
export { LoraCartController };
