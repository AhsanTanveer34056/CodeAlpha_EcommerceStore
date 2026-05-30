const bcrypt = require('bcryptjs');
const { sequelize } = require('./server/config/database');
require('./server/models');
const { User, Product } = require('./server/models');

const products = [
  {
    name: 'Wireless Headphones',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life, foldable design, and crystal-clear audio. Compatible with all Bluetooth devices.',
    price: 79.99, stock: 50, category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&auto=format'
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight and breathable running shoes with responsive foam cushioning and a durable rubber outsole. Perfect for road and trail running.',
    price: 59.99, stock: 30, category: 'Sports',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&auto=format'
  },
  {
    name: 'JavaScript: The Good Parts',
    description: 'A classic guide to JavaScript best practices by Douglas Crockford. Learn the elegant and dependable subset of JavaScript that really works.',
    price: 39.99, stock: 100, category: 'Books',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop&auto=format'
  },
  {
    name: 'Programmable Coffee Maker',
    description: '12-cup programmable coffee maker with built-in burr grinder, thermal carafe, and customizable brew strength settings.',
    price: 49.99, stock: 20, category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop&auto=format'
  },
  {
    name: 'Classic Cotton T-Shirt',
    description: '100% organic cotton t-shirt with a relaxed fit. Pre-shrunk, machine washable, available in multiple colors. Sustainably sourced.',
    price: 19.99, stock: 200, category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop&auto=format'
  },
  {
    name: 'Adjustable Laptop Stand',
    description: 'Ergonomic aluminum laptop stand with 6 height adjustments and heat-dissipating design. Fits laptops from 10 to 17 inches.',
    price: 29.99, stock: 75, category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop&auto=format'
  },
  {
    name: 'Premium Yoga Mat',
    description: 'Non-slip TPE yoga mat with alignment lines and carry strap. 6mm thick for superior joint support. Eco-friendly and sweat-resistant.',
    price: 25.99, stock: 60, category: 'Sports',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=300&fit=crop&auto=format'
  },
  {
    name: 'Python Crash Course',
    description: 'A hands-on, project-based introduction to programming in Python by Eric Matthes. Perfect for beginners and intermediate programmers.',
    price: 44.99, stock: 80, category: 'Books',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop&auto=format'
  },
  {
    name: 'High-Speed Blender',
    description: 'Professional-grade 1200W blender with 6 stainless steel blades, 6 preset programs, and a self-cleaning mode. BPA-free container.',
    price: 69.99, stock: 25, category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&h=300&fit=crop&auto=format'
  },
  {
    name: 'Slim Fit Denim Jeans',
    description: 'Comfortable stretch denim jeans with a modern slim fit. Features 4-way stretch technology for all-day comfort. Available in dark and light wash.',
    price: 54.99, stock: 150, category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400&h=300&fit=crop&auto=format'
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: 'Waterproof (IPX7) Bluetooth speaker with 360-degree surround sound, 24-hour playtime, and built-in speakerphone. Connect two speakers for stereo sound.',
    price: 89.99, stock: 40, category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop&auto=format'
  },
  {
    name: 'Insulated Water Bottle',
    description: 'Triple-insulated stainless steel water bottle that keeps drinks cold for 24 hours or hot for 12 hours. BPA-free, leak-proof lid, 32oz capacity.',
    price: 15.99, stock: 300, category: 'Sports',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop&auto=format'
  }
];

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database reset.');

    const adminPassword = await bcrypt.hash('admin123', 10);
    await User.create({ name: 'Admin User', email: 'admin@store.com', password: adminPassword, role: 'admin' });

    const userPassword = await bcrypt.hash('user123', 10);
    await User.create({ name: 'John Doe', email: 'user@store.com', password: userPassword, role: 'user' });

    await Product.bulkCreate(products);

    console.log('Seeded 12 products and 2 users.');
    console.log('Admin:  admin@store.com / admin123');
    console.log('User:   user@store.com  / user123');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
