/**
 * Seed demo data — run from backend/: node scripts/seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Farm = require('../src/models/Farm');
const Equipment = require('../src/models/Equipment');
const ForumPost = require('../src/models/ForumPost');
const connectDb = require('../src/config/db');

const seed = async () => {
  await connectDb();

  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Farm.deleteMany({}),
    Equipment.deleteMany({}),
    ForumPost.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash('password123', 10);

  const farmer = await User.create({
    name: 'Demo Farmer',
    email: 'farmer@demo.com',
    passwordHash,
    role: 'farmer',
    isVerified: true,
    phone: '9876543210',
    address: 'Nashik, Maharashtra',
  });

  const consumer = await User.create({
    name: 'Demo Consumer',
    email: 'consumer@demo.com',
    passwordHash,
    role: 'consumer',
    isVerified: true,
    phone: '9123456780',
    address: 'Pune, Maharashtra',
  });

  const expert = await User.create({
    name: 'Demo Expert',
    email: 'expert@demo.com',
    passwordHash,
    role: 'expert',
    isVerified: true,
  });

  const delivery = await User.create({
    name: 'Demo Delivery',
    email: 'delivery@demo.com',
    passwordHash,
    role: 'delivery',
    isVerified: true,
  });

  const owner = await User.create({
    name: 'Demo Owner',
    email: 'owner@demo.com',
    passwordHash,
    role: 'equipment_owner',
    isVerified: true,
  });

  await Farm.create({
    farmerId: farmer._id,
    farmName: 'Green Valley Farm',
    location: 'Nashik',
    area: 12,
    soilType: 'Black soil',
  });

  await Product.insertMany([
    {
      farmerId: farmer._id,
      title: 'Organic Tomatoes',
      description: 'Fresh vine-ripened tomatoes.',
      category: 'Vegetables',
      price: 80,
      quantity: 50,
      organicStatus: true,
    },
    {
      farmerId: farmer._id,
      title: 'Fresh Spinach',
      description: 'Leafy greens harvested daily.',
      category: 'Vegetables',
      price: 40,
      quantity: 30,
      organicStatus: false,
    },
    {
      farmerId: farmer._id,
      title: 'Basmati Rice',
      description: 'Premium aged basmati rice.',
      category: 'Grains',
      price: 120,
      quantity: 100,
      organicStatus: true,
    },
  ]);

  await Equipment.create({
    ownerId: owner._id,
    equipmentName: 'Mahindra Tractor',
    category: 'Tractor',
    description: '45 HP tractor with operator.',
    rentalPrice: 2500,
  });

  await ForumPost.create({
    authorId: farmer._id,
    title: 'Best drip irrigation setup',
    content: 'Sharing my experience with drip lines for tomato farms in summer.',
    likes: [consumer._id],
    comments: [
      {
        userId: expert._id,
        text: 'Use 16mm drip lines with 4L/hr emitters for best results.',
        replies: [],
      },
    ],
  });

  console.log('\n✅ Seed complete. All passwords: password123\n');
  console.log('  consumer@demo.com  → /consumer/dashboard');
  console.log('  farmer@demo.com    → /farmer/dashboard');
  console.log('  expert@demo.com    → /expert/dashboard');
  console.log('  delivery@demo.com  → /delivery-partner/dashboard');
  console.log('  owner@demo.com     → /equipment-owner/dashboard\n');

  await mongoose.disconnect();
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
