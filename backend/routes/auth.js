import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../database.js";

const router = Router();
const publicUser = (user) => ({
  id: user.id, name: user.name, email: user.email, role: user.role, doctorId: user.doctor_id
});

router.post("/signup", (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const phone = String(req.body.phone || "").trim();
  if (name.length < 2 || name.length > 80) return res.status(400).json({ message: "Name must be between 2 and 80 characters." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Enter a valid email address." });
  if (password.length < 6 || password.length > 72) return res.status(400).json({ message: "Password must be at least 6 characters." });
  try {
    const result = db.prepare("INSERT INTO users (name,email,password,role,phone) VALUES (?,?,?,'patient',?)")
      .run(name, email, bcrypt.hashSync(password, 10), phone);
    const user = db.prepare("SELECT * FROM users WHERE id=?").get(result.lastInsertRowid);
    const token = jwt.sign(publicUser(user), process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: publicUser(user) });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") return res.status(409).json({ message: "This email is already registered." });
    res.status(500).json({ message: "Could not create your account." });
  }
});

router.post("/login", (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const user = db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: "Email or password is incorrect." });
  }
  const token = jwt.sign(publicUser(user), process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: publicUser(user) });
});

export default router;
