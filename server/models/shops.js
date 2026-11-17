"use strict";
const Joi = require("joi");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Shops extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Shops.init(
    {
      name: DataTypes.STRING,
      code: DataTypes.STRING,
      type: DataTypes.STRING,
      address: DataTypes.STRING,
      city: DataTypes.STRING,
      phone: DataTypes.STRING,
      email: DataTypes.STRING,
      status: DataTypes.BOOLEAN,
      deletedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Shops",
    },
  );
  return Shops;
};

function validateShops(shop) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    code: Joi.string().min(2).max(50).required(),
    type: Joi.string().min(2).max(50).required(),
    address: Joi.string().min(2).max(100).required(),
    city: Joi.string().min(2).max(50).required(),
    phone: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    status: Joi.boolean(),
  });

  return schema.validate(shop);
}

module.exports.validate = validateShops;
