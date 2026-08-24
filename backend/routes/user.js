const express = require('express');
const router = express.Router();
const admin = require('../firebase');
const authMiddleware = require('../middleware/auth');

const db = admin.firestore();
const usersRef = db.collection('users');

// GET /api/user/getdetails/
router.get('/getdetails/', authMiddleware, async (req, res) => {
  try {
    const uid = req.user.uid;
    const doc = await usersRef.doc(uid).get();

    if (doc.exists) {
      return res.json({ success: true, user: doc.data() });
    }

    // Auto-create profile on first login via Firebase Auth
    const profile = {
      uid,
      email: req.user.email || '',
      phone: req.user.phone_number || '',
      name: req.user.name || '',
      createdAt: Date.now(),
    };
    await usersRef.doc(uid).set(profile);
    res.json({ success: true, user: profile });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// POST /api/user/updateprofile/
router.post('/updateprofile/', authMiddleware, async (req, res) => {
  try {
    await usersRef.doc(req.user.uid).set(req.body, { merge: true });
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

module.exports = router;
