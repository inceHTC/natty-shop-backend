import express from "express";
import prisma from "../lib/prisma.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Tüm route'lar giriş gerektirir
router.use(auth);

// Favori listesi (ürünlerle birlikte)
router.get("/", async (req, res) => {
  try {
    const userId = req.user.userId;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { orderBy: { order: "asc" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const products = favorites.map((f) => f.product);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Favoriler alınamadı" });
  }
});

// Favoriye ekle
router.post("/", async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    const id = Number(productId);
    if (!id) {
      return res.status(400).json({ message: "Geçersiz ürün" });
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
    }

    await prisma.favorite.upsert({
      where: {
        userId_productId: { userId, productId: id },
      },
      create: { userId, productId: id },
      update: {},
    });

    res.json({ message: "Favorilere eklendi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Favoriye eklenemedi" });
  }
});

// Favoriden çıkar
router.delete("/:productId", async (req, res) => {
  try {
    const userId = req.user.userId;
    const productId = Number(req.params.productId);

    if (!productId) {
      return res.status(400).json({ message: "Geçersiz ürün" });
    }

    await prisma.favorite.deleteMany({
      where: { userId, productId },
    });

    res.json({ message: "Favoriden çıkarıldı" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Favoriden çıkarılamadı" });
  }
});

export default router;
