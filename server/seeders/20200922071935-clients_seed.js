"use strict";
const bcrypt = require("bcrypt");
require("dotenv").config();

const { faker } = require("@faker-js/faker");

const COUNT = 10;

module.exports = {
  up: async (queryInterface) => {
    const pwd = await bcrypt.hash(process.env.DEMO_PASSWORD, 10);

    const clientsdata = Array.from({ length: COUNT }, () => ({
      name: faker.person.fullName(),
      address: faker.location.streetAddress(),
      phone: faker.phone.number(),
      email: faker.internet.email(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return queryInterface.bulkInsert("Clients", clientsdata);
  },

  down: async (queryInterface) =>
    queryInterface.bulkDelete("Clients", null, {}),
};
