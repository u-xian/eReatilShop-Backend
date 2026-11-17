const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const cors = require("cors");
const indexRouter = require("./server/routes");

// Set up the express app
const app = express();

app.use(cors());

// Log requests to the console.
app.use(logger("dev"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/api/v1", indexRouter);

module.exports = app;
