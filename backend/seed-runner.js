// Temporary seed runner that reads credentials from file instead of env var
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const serviceAccount = require('/tmp/sa.json');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();
const productsRef = db.collection('products');

const sampleProducts = [
  {
    name: 'Classic White Sneakers',
    price: 120,
    category: 'Shoes',
    size: '42',
    gender: 'Male',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    description: 'Clean and minimal white sneakers in great condition',
  },
  {
    name: 'Floral Summer Dress',
    price: 85,
    category: 'Dresses',
    size: 'M',
    gender: 'Female',
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400',
    description: 'Light floral dress perfect for summer outings',
  },
  {
    name: 'Leather Crossbody Bag',
    price: 200,
    category: 'Bags',
    size: 'One Size',
    gender: 'Female',
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
    description: 'Genuine leather bag with adjustable strap',
  },
  {
    name: 'Slim Fit Chinos',
    price: 95,
    category: 'Trousers',
    size: '32',
    gender: 'Male',
    imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400',
    description: 'Versatile slim fit chinos for any occasion',
  },
  {
    name: 'Oversized Denim Jacket',
    price: 150,
    category: 'Jackets',
    size: 'L',
    gender: 'Female',
    imageUrl: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400',
    description: 'Vintage-style oversized denim jacket, barely worn',
  },
  {
    name: 'Running Shorts',
    price: 45,
    category: 'Sportswear',
    size: 'M',
    gender: 'Male',
    imageUrl: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=400',
    description: 'Lightweight running shorts with inner lining',
  },
];

async function seed() {
  console.log('Seeding products...');
  for (const product of sampleProducts) {
    const id = uuidv4();
    await productsRef.doc(id).set({
      ...product,
      id,
      status: 0,
      heldBy: '',
      holders: [],
      likes: [],
      wishlist: [],
      comments: [],
      shares: [],
      purchaseRequests: [],
      locked: false,
      watchCount: 0,
      created_at: Date.now(),
    });
    console.log(`Added: ${product.name}`);
  }
  console.log('Done! Cleaning up credentials...');
  require('fs').unlinkSync('/tmp/sa.json');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
