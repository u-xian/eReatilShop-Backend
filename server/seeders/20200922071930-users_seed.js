"use strict";
const bcrypt = require("bcrypt");
require("dotenv").config();

const { faker } = require("@faker-js/faker");

const Profiles_IDS = [1, 2, 3, 4, 5];

module.exports = {
  up: async (queryInterface) => {
    const pwd = await bcrypt.hash(process.env.DEMO_PASSWORD, 10);

    const usersdata = Profiles_IDS.map((profileId) => ({
      name: faker.person.fullName(),
      username: faker.internet.username(),
      email: faker.internet.email({ provider: "eretailshop.com" }),
      phone: faker.phone.number(),
      shopId: faker.number.int({ min: 1, max: 10 }),
      password: pwd,
      status: true,
      first_login_flag: true,
      profileid: profileId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return queryInterface.bulkInsert("Users", usersdata);
  },

  down: async (queryInterface) => queryInterface.bulkDelete("Users", null, {}),
};
