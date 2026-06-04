const express = require('express');
const router = express.Router();
const Perfume = require('../models/Perfume');
const Settings = require('../models/Settings');

// INITIALIZE GLOBAL SETTINGS MIDDLEWARE
async function getSettings() {
    let settings = await Settings.findOne();
    if (!settings) {
        settings = await Settings.create({});
    }
    return settings;
}

// ==========================================
// STORE SETTINGS ENDPOINTS
// ==========================================
router.get('/settings', async (req, res) => {
    try {
        const settings = await getSettings();
        return res.status(200).json(settings);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

router.put('/settings', async (req, res) => {
    try {
        const { whatsappNumber, promoTextEn, promoTextAr } = req.body;
        
        // Pure numerical and leading plus validation for global routing formats
        if (whatsappNumber && !/^\+?[1-9]\d{1,14}$/.test(whatsappNumber)) {
            return res.status(400).json({ error: "Invalid WhatsApp country code and number sequence." });
        }

        const settings = await getSettings();
        if (whatsappNumber) settings.whatsappNumber = whatsappNumber;
        if (promoTextEn) settings.promoTextEn = promoTextEn;
        if (promoTextAr) settings.promoTextAr = promoTextAr;

        await settings.save();
        return res.status(200).json(settings);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// ==========================================
// PERFUME CRUD MANAGEMENT ENDPOINTS
// ==========================================

// READ ALL
router.get('/perfumes', async (req, res) => {
    try {
        const perfumes = await Perfume.find().sort({ createdAt: -1 });
        return res.status(200).json(perfumes);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// CREATE
router.post('/perfumes', async (req, res) => {
    try {
        const { nameEn, nameAr, descriptionEn, descriptionAr, category, imageUrl, stock, sizes } = req.body;
        
        if (!sizes || sizes.length === 0) {
            return res.status(400).json({ error: "At least one custom size allocation configuration is required." });
        }

        const newPerfume = new Perfume({
            nameEn, nameAr, descriptionEn, descriptionAr, category, imageUrl, stock, sizes
        });

        await newPerfume.save();
        return res.status(201).json(newPerfume);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

// UPDATE
router.put('/perfumes/:id', async (req, res) => {
    try {
        const { nameEn, nameAr, descriptionEn, descriptionAr, category, imageUrl, stock, sizes } = req.body;
        
        const perfume = await Perfume.findById(req.params.id);
        if (!perfume) return res.status(404).json({ error: "Target product record not identified." });

        perfume.nameEn = nameEn || perfume.nameEn;
        perfume.nameAr = nameAr || perfume.nameAr;
        perfume.descriptionEn = descriptionEn || perfume.descriptionEn;
        perfume.descriptionAr = descriptionAr || perfume.descriptionAr;
        perfume.category = category || perfume.category;
        perfume.imageUrl = imageUrl || perfume.imageUrl;
        if (stock !== undefined) perfume.stock = stock;
        if (sizes) perfume.sizes = sizes;

        await perfume.save();
        return res.status(200).json(perfume);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

// DELETE
router.delete('/perfumes/:id', async (req, res) => {
    try {
        const perfume = await Perfume.findByIdAndDelete(req.params.id);
        if (!perfume) return res.status(404).json({ error: "Target product record not identified for purge." });
        return res.status(200).json({ success: true, message: "Product record purged permanently from database layer." });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
