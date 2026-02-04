import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import productsRouter from "./routes/products.js";
import authRouter from "./routes/auth.js";
import adminRouter from "./routes/admin.js";
import ordersRouter from "./routes/orders.js";
import profileRouter from "./routes/profile.js";
import addressRouter from "./routes/addresses.js";
import favoritesRouter from "./routes/favorites.js";
import contactRouter from "./routes/contact.js";

const app = express();

// 🔹 Render PORT
const PORT = process.env.PORT || 5000;

// 🔹 ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔹 CORS (Netlify + Local)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://natty-shop.netlify.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

// 🔹 Static files
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/videos", express.static(path.join(__dirname, "public/videos")));

// 🔹 Routes
app.use("/products", productsRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/orders", ordersRouter);
app.use("/profile", profileRouter);
app.use("/addresses", addressRouter);
app.use("/favorites", favoritesRouter);
app.use("/contact", contactRouter);

// 🔹 Test
app.get("/", (req, res) => {
  res.send("Backend çalışıyor 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
