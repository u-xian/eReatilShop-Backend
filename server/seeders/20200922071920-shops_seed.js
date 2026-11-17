"use strict";

const shops = [
  ["Central Warehouse", "WH01", "warehouse", "Industrial Park"],
  ["Maple Street Mart", "MPL01", "shop", "Maple Street"],
  ["Harbor Point Market", "HBR01", "shop", "Harbor Point"],
  ["Riverside Corner Shop", "RVS01", "shop", "Riverside"],
  ["Oakwood Retail Point", "OAK01", "shop", "Oakwood"],
  ["Hillcrest Family Store", "HLC01", "shop", "Hillcrest"],
  ["Lakeview Express", "LKV01", "shop", "Lakeview"],
  ["Willow Park Select", "WLP01", "shop", "Willow Park"],
  ["Cedar Grove Daily Needs", "CDR01", "shop", "Cedar Grove"],
  ["Downtown Outlet", "DTN01", "shop", "Downtown"],
].map(([name, code, type, address]) => ({
  name,
  code,
  type,
  address,
  city: "Riverton",
  status: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

module.exports = {
  up: async (queryInterface) => queryInterface.bulkInsert("Shops", shops),
  down: async (queryInterface) => queryInterface.bulkDelete("Shops", null, {}),
};
