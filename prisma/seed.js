import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seed başlıyor...");

  // Temizlik (isteğe bağlı ama tavsiye edilir)
  await prisma.productSize.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();

  const products = [
    {
      name: "Dantel Detay Klasik Bot",
      description: "Zarif dantel detaylı, bağcıklı siyah kadın bot",
      price: 3800,
      oldPrice: 4500,
      gender: "kadin",
      type: "ayakkabi",
      isDiscount: true,
      isFeatured: true,
      image: "1769948215508-152015178.jpg",
      images: [
        { url: "1769948215508-152015178.jpg", isMain: true, order: 0 },
      ],
      sizes: ["36", "37", "38", "39"],
    },
    {
      name: "Bağcıklı Deri Klasik Ayakkabı",
      description: "Klasik bağcıklı rugan ayakkabı",
      price: 3750,
      gender: "erkek",
      type: "ayakkabi",
      isFeatured: true,
      image: "2-1769992269716.png",
      images: [{ url: "2-1769992269716.png", isMain: true, order: 0 }],
      sizes: ["40", "41", "42", "43"],
    },
    {
      name: "Deri Postacı Çanta",
      description: "Hakiki deri erkek postacı çanta",
      price: 2900,
      oldPrice: 4250,
      gender: "erkek",
      type: "canta",
      isDiscount: true,
      isFeatured: true,
      image: "1769948304590-921339357.png",
      images: [{ url: "1769948304590-921339357.png", isMain: true, order: 0 }],
    },
    {
      name: "Fuşya Platform Topuk",
      description: "Saten platform topuk ayakkabı",
      price: 3300,
      gender: "kadin",
      type: "ayakkabi",
      image: "fusya-176999923489.jpeg",
      images: [{ url: "fusya-176999923489.jpeg", isMain: true, order: 0 }],
      sizes: ["36", "37", "38", "39"],
    },
    {
      name: "Pembe Deri Sandalet",
      description: "Yazlık hakiki deri sandalet",
      price: 2970,
      gender: "kadin",
      type: "ayakkabi",
      isFeatured: true,
      image: "kadin/pembe-1770157294137.jpg",
      images: [
        { url: "kadin/pembe-1770157294137.jpg", isMain: true, order: 0 },
      ],
      sizes: ["36", "37", "38", "39"],
    },
  ];

  for (const p of products) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        description: p.description,
        price: p.price,
        oldPrice: p.oldPrice,
        gender: p.gender,
        type: p.type,
        isDiscount: !!p.oldPrice,
        isFeatured: p.isFeatured || false,
        image: p.image,
        isActive: true,
        images: {
          create: p.images,
        },
      },
    });

    if (p.sizes) {
      await prisma.productSize.createMany({
        data: p.sizes.map((size) => ({
          productId: product.id,
          size,
          stock: 10,
        })),
      });
    }
  }

  console.log("✅ Seed tamamlandı");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
