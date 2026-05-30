const express = require('express');
const { Order, OrderItem, Product } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{ model: OrderItem, include: [{ model: Product }] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: OrderItem, include: [{ model: Product }] }]
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { items, shippingName, shippingAddress, shippingCity, shippingZip } = req.body;

    if (!items || items.length === 0) return res.status(400).json({ error: 'Cart is empty' });
    if (!shippingName || !shippingAddress || !shippingCity || !shippingZip) {
      return res.status(400).json({ error: 'All shipping fields are required' });
    }

    let total = 0;
    const verified = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) return res.status(400).json({ error: `Product not found: ${item.productId}` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for: ${product.name}` });
      }
      total += parseFloat(product.price) * item.quantity;
      verified.push({ productId: product.id, quantity: item.quantity, price: product.price });
    }

    const order = await Order.create({ userId: req.user.id, total, shippingName, shippingAddress, shippingCity, shippingZip });

    for (const item of verified) {
      await OrderItem.create({ ...item, orderId: order.id });
      await Product.decrement('stock', { by: item.quantity, where: { id: item.productId } });
    }

    const fullOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, include: [{ model: Product }] }]
    });

    res.status(201).json(fullOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

module.exports = router;
