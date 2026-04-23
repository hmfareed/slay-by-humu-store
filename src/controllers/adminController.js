const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const getOverviewStats = async (req, res) => {
  try {
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
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Product.countDocuments(),
      Product.countDocuments({ stock: { $lt: 10 } }),
      
      // MongoDB Aggregation for total revenue across all orders
      Order.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
      ]),
      
      // Fetch only the latest 5 orders instead of all orders
      Order.find().sort({ createdAt: -1 }).limit(5),
      
      // Group orders by month for the chart
      Order.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } },
        { $limit: 6 }
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

module.exports = { getOverviewStats };
