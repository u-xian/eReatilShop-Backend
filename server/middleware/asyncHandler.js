// Express 4 does not catch errors from async handlers: a rejected promise is
// never passed to next(), and Node ends the process on unhandled rejections.
// These helpers forward any error to the error handler (middleware/errorHandler.js).

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve()
    .then(() => fn(req, res, next))
    .catch(next);

// Wraps every function of a controller object, e.g. { create, list, ... }.
const wrapController = (controller) =>
  Object.fromEntries(
    Object.entries(controller).map(([name, value]) => [
      name,
      typeof value === "function" ? asyncHandler(value) : value,
    ]),
  );

module.exports = { asyncHandler, wrapController };
