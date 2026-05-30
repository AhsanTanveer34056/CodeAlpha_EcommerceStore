const express = require('express');
const path = require('path');
const { sequelize } = require('./config/database');
require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
  app.listen(PORT, () => {
    console.log(`ShopEasy running at http://localhost:${PORT}`);
    console.log(`Run "npm run seed" first to populate sample data.`);
  });
}).catch(err => {
  console.error('Database sync failed:', err);
  process.exit(1);
});
