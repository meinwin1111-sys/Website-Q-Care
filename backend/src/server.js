require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { getPool } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const petRoutes = require("./routes/petRoutes");
const timeSlotRoutes = require("./routes/timeSlotRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const serviceController = require("./controllers/serviceController");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, callback) => {
    const isLocalhostOrigin = /^http:\/\/localhost:\d+$/.test(origin || "");
    const isVercelOrigin = /^https:\/\/([a-z0-9-]+\.)*vercel\.app$/i.test(origin || "");

    if (!origin || isLocalhostOrigin || isVercelOrigin) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "qcare-api" });
});

app.use("/api/auth", authRoutes);
app.get("/api/categories", serviceController.listCategories);
app.use("/api/services", serviceRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/time-slots", timeSlotRoutes);
app.use("/api/appointments", appointmentRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Lỗi hệ thống." });
});

async function start() {
  try {
    await getPool();
    console.log("Connected to SQL Server");
    app.listen(PORT, () => {
      console.log(`Q Care API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
