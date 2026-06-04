const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    whatsappNumber: {
        type: String,
        required: true,
        default: '+201000000000'
    },
    promoTextEn: {
        type: String,
        required: true,
        default: 'Exclusive Discounts & Special Offers'
    },
    promoTextAr: {
        type: String,
        required: true,
        default: 'خصومات وعروض حصرية'
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
