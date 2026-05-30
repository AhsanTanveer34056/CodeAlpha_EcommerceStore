# ShopEasy — E-Commerce Store

A full-stack e-commerce web application built with **Express.js**, **SQLite**, and vanilla **HTML/CSS/JavaScript**.

## Features

- **Product Listings** — Browse products with category filtering and search
- **Product Detail Page** — Full product info with quantity selector
- **Shopping Cart Drawer** — Slide-in cart panel without leaving the page
- **User Authentication** — Register, login, and logout with JWT
- **Order Processing** — Checkout flow with order confirmation
- **Order History** — View past orders per user
- **Skeleton Loaders** — Animated loading placeholders for product grids
- **Mobile Responsive** — Hamburger nav and fully responsive layout
- **Admin Seeded Data** — 12 products across 5 categories pre-loaded

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Backend | Node.js, Express.js |
| Database | SQLite via Sequelize ORM |
| Auth | JSON Web Tokens (JWT) |
| Fonts | Inter (Google Fonts) |
| Icons | Font Awesome 6 |

## Project Structure

```
ecommerce/
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   ├── index.html
│   ├── products.html
│   ├── product.html
│   ├── cart.html
│   ├── checkout.html
│   ├── orders.html
│   ├── login.html
│   └── register.html
├── server/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   └── index.js
│   └── routes/
│       ├── auth.js
│       ├── products.js
│       └── orders.js
├── seed.js
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js v16 or higher
- npm

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/YOUR_USERNAME/CodeAlpha_EcommerceStore.git
   cd CodeAlpha_EcommerceStore
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Seed the database with sample products and users
   ```bash
   npm run seed
   ```

4. Start the server
   ```bash
   npm start
   ```

5. Open your browser and go to
   ```
   http://localhost:3000
   ```

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@store.com | admin123 |
| User | user@store.com | user123 |

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user (auth required) |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | List all products (filter & search) |
| GET | `/api/products/:id` | Get single product |
| GET | `/api/products/categories` | Get all categories |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/orders` | Place a new order (auth required) |
| GET | `/api/orders/my` | Get current user's orders (auth required) |

## Screenshots

> Homepage with featured products and category grid

> Product listing page with skeleton loaders

> Slide-in cart drawer with quantity controls

> Mobile view with hamburger navigation

## License

This project was built as part of the **CodeAlpha Internship Program**.
