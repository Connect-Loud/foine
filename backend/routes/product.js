const express = require('express');
const router = express.Router();
const admin = require('../firebase');

const db = admin.firestore();
const productsRef = db.collection('products');
const holdCounterRef = db.collection('holdCounter');

const MAX_HOLDS = 3;

// POST /api/product/hold/
router.post('/hold/', async (req, res) => {
  try {
    const { userId, product } = req.body;
    if (!userId || !product || !product.id) {
      return res.json({ data: { status: false, message: 'Missing userId or product' } });
    }

    const prodDoc = await productsRef.doc(product.id).get();
    if (!prodDoc.exists) {
      return res.json({ data: { status: false, message: 'Product not found' } });
    }
    if (prodDoc.data().status !== 0) {
      return res.json({ data: { status: false, message: 'Product is not available to hold' } });
    }

    const counterDoc = await holdCounterRef.doc(userId).get();
    const count = counterDoc.exists ? counterDoc.data().count : 0;
    if (count >= MAX_HOLDS) {
      return res.json({ data: { status: false, message: `You can only hold up to ${MAX_HOLDS} items at a time` } });
    }

    await productsRef.doc(product.id).update({ heldBy: userId, status: 1 });

    if (counterDoc.exists) {
      await holdCounterRef.doc(userId).update({ count: count + 1 });
    } else {
      await holdCounterRef.doc(userId).set({ userId, count: 1 });
    }

    res.json({ data: { status: true, message: 'Product held successfully! Others can still request to buy it.' } });
  } catch (err) {
    res.json({ data: { status: false, message: err.message } });
  }
});

// POST /api/product/accept-request/
router.post('/accept-request/', async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.json({ status: false, message: 'Missing userId or productId' });
    }

    const prodDoc = await productsRef.doc(productId).get();
    if (!prodDoc.exists) {
      return res.json({ status: false, message: 'Product not found' });
    }

    await productsRef.doc(productId).update({ locked: true });
    res.json({ status: true, message: 'Purchase request accepted' });
  } catch (err) {
    res.json({ status: false, message: err.message });
  }
});

module.exports = router;
