import express from "express";
import prisma from "../lib/prisma.js";
import { auth } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";

const router = express.Router();

/* =====================
   🛒 SİPARİŞ OLUŞTUR (USER)
===================== */
router.post("/", auth, async (req, res) => {
  try {
    const { cart, total, address } = req.body;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ message: "Sepet boş" });
    }

    if (!req.user?.userId) {
      return res.status(401).json({ message: "Kullanıcı bulunamadı" });
    }

    const order = await prisma.order.create({
      data: {
        total,
        status: "Hazırlanıyor",

        // ✅ ADRES SNAPSHOT (DOĞRU ALANLAR)
        addressTitle: address?.title || null,
        addressText: address
          ? `${address.fullName}
${address.phone}
${address.city} / ${address.district}
${address.address}`
          : null,
        phone: address?.phone || null,

        user: {
          connect: { id: req.user.userId },
        },

        items: {
          create: cart.map((item) => ({
            product: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.selectedSize || null,
          })),
        },
      },
      include: { items: true },
    });

    res.json(order);
  } catch (err) {
    console.error("ORDER CREATE ERROR:", err);
    res.status(500).json({ message: "Sipariş oluşturulamadı" });
  }
});


/* =====================
   📦 KULLANICI SİPARİŞLERİ
   ⚠️ MUTLAKA /:id'DEN ÖNCE
===================== */
router.get("/my", auth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.userId },
    include: { items: true, return: true },
    orderBy: { createdAt: "desc" },
  });

  res.json(orders);
});

/* =====================
   📄 KULLANICI SİPARİŞ DETAYI
===================== */
router.get("/:id", auth, async (req, res) => {
  const id = Number(req.params.id);

  // 🛡 id guard (Prisma crash fix)
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Geçersiz sipariş ID" });
  }

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: req.user.userId,
    },
    include: {
      items: true,
      return: true,
    },
  });

  if (!order) {
    return res.status(404).json({ message: "Sipariş bulunamadı" });
  }

  res.json(order);
});

/* =====================
   🛠️ ADMIN – TÜM SİPARİŞLER
===================== */
router.get("/", auth, adminOnly, async (req, res) => {
  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      items: true,
      return: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(orders);
});

/* =====================
   🔄 SİPARİŞ DURUMU GÜNCELLE (ADMIN)
===================== */
router.patch("/:id/status", auth, adminOnly, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Geçersiz sipariş ID" });
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status },
  });

  res.json(order);
});

/* =====================
   ❌ SİPARİŞ İPTALİ (USER)
===================== */
const CANCELLABLE_STATUSES = ["Hazırlanıyor"];

router.post("/:id/cancel", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Geçersiz sipariş ID" });
    }

    const order = await prisma.order.findFirst({
      where: { id, userId: req.user.userId },
    });

    if (!order) {
      return res.status(404).json({ message: "Sipariş bulunamadı" });
    }

    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      return res.status(400).json({
        message:
          "Bu sipariş iptal edilemez. Sadece henüz kargoya verilmemiş siparişler iptal edilebilir.",
      });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: "İptal Edildi", cancelledAt: new Date() },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "İptal işlemi başarısız" });
  }
});

/* =====================
   📤 İADE TALEBİ OLUŞTUR
===================== */
const RETURNABLE_STATUSES = ["Teslim Edildi", "Tamamlandı"];

function generateReturnCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "IADE-";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

router.post("/:id/return-request", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { reason } = req.body || {};

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Geçersiz sipariş ID" });
    }

    const order = await prisma.order.findFirst({
      where: { id, userId: req.user.userId },
      include: { return: true },
    });

    if (!order) {
      return res.status(404).json({ message: "Sipariş bulunamadı" });
    }

    if (!RETURNABLE_STATUSES.includes(order.status)) {
      return res.status(400).json({
        message:
          "Sadece teslim alınmış siparişler için iade talebi oluşturulabilir.",
      });
    }

    if (order.return) {
      return res.status(400).json({
        message: "Bu sipariş için zaten iade talebi mevcut.",
        return: order.return,
      });
    }

    let returnCode = generateReturnCode();
    let exists = await prisma.orderReturn.findUnique({
      where: { returnCode },
    });

    while (exists) {
      returnCode = generateReturnCode();
      exists = await prisma.orderReturn.findUnique({
        where: { returnCode },
      });
    }

    const orderReturn = await prisma.orderReturn.create({
      data: {
        orderId: id,
        returnCode,
        status: "IadeKoduVerildi",
        reason: reason || null,
      },
    });

    res.json(orderReturn);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "İade talebi oluşturulamadı" });
  }
});

/* =====================
   📋 İADE DETAYI
===================== */
router.get("/:id/return", auth, async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Geçersiz sipariş ID" });
  }

  const order = await prisma.order.findFirst({
    where: { id, userId: req.user.userId },
    include: { return: true, items: true },
  });

  if (!order) {
    return res.status(404).json({ message: "Sipariş bulunamadı" });
  }

  if (!order.return) {
    return res.status(404).json({ message: "İade talebi bulunamadı" });
  }

  res.json(order.return);
});

export default router;
