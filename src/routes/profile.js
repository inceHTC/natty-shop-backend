import express from "express";
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// 👤 PROFİL BİLGİSİ
router.get("/", auth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: {
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      createdAt: true,
    },
  });

  res.json(user);
});

// ✏️ PROFİL GÜNCELLE
router.put("/", auth, async (req, res) => {
  const { firstName, lastName, phone } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user.userId },
    data: {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(phone !== undefined && { phone: phone || null }),
    },
  });

  res.json(user);
});

// 🔑 ŞİFRE DEĞİŞTİR
router.put("/password", auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
  });

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Mevcut şifre yanlış" });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: req.user.userId },
    data: { password: hashed },
  });

  res.json({ message: "Şifre güncellendi" });
});

export default router;
