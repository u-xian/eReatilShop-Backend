"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Products", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      productname: {
        type: Sequelize.STRING,
      },
      productnumber: {
        type: Sequelize.STRING,
      },
      imageUrl: {
        type: Sequelize.STRING,
      },
      startinginventory: {
        type: Sequelize.INTEGER,
      },
      inventoryshipped: {
        type: Sequelize.INTEGER,
      },
      inventoryonhand: {
        type: Sequelize.INTEGER,
      },
      minimumurequired: {
        type: Sequelize.INTEGER,
      },
      buyingPrice: {
        type: Sequelize.FLOAT,
      },
      sellingPrice: {
        type: Sequelize.FLOAT,
      },
      categoryId: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Products");
  },
};
