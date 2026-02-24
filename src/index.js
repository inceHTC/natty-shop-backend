import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import productsRouter from "./routes/products.js";
import authRouter from "./routes/auth.js";
import adminRouter from "./routes/admin.js";
import ordersRouter from "./routes/orders.js";
import profileRouter from "./routes/profile.js";
import addressRouter from "./routes/addresses.js";
import favoritesRouter from "./routes/favorites.js";
import contactRouter from "./routes/contact.js";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET tanımlı değil!");
}

console.log("JWT SECRET AKTİF:", !!process.env.JWT_SECRET);

const app = express();
const PORT = process.env.PORT || 5000;

// ES module için __dirname (backend klasörü = src'nin bir üstü)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");

// Ürün görselleri için klasörler yoksa oluştur (Railway deploy'da gerekli)
const imagesDir = path.join(projectRoot, "public", "images");
[imagesDir, path.join(imagesDir, "kadin"), path.join(imagesDir, "erkek")].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// middleware
app.use(cors());
app.use(express.json());

// Görsel ve video: her zaman backend/public üzerinden (cwd'den bağımsız)
app.use("/images", express.static(path.join(projectRoot, "public", "images")));
app.use("/videos", express.static(path.join(projectRoot, "public", "videos")));

// routes
app.use("/products", productsRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/orders", ordersRouter);
app.use("/profile", profileRouter);
app.use("/addresses", addressRouter);
app.use("/favorites", favoritesRouter);
app.use("/contact", contactRouter);

// test route
app.get("/", (req, res) => {
  res.send("Backend çalışıyor 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
