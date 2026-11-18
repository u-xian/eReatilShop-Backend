# eRetailShop Backend

REST API for a retail shop: products and stock, clients, orders and sales, users with roles, and mobile money payments (MTN MoMo sandbox).

## Features

- **Inventory**
  - Products with categories, buying and selling price, stock on hand and minimum stock
  - Update the stock count when items are sold
- **Sales**
  - Orders with an invoice number, tax, net and total price, and payment method
  - Sale lines that link a product to an order
- **Clients**
  - Create, list, update, delete
- **Users and roles**
  - Login with a token that lasts one hour
  - First-login password change
  - Three profiles: store manager (1), inventory manager (2), cashier (3)
- **Payments**
  - Request a mobile money payment and check its status (sandbox)

## Tech stack

- Node.js
- Express
- Sequelize and sequelize-cli
- PostgreSQL
- JSON Web Tokens and bcrypt
- Joi, for request validation
- axios, for the payment provider calls
- Vitest, for tests

## Requirements

- Node.js 20 or newer
- PostgreSQL, running on your machine, with a user that can create databases

## Setup

```
npm install
cp .env.example .env        # then edit .env with your own values
npm run db:setup            # creates the database, the tables and the sample data
npm start
```

`jwtPrivateKey` must be set in `.env`: the server will not start without it.

## Tests

The API tests use a separate database (`DB_NAME_TEST` in `.env`). Create it once:

```
NODE_ENV=test npm run db:create
NODE_ENV=test npm run migrate
npm test
```
