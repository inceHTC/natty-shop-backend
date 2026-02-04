import express from "express";
import prisma from "../lib/prisma.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

/* =====================
   ÜRÜN LİSTESİ (PUBLIC / VİTRİN)
===================== */
router.get("/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        sizes: true, // 👟 AYAKKABI NUMARALARI (ASIL EKSİK OLAN BUYDU)
      },
    });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ürünler alınamadı" });
  }
});

/* =====================
   TEK ÜRÜN (PUBLIC)
===================== */
router.get("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        sizes: true, // 👟 TEK ÜRÜN SAYFASI İÇİN DE GEREKLİ
      },
    });

    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ürün alınamadı" });
  }
});

/* =====================
   ADMIN - ÜRÜN EKLE
===================== */
router.post(
  "/products",
  upload.array("images", 5),
  async (req, res) => {
    try {
      // 🔑 ARTIK req.body DOLU
      const {
        name,
        description,
        price,
        oldPrice,
        isDiscount,
        isFeatured,
        gender,
        type,
      } = req.body;

      // ❗ ZORUNLU KONTROLLER (ŞART)
      if (!name || !price || !gender || !type) {
        return res.status(400).json({
          message: "Zorunlu alanlar eksik (name, price, gender, type)",
        });
      }

      // 👟 NUMARALAR
      let sizes = [];
      if (req.body.sizes) {
        try {
          sizes = JSON.parse(req.body.sizes);
        } catch {
          sizes = [];
        }
      }

      const product = await prisma.product.create({
  data: {
    name: String(name),
    description: description || "",
    price: Number(price),
    oldPrice:
      isDiscount === "true" || isDiscount === true
        ? Number(oldPrice)
        : null,
    isDiscount: isDiscount === "true" || isDiscount === true,
    isFeatured: isFeatured === "true" || isFeatured === true,
    gender,
    type,
    isActive: true,

    // 🔑 ESKİ SİSTEMLE GERİYE UYUMLULUK
    image: `${gender}/${req.files[0].filename}`,

    sizes:
      type === "ayakkabi" && sizes.length
        ? {
            create: sizes.map((s) => ({
              size: String(s.size),
              stock: Number(s.stock ?? 0),
            })),
          }
        : undefined,

    images: {
      create: req.files.map((file, index) => ({
        url: `${gender}/${file.filename}`,
        isMain: index === 0,
        order: index,
      })),
    },
  },
  include: {
    sizes: true,
    images: true,
  },
});


      res.json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Ürün eklenemedi" });
    }
  },
);


/* =====================
   ADMIN - TEK ÜRÜN
===================== */
router.get("/admin/products/:id", async (req, res) => {
  const id = Number(req.params.id);

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      sizes: true,
    },
  });

  if (!product) {
    return res.status(404).json({ message: "Ürün bulunamadı" });
  }

  res.json(product);
});

/* =====================
   ADMIN - ÜRÜN GÜNCELLE
===================== */
router.put("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    // ❗️ GÜNCELLENEBİLİR ALANLARI TEK TEK AL
    const {
      name,
      description,
      price,
      gender,
      type,
      isFeatured,
      isActive,
      isDiscount,
      oldPrice,
      sizes,
    } = req.body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: Number(price),
        gender,
        type,
        isFeatured: !!isFeatured,
        isActive: !!isActive,
        isDiscount: !!isDiscount,
        oldPrice: isDiscount ? Number(oldPrice) : null,

        // 👟 NUMARALAR
        sizes:
          type === "ayakkabi" && Array.isArray(sizes)
            ? {
                deleteMany: {},
                create: sizes.map((s) => ({
                  size: String(s.size),
                  stock: Number(s.stock ?? 0),
                })),
              }
            : undefined,
      },
      include: {
        sizes: true,
        images: true,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ürün güncellenemedi" });
  }
});

/* =====================
   ADMIN - ÜRÜNE YENİ GÖRSEL EKLE
===================== */
router.post(
  "/products/:id/images",
  upload.array("images", 5),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!req.files || !req.files.length) {
        return res.status(400).json({ message: "Görsel bulunamadı" });
      }

      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        return res.status(404).json({ message: "Ürün bulunamadı" });
      }

      const lastImage = await prisma.productImage.findFirst({
        where: { productId: id },
        orderBy: { order: "desc" },
      });

      const startOrder = lastImage ? lastImage.order + 1 : 0;

      await prisma.productImage.createMany({
        data: req.files.map((file, index) => ({
          productId: id,
          url: `${product.gender}/${file.filename}`,
          isMain: false,
          order: startOrder + index,
        })),
      });

      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Görsel eklenemedi" });
    }
  }
);

/* =====================
   ADMIN - ÜRÜN SİL
===================== */
router.delete("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.product.delete({
      where: { id },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ürün silinemedi" });
  }
});

/* =====================
   ADMIN - ÜRÜN GÖRSELİ SİL
===================== */
router.delete("/product-images/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const image = await prisma.productImage.findUnique({
      where: { id },
    });

    if (!image) {
      return res.status(404).json({ message: "Görsel bulunamadı" });
    }

    await prisma.productImage.delete({
      where: { id },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Görsel silinemedi" });
  }
});


export default router;
