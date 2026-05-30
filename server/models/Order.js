const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  shippingName: { type: DataTypes.STRING, allowNull: false },
  shippingAddress: { type: DataTypes.STRING, allowNull: false },
  shippingCity: { type: DataTypes.STRING, allowNull: false },
  shippingZip: { type: DataTypes.STRING, allowNull: false }
});

module.exports = Order;
