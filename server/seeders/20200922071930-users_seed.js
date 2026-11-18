"use strict";
const bcrypt = require("bcrypt");
require("dotenv").config();

const { faker } = require("@faker-js/faker");

const COUNT = 5;

module.exports = {
  up: async (queryInterface) => {
    const pwd = await bcrypt.hash(process.env.DEMO_PASSWORD, 10);

    const usersdata = Array.from({ length: COUNT }, () => ({
      name: faker.person.fullName(),
      username: faker.internet.username(),
      email: faker.internet.email({ provider: "eretailshop.com" }),
      phone: faker.phone.number(),
      shopId: faker.number.int({ min: 1, max: 10 }),
      password: pwd,
      status: true,
      first_login_flag: true,
      profileid: faker.number.int({ min: 1, max: 5 }),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return queryInterface.bulkInsert("Users", usersdata);
  },

  down: async (queryInterface) => queryInterface.bulkDelete("Users", null, {}),
};
