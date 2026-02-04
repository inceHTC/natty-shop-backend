import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

/* =====================
   ÜRÜNLER (PUBLIC + FİLTRELİ)
===================== */
router.get("/", async (req, res) => {
  try {
    const {
      gender,
      type,
      discount,
      q,
      sizes,
      minPrice,
      maxPrice,
      inStock,
    } = req.query;

    const where = {
      isActive: true,
    };

    // 👩‍🦰 / 👨‍🦱 Cinsiyet
    if (gender) where.gender = gender;

    // 👟 Ürün tipi
    if (type) where.type = type;

    // 🔥 İndirim
    if (discount === "true") where.isDiscount = true;

    // 🔍 Arama
    if (q && q.trim()) {
      where.OR = [
        { name: { contains: q.trim(), mode: "insensitive" } },
        { description: { contains: q.trim(), mode: "insensitive" } },
      ];
    }

    // 💰 Fiyat filtresi
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    // 📦 Stokta olanlar
    if (inStock === "true") {
      where.sizes = {
        some: {
          stock: { gt: 0 },
        },
      };
    }

    // 👟 Ayakkabı numarası filtresi (STRING)
    if (sizes) {
      const sizeArray = sizes.split(","); // ❗ Number'a çevirme YOK

      where.sizes = {
        some: {
          size: { in: sizeArray },
          stock: { gt: 0 },
        },
      };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        images: { orderBy: { order: "asc" } },
        sizes: true,
      },
    });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ürünler alınamadı" });
  }
});


/* =====================
   ⭐ ANASAYFA (FEATURED)
===================== */
router.get("/featured", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 8, 200);
    const products = await prisma.product.findMany({
      where: {
        isFeatured: true,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        sizes: true, // 👟 EKLENDİ
      },
    });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ürünler alınamadı" });
  }
});

/* =====================
   🆕 YENİ GELENLER (latest N)
===================== */
router.get("/new", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 8, 100);
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        images: { orderBy: { order: "asc" } },
        sizes: true, // 👟 EKLENDİ
      },
    });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ürünler alınamadı" });
  }
});

/* =====================
   🔹 TEK ÜRÜN
===================== */
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        sizes: true, // 👟 TEK ÜRÜN SAYFASI İÇİN DE ŞART
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ürün bulunamadı" });
  }
});

export default router;
