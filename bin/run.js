// This will be our application entry. We'll setup our server here.
require("dotenv").config();

// Tokens cannot be signed or checked without this key, so do not start.
if (!process.env.jwtPrivateKey) {
  console.error("jwtPrivateKey is not set (see .env.example). Refusing to start.");
  process.exit(1);
}

const http = require("http");
const app = require("../app"); // The express app we just created

const port = parseInt(process.env.PORT, 10) || 8000;
app.set("port", port);

const server = http.createServer(app);
server.listen(port);
