import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import doctorRoutes from "./routes/doctors.js";
import appointmentRoutes from "./routes/appointments.js";
import adminRoutes from "./routes/admin.js";
import "./database.js";

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 24) {
  console.error("JWT_SECRET is missing or too short. Copy the root .env.example to .env and set a long secret.");
  process.exit(1);
}
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "20kb" }));
app.get("/api/health", (req, res) => res.json({ status: "ok", message: "HealthCare+ API is running." }));
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin", adminRoutes);
app.use((req, res) => res.status(404).json({ message: "API endpoint not found." }));
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Unexpected server error." });
});
const port = Number(process.env.PORT || 5000);
app.listen(port, () => console.log(`HealthCare+ API listening on http://localhost:${port}`));
