const Wishlist = require('../models/Wishlist');

const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id }).populate('items.product');
    if (!wishlist) {
      return res.json({ items: [] });
    }
    
    // Filter out items where the product object is null (in case a product was deleted)
    const validItems = wishlist.items.filter(item => item.product != null);
    
    res.json({ items: validItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        items: [{ product: productId }]
      });
      return res.status(201).json(wishlist);
    }

    const itemExists = wishlist.items.find(item => item.product.toString() === productId);
    if (!itemExists) {
      wishlist.items.push({ product: productId });
      await wishlist.save();
    }
    
    res.status(201).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

    wishlist.items = wishlist.items.filter(item => item.product.toString() !== req.params.productId);
    await wishlist.save();

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
