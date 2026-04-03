
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { sequelize, seedAdmin } = require("./models");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const recordRoutes = require("./routes/record.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/document", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    message: "Too many requests"
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10,
  message: {
    message: "Too many login attempts"
  },
});

app.use(globalLimiter);

app.get("/", (req, res) => {
  res.json({ message: "Finance Dashboard API Running." });
});

app.use("/api/auth",authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/dashboard", dashboardRoutes);


app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal server error." });
});

const PORT = process.env.PORT || 5000;
sequelize.sync({ alter: true })
  .then(async () => {
    console.log("Database synced.");
    await seedAdmin();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database sync failed:", err);
  });

module.exports = app;
