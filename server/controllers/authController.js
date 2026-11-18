const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const Users = require("../models").Users;
const generateAuthToken = require("../services/generateAuthenticationToken");
const { wrapController } = require("../middleware/asyncHandler");

const authCrontroller = {
  auth: async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // The default scope hides the password hash, so ask for it explicitly.
    let user = await Users.scope("withPassword").findOne({
      where: { username: req.body.username },
    });
    if (!user || !user.password)
      return res.status(400).send("Invalid username or password!");

    const validatePassword = await bcrypt.compare(
      req.body.password,
      user.password,
    );
    if (!validatePassword)
      return res.status(400).send("Invalid username or password!");

    const userData = {
      userid: user.id,
      username: user.username,
      profileid: user.profileid,
      first_login_flag: user.first_login_flag,
    };
    const token = generateAuthToken(userData);
    res.send(token);
  },
  updateFirstLogin: async (req, res) => {
    // Runs after the auth middleware: users may only change their own password.
    if (String(req.user.userid) !== String(req.params.userId))
      return res
        .status(403)
        .send("Access denied. You can only change your own password.");

    const { error } = validatePasswordChange(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await Users.findByPk(req.params.userId);
    if (!user) return res.status(404).send("user  not found");

    const salt = await bcrypt.genSalt(10);
    const encryptPwd = await bcrypt.hash(req.body.password, salt);
    await user.update({ first_login_flag: false, password: encryptPwd });
    res
      .status(200)
      .json({ data: { status: 1, statusMessage: "User updated!" } });
  },
};

function validate(req) {
  const schema = Joi.object({
    username: Joi.string().min(5).max(255).required(),
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(req);
}

function validatePasswordChange(body) {
  const schema = Joi.object({
    password: Joi.string().min(8).max(255).required(),
    confirmpassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({ "any.only": "Passwords do not match" }),
  });

  return schema.validate(body);
}

// Errors thrown by any handler go to middleware/errorHandler.js.
module.exports = wrapController(authCrontroller);
