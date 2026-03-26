import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";
import bcryptjs from "bcryptjs";

async function main() {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL || "file:./prisma/dev.db",
  });
  const prisma = new PrismaClient({ adapter } as never);

  const hashed = await bcryptjs.hash("admin123", 12);

  const user = await (prisma as never as {
    user: {
      upsert: (args: unknown) => Promise<unknown>
    }
  }).user.upsert({
    where: { email: "admin@katirtifaki.net" },
    update: {},
    create: {
      email: "admin@katirtifaki.net",
      password: hashed,
      name: "Admin",
      role: "admin",
    },
  });

  console.log("Admin kullanıcı oluşturuldu:", user);
  await (prisma as never as { $disconnect: () => Promise<void> }).$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
