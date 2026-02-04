import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  const existing = await prisma.user.findUnique({
    where: { email: "admin@admin.com" }
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        email: "admin@admin.com",
        password: passwordHash,
        role: "admin",
        firstName: "Admin",
        lastName: "User"
      }
    });
    console.log("✅ Admin kullanıcı oluşturuldu");
  } else {
    console.log("ℹ️ Admin zaten var, atlandı");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
