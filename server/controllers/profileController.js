const _ = require("lodash");
const { validate } = require("../models/profiles");
const Profiles = require("../models").Profiles;
const { wrapController } = require("../middleware/asyncHandler");

const profileCrontroller = {
  create: async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const profile = await Profiles.create(
      _.pick(req.body, ["profilename", "profile_description"]),
    );

    if (!profile) return res.status(404).send("profile  not found");
    res
      .status(200)
      .json({ data: { status: 1, statusMessage: "Profile created!" } });
  },
  list: async (req, res) => {
    const profiles = await Profiles.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });
    if (!profiles) return res.status(404).send("profile  not found");
    res.status(200).json({ data: profiles });
  },
  listById: async (req, res) => {
    const profile = await Profiles.findByPk(req.params.profileId);
    if (!profile) return res.status(404).send("profile  not found");
    res.status(200).json({ data: profile });
  },
  update: async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let profile = await Profiles.findByPk(req.params.profileId);
    if (!profile) return res.status(404).send("profile  not found");
    await profile.update(
      _.pick(req.body, ["profilename", "profile_description"]),
    );
    res
      .status(200)
      .json({ data: { status: 1, statusMessage: "Profile updated!" } });
  },
  delete: async (req, res) => {
    let profile = await Profiles.findByPk(req.params.profileId);
    if (!profile) return res.status(404).send("profile  not found");
    await profile.destroy();
    res.status(204).send("profile deleted");
  },
};

// Errors thrown by any handler go to middleware/errorHandler.js.
module.exports = wrapController(profileCrontroller);
