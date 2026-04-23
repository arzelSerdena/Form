const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const path = require("path");
const http = require("http");
const server = http.createServer(app);

// Middleware
app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const submitSurveyForm = require("./API/submit");
app.use("/submit", submitSurveyForm);

// Database
mongoose
  .connect(
    "mongodb+srv://arzel_serdena:re4EikDCsC99Qx@expressnodedb.5mszpjq.mongodb.net/",
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((error) => {
    console.error("MongoDB Connection Error: ", error.message);
    process.exit(1);
  });

// Server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
