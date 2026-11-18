const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError, DatabaseError } =
  require("sequelize");

// Last middleware in app.js. Turns any error into a response instead of a crash
// or a hanging request. Details of unexpected errors are logged, not sent.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  // Malformed JSON, body too large, ... (raised by body-parser)
  if (err.type === "entity.parse.failed")
    return res.status(400).send("Invalid JSON in request body.");
  if (err.expose && err.status >= 400 && err.status < 500)
    return res.status(err.status).send(err.message);

  if (err instanceof UniqueConstraintError)
    return res.status(409).send("A record with this value already exists.");
  if (err instanceof ValidationError)
    return res.status(400).send(err.errors?.[0]?.message || "Invalid data.");
  if (err instanceof ForeignKeyConstraintError)
    return res.status(400).send("A referenced record does not exist.");
  // PostgreSQL "data exception" errors (class 22): e.g. "abc" or 99999999999
  // given for an integer id. These come from bad input, not from the server.
  if (err instanceof DatabaseError && String(err.parent?.code).startsWith("22"))
    return res.status(400).send("Invalid value in request.");

  console.error(`${req.method} ${req.originalUrl} failed:`, err);
  return res.status(500).send("Internal server error.");
}

module.exports = errorHandler;
