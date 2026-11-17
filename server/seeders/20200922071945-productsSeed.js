"use strict";

const { faker } = require("@faker-js/faker");

const COUNT = 50;

const BEVERAGE_IMAGES = {
  "Sparkling Water": [
    "https://unsplash.com",
    "https://unsplash.com",
    "https://unsplash.com",
  ],
  "Cold Brew": [
    "https://unsplash.com",
    "https://unsplash.com",
    "https://unsplash.com",
  ],
  Kombucha: [
    "https://unsplash.com",
    "https://unsplash.com",
    "https://unsplash.com",
  ],
  Soda: [
    "https://unsplash.com",
    "https://unsplash.com",
    "https://unsplash.com",
  ],
  Juice: [
    "https://unsplash.com",
    "https://unsplash.com",
    "https://unsplash.com",
  ],
  "Energy Drink": [
    "https://unsplash.com",
    "https://unsplash.com",
    "https://unsplash.com",
  ],
  "Iced Tea": [
    "https://unsplash.com",
    "https://unsplash.com",
    "https://unsplash.com",
  ],
};

const drinkTypes = Object.keys(BEVERAGE_IMAGES);
const productCategories = [1, 2, 3];

const productsdata = Array.from({ length: COUNT }, () => {
  const category = faker.helpers.arrayElement(drinkTypes);
  const buyingPrice = parseFloat(
    faker.commerce.price({ min: 1.5, max: 15.99 }),
  );
  const startinginventory = faker.number.int({ min: 5, max: 50 });

  return {
    productname: `${category}`,
    productnumber: faker.commerce.isbn(10),
    imageUrl: faker.helpers.arrayElement(BEVERAGE_IMAGES[category]),
    startinginventory,
    inventoryshipped: 0,
    inventoryonhand: startinginventory,
    buyingPrice,
    sellingPrice: parseFloat(
      (
        buyingPrice +
        faker.number.float({ min: 1.5, max: 9.0, fractionDigits: 2 })
      ).toFixed(2),
    ),
    categoryId: faker.helpers.arrayElement(productCategories),
  };
});

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let products = [];
    productsdata.map((p) => {
      products.push({
        productname: p.productname,
        productnumber: p.productnumber,
        imageUrl: p.imageUrl,
        startinginventory: p.startinginventory,
        inventoryshipped: p.inventoryshipped,
        inventoryonhand: p.inventoryonhand,
        minimumurequired: 5,
        buyingPrice: p.buyingPrice,
        sellingPrice: p.sellingPrice,
        categoryId: p.categoryId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
    return await queryInterface.bulkInsert("Products", products);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete("Products", null, {});
  },
};
