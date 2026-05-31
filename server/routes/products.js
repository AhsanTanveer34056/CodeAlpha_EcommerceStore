const express = require('express');
const { Op, fn, col } = require('sequelize');
const { Product } = require('../models');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 12, delay } = req.query;
    if (delay) {
      await new Promise(resolve => setTimeout(resolve, parseInt(delay)));
    }
    const where = {};
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (category) where.category = category;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({ products: rows, total: count, pages: Math.ceil(count / limit), currentPage: parseInt(page) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const rows = await Product.findAll({ attributes: [[fn('DISTINCT', col('category')), 'category']], raw: true });
    res.json(rows.map(r => r.category).filter(Boolean));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.post('/', authenticate, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to create product' });
  }
});

router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await product.update(req.body);
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
