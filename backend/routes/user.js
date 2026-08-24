const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const hash = require('password-hash');
const { v4: uuidv4 } = require('uuid');
const admin = require('../firebase');
const authMiddleware = require('../middleware/auth');

const db = admin.firestore();
const usersRef = db.collection('users');

const signToken = (uid, email) =>
  jwt.sign({ uid, email }, process.env.JWT_SECRET, { expiresIn: '30d' });

const safeUser = (user, token) => {
  const { hashedPassword, ...rest } = user;
  return { ...rest, token };
};

// POST /api/user/signup/
router.post('/signup/', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password || !name) {
      return res.json({ success: false, message: 'Email, password and name are required' });
    }

    const existing = await usersRef.where('email', '==', email).get();
    if (!existing.empty) {
      return res.json({ success: false, message: 'Email already registered' });
    }

    const id = uuidv4();
    const user = {
      id,
      email,
      name,
      phone: phone || '',
      hashedPassword: hash.generate(password),
      createdAt: Date.now(),
    };
    await usersRef.doc(id).set(user);

    const token = signToken(id, email);
    res.json({ success: true, user: safeUser(user, token) });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// POST /api/user/signin/
router.post('/signin/', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ success: false, message: 'Email and password required' });
    }

    const snapshot = await usersRef.where('email', '==', email).get();
    if (snapshot.empty) {
      return res.json({ success: false, message: 'Email not found' });
    }

    const user = snapshot.docs[0].data();
    if (!hash.verify(password, user.hashedPassword)) {
      return res.json({ success: false, message: 'Incorrect password' });
    }

    const token = signToken(user.id, user.email);
    res.json({ success: true, user: safeUser(user, token) });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// GET /api/user/getdetails/
router.get('/getdetails/', authMiddleware, async (req, res) => {
  try {
    const doc = await usersRef.doc(req.user.uid).get();
    if (!doc.exists) {
      return res.json({ success: false, message: 'User not found' });
    }
    const { hashedPassword, ...rest } = doc.data();
    res.json({ success: true, user: rest });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

module.exports = router;
