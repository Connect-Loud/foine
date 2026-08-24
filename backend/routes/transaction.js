const express = require('express');
const router = express.Router();
const axios = require('axios');

const PAYSTACK_BASE = 'https://api.paystack.co';

const paystackHeaders = () => ({
  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  'Content-Type': 'application/json',
});

// POST /api/transaction/charge/
// Initiates a Paystack mobile money charge (returns reference + send_otp status)
router.post('/charge/', async (req, res) => {
  try {
    const { email, amount, phone, provider } = req.body;

    const payload = {
      email,
      // Paystack expects pesewas (1 GHS = 100 pesewas); amount from frontend is in GHS
      amount: Math.round(parseFloat(amount) * 100),
      mobile_money: {
        phone,
        provider: (provider || 'mtn').toLowerCase(),
      },
    };

    const { data } = await axios.post(`${PAYSTACK_BASE}/charge`, payload, {
      headers: paystackHeaders(),
    });
    res.json(data);
  } catch (err) {
    const errData = err.response ? err.response.data : { status: false, message: err.message };
    res.status(400).json(errData);
  }
});

// POST /api/transaction/verify-otp/
router.post('/verify-otp/', async (req, res) => {
  try {
    const { otp, reference } = req.body;
    const { data } = await axios.post(
      `${PAYSTACK_BASE}/charge/submit_otp`,
      { otp, reference },
      { headers: paystackHeaders() }
    );
    res.json(data);
  } catch (err) {
    const errData = err.response ? err.response.data : { status: false, message: err.message };
    res.status(400).json(errData);
  }
});

module.exports = router;
