"use strict";
const profilesData = require("./profilesData.json");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let profiles = [];
    profilesData.map((c) => {
      profiles.push({
        profilename: c.profilename,
        profile_description: c.profile_description,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
    return await queryInterface.bulkInsert("Profiles", profiles);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete("Profiles", null, {});
  },
};
