const admin = require('../firebase');

module.exports = async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try {
    req.user = await admin.auth().verifyIdToken(auth.split(' ')[1]);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
