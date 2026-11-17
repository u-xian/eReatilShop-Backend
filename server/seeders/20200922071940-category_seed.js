"use strict";

const categories = [
  "Water and Sparkling Drinks",
  "Soft Drinks and Juices",
  "Coffee, Tea and Functional Drinks",
].map((name) => ({
  name,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

module.exports = {
  up: async (queryInterface) =>
    queryInterface.bulkInsert("Categories", categories),
  down: async (queryInterface) =>
    queryInterface.bulkDelete("Categories", null, {}),
};
