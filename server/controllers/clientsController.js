const _ = require("lodash");
const Clients = require("../models").Clients;
const { validate } = require("../models/clients");
const { wrapController } = require("../middleware/asyncHandler");

const clientsController = {
  create: async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const client = await Clients.create(
      _.pick(req.body, ["name", "address", "phone", "email"]),
    );

    if (!client) return res.status(404).send("client  not found");
    res
      .status(200)
      .json({ data: { status: 1, statusMessage: "Client created!" } });
  },
  list: async (req, res) => {
    const clients = await Clients.findAll();
    if (!clients) return res.status(404).send("Clients  not found");
    res.status(200).json({ data: clients });
  },
  listById: async (req, res) => {
    const client = await Clients.findByPk(req.params.clientId);
    if (!client) return res.status(404).send("Client  not found");
    res.status(200).json({ data: client });
  },
  update: async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let client = await Clients.findByPk(req.params.clientId);
    if (!client) return res.status(404).send("client  not found");
    await client.update(
      _.pick(req.body, ["name", "address", "phone", "email"]),
    );

    res
      .status(200)
      .json({ data: { status: 1, statusMessage: "Client updated!" } });
  },
  delete: async (req, res) => {
    let client = await Clients.findByPk(req.params.clientId);
    if (!client) return res.status(404).send("client  not found");
    await client.destroy();
    res.status(204).send("client deleted");
  },
};

// Errors thrown by any handler go to middleware/errorHandler.js.
module.exports = wrapController(clientsController);
