import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin1453", 10);

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
