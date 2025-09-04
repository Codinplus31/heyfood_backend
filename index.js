// server.js

const express = require("express");
const cors = require("cors");

const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON request body
app.use(express.json());

// Example GET route
app.get("/", (req, res) => {
  res.json({ message: "Hello, Express with CORS in Node.js!" });
});

// Example POST route
app.post("/data", (req, res) => {
  const { name } = req.body;
  res.json({ message: `Hello, ${name}` });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
