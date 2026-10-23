const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();


if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "replace-with-a-random-local-secret") {
  console.error("Set a private JWT_SECRET in backend/.env before starting CropPilot.");
  process.exit(1);
}

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL || process.env.CLINT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: [...new Set(allowedOrigins)],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/scan", require("./routes/scan"));
app.use("/api/treatment", require("./routes/treatment"));
app.use("/api/weather", require("./routes/weatherRoutes"));

app.get("/", (req, res) => {
  res.send("CropPilot API is running.");
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log("CropPilot API listening on port " + PORT));
});
