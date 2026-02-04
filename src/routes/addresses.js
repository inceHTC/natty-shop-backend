import express from "express";
import prisma from "../lib/prisma.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// 📦 Kullanıcının adresleri
router.get("/", auth, async (req, res) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user.userId },
    orderBy: { createdAt: "desc" },
  });

  res.json(addresses);
});

// ➕ Adres ekle
router.post("/", auth, async (req, res) => {
  const { title, fullName, phone, city, district, address } = req.body;

  if (!title || !fullName || !phone || !city || !district || !address) {
    return res.status(400).json({ message: "Tüm alanlar zorunlu" });
  }

  const newAddress = await prisma.address.create({
    data: {
      title,
      fullName,
      phone,
      city,
      district,
      address,
      userId: req.user.userId,
    },
  });

  res.json(newAddress);
});

// 🗑️ Adres sil
router.delete("/:id", auth, async (req, res) => {
  await prisma.address.delete({
    where: { id: Number(req.params.id) },
  });

  res.json({ message: "Adres silindi" });
});

// ⭐ VARSAYILAN ADRES YAP
router.patch("/:id/default", auth, async (req, res) => {
  const id = Number(req.params.id);

  // Önce kullanıcının tüm adreslerini default=false yap
  await prisma.address.updateMany({
    where: { userId: req.user.userId },
    data: { isDefault: false },
  });

  // Seçilen adresi default yap
  const updated = await prisma.address.update({
    where: { id },
    data: { isDefault: true },
  });

  res.json(updated);
});


export default router;
