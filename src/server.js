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
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://my-ecommerce-frontend-omega.vercel.app',
    /fareeds-projects.*\.vercel\.app$/,
    /my-ecommerce-frontend.*\.vercel\.app$/,
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
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);


// Test route
app.get('/', (req, res) => {
  res.send('E-commerce Backend is Running! 🚀');
});

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://my-ecommerce-frontend-omega.vercel.app',
      /\.vercel\.app$/
    ],
    credentials: true
  }
});

// Make io accessible globally
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔗 Socket connected: ${socket.id}`);
  
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`👤 User joined room: ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔗 Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
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