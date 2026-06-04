const mongoose = require('mongoose');

const SizePriceSchema = new mongoose.Schema({
    size: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
});

const PerfumeSchema = new mongoose.Schema({
    nameEn: {
        type: String,
        required: true,
        trim: true
    },
    nameAr: {
        type: String,
        required: true,
        trim: true
    },
    descriptionEn: {
        type: String,
        required: true
    },
    descriptionAr: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['men', 'women', 'unisex']
    },
    imageUrl: {
        type: String,
        required: true,
        default: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80'
    },
    stock: {
        type: Number,
        required: true,
        default: 10,
        min: 0
    },
    sizes: [SizePriceSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Perfume', PerfumeSchema);
