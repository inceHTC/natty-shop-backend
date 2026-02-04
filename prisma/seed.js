import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: "Dijital Kamera",
        description: "Yüksek performanslı profesyonel kamera",
        price: 1500,
        image: "camera.jpg",
      },
      {
        name: "Kulaklık",
        description: "Gürültü engelleyici kulaklık",
        price: 120,
        image: "kulaklik.jpg",
      },
    ],
  });

  console.log("✅ Ürünler eklendi");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
