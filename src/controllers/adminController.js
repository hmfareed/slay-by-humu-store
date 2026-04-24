const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

const getOverviewStats = async (req, res) => {
  try {
    const { range } = req.query;
    
    let startDate = new Date(0); // default all time
    const now = new Date();
    if (range === '1d') startDate = new Date(now.setDate(now.getDate() - 1));
    else if (range === '1w') startDate = new Date(now.setDate(now.getDate() - 7));
    else if (range === '2w') startDate = new Date(now.setDate(now.getDate() - 14));
    else if (range === '1m') startDate = new Date(now.setMonth(now.getMonth() - 1));
    else if (range === '3m') startDate = new Date(now.setMonth(now.getMonth() - 3));
    else if (range === '6m') startDate = new Date(now.setMonth(now.getMonth() - 6));
    else if (range === '1y') startDate = new Date(now.setFullYear(now.getFullYear() - 1));

    // Run all database queries concurrently using Promise.all to prevent waterfall latency
    const [
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStockCount,
      revenueResult,
      recentActivity,
      salesTrendAgg
    ] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: startDate } }),
      User.countDocuments({ role: 'user', createdAt: { $gte: startDate } }),
      Product.countDocuments(), // total products is usually all-time
      Product.countDocuments({ stock: { $lt: 10 } }),
      
      // MongoDB Aggregation for total revenue across all orders
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
      ]),
      
      // Fetch only the latest 5 orders instead of all orders
      Order.find({ createdAt: { $gte: startDate } }).sort({ createdAt: -1 }).limit(5),
      
      // Group orders by time for the chart
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: range === '1d' || range === '1w' || range === '2w' ? "%Y-%m-%d" : "%Y-%m", date: "$createdAt" } },
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } },
        { $limit: range === '1d' || range === '1w' ? 14 : (range === '2w' || range === '1m' ? 30 : 12) }
      ])
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    const formattedTrend = salesTrendAgg.map(item => ({
      name: item._id, 
      revenue: item.revenue,
      orders: item.orders
    }));

    // Example dummy data fallback if recent sales trend is empty:
    const defaultData = [
      { name: 'Jan', revenue: 4000, orders: 24 },
      { name: 'Feb', revenue: 3000, orders: 13 },
      { name: 'Mar', revenue: 2000, orders: 98 },
      { name: 'Apr', revenue: 2780, orders: 39 },
      { name: 'May', revenue: 1890, orders: 48 },
      { name: 'Jun', revenue: 2390, orders: 38 },
      { name: 'Jul', revenue: 3490, orders: 43 },
    ];

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        lowStockCount,
        recentActivity,
        salesTrend: formattedTrend.length > 0 ? formattedTrend : defaultData
      }
    });

  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: 'Failed to fetch admin stats' });
  }
};

const sendAdminMessage = async (req, res) => {
  try {
    const { title, message, targetUserId } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const io = req.app.get('io'); // get socket io instance if available

    if (targetUserId && targetUserId !== 'all') {
      // Send to specific user
      await createNotification(targetUserId, title, message, 'system', io);
      return res.json({ message: 'Message sent successfully to the user' });
    } else {
      // Send to all users
      const users = await User.find({ role: 'user' }).select('_id');
      
      // We can map over them and create notifications
      const notifications = users.map(user => ({
        user: user._id,
        title,
        message,
        type: 'system'
      }));
      
      // Batch insert is faster
      const Notification = require('../models/Notification');
      await Notification.insertMany(notifications);
      
      // Emit to all users if io is available
      if (io) {
        io.emit('new_notification', { title, message, type: 'system', createdAt: new Date() });
      }

      return res.json({ message: `Message broadcasted to ${users.length} users successfully` });
    }
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

module.exports = { getOverviewStats, sendAdminMessage };
