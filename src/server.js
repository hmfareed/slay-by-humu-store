require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes')
const addressRoutes = require('./routes/addressRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://my-ecommerce-frontend-omega.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/wishlist', wishlistRoutes);


// Test route
app.get('/', (req, res) => {
  res.send('E-commerce Backend is Running! 🚀');
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);

    // Keep-alive: ping self every 14 minutes to prevent Render free tier sleep
    if (process.env.NODE_ENV === 'production') {
      const RENDER_URL = 'https://slay-by-humu-store.onrender.com';
      setInterval(async () => {
        try {
          const res = await fetch(RENDER_URL);
          console.log(`🏓 Keep-alive ping: ${res.status}`);
        } catch (err) {
          console.log('🏓 Keep-alive ping failed:', err.message);
        }
      }, 14 * 60 * 1000); // Every 14 minutes
      console.log('🏓 Keep-alive pinger started (every 14 min)');
    }
  });
};

startServer();