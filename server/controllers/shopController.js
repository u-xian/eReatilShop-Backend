const _ = require("lodash");
const { validate } = require("../models/shops");
const Shops = require("../models").Shops;

const shopController = {
  create: async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const existingShop = await Shops.findOne({
      where: { code: req.body.code },
    });
    if (existingShop)
      return res.status(400).send("Shop with this code already exists");

    const shop = await Shops.create(
      _.pick(req.body, [
        "name",
        "code",
        "type",
        "address",
        "city",
        "phone",
        "email",
        "status",
      ]),
    );

    if (!shop) return res.status(404).send("Shop  not found");
    res
      .status(200)
      .json({ data: { status: 1, statusMessage: "Shop created!" } });
  },
  list: async (req, res) => {
    const shops = await Shops.findAll();
    if (!shops) return res.status(404).send("Shops  not found");
    res.status(200).json({ data: shops });
  },
  listById: async (req, res) => {
    const shop = await Shops.findByPk(req.params.shopId);
    if (!shop) return res.status(404).send("Shop  not found");
    res.status(200).json({ data: shop });
  },
  update: async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let shop = await Shops.findByPk(req.params.shopId);
    if (!shop) return res.status(404).send("Shop  not found");
    await shop.update(
      _.pick(req.body, [
        "name",
        "code",
        "type",
        "address",
        "city",
        "phone",
        "email",
        "status",
      ]),
    );
    res
      .status(200)
      .json({ data: { status: 1, statusMessage: "Shop updated!" } });
  },
  delete: async (req, res) => {
    let shop = await Shops.findByPk(req.params.shopId);
    if (!shop) return res.status(404).send("Shop  not found");
    await shop.destroy();
    res.status(204).send("Shop deleted");
  },
};

module.exports = shopController;
