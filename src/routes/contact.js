import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

// İletişim formu gönderimi (herkese açık)
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({
        message: "Lütfen ad, e-posta ve mesaj alanlarını doldurun.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: "Geçerli bir e-posta adresi girin." });
    }

    await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject?.trim() || "İletişim Formu",
        message: message.trim(),
      },
    });

    res.status(201).json({ message: "Mesajınız alındı. En kısa sürede dönüş yapacağız." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Mesaj gönderilemedi. Lütfen tekrar deneyin." });
  }
});

export default router;
