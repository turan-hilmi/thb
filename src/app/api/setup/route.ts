import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    // Create all tables
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'user',
        "isActive" INTEGER NOT NULL DEFAULT 1,
        "subscriptionEnd" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Project" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "il" TEXT NOT NULL DEFAULT '',
        "ilce" TEXT NOT NULL DEFAULT '',
        "semt" TEXT NOT NULL DEFAULT '',
        "mahalle" TEXT NOT NULL DEFAULT '',
        "pafta" TEXT NOT NULL DEFAULT '',
        "ada" TEXT NOT NULL DEFAULT '',
        "parsel" TEXT NOT NULL DEFAULT '',
        "yuzolcum" REAL NOT NULL DEFAULT 0,
        "fontSize" INTEGER NOT NULL DEFAULT 8,
        "orientation" TEXT NOT NULL DEFAULT 'Dikey',
        "paperSize" TEXT NOT NULL DEFAULT 'A3',
        "fitToPage" INTEGER NOT NULL DEFAULT 0,
        "userId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Owner" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "fatherName" TEXT NOT NULL DEFAULT '',
        "isCompany" INTEGER NOT NULL DEFAULT 0,
        "companyM2" REAL NOT NULL DEFAULT 0,
        "projectId" TEXT NOT NULL,
        "attorneyId" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Share" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "pay" INTEGER NOT NULL,
        "payda" INTEGER NOT NULL,
        "ownerId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Attorney" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "notaryInfo" TEXT NOT NULL DEFAULT '',
        "projectId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Section" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "order" INTEGER NOT NULL DEFAULT 0,
        "blokNo" TEXT NOT NULL DEFAULT '',
        "katNo" TEXT NOT NULL DEFAULT '',
        "bagimsizBolumNo" TEXT NOT NULL DEFAULT '',
        "nitelik" TEXT NOT NULL DEFAULT '',
        "brutM2" REAL NOT NULL DEFAULT 0,
        "netM2" REAL NOT NULL DEFAULT 0,
        "arsaPayi" TEXT NOT NULL DEFAULT '',
        "arsaPayiPayda" TEXT NOT NULL DEFAULT '',
        "projectId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SectionOwner" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "sectionId" TEXT NOT NULL,
        "ownerId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("sectionId", "ownerId"),
        FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE,
        FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE
      )
    `);

    // Seed admin user
    const existing = await prisma.user.findUnique({
      where: { email: "admin@katirtifaki.net" },
    });

    if (!existing) {
      const hash = await hashPassword("admin123");
      await prisma.user.create({
        data: {
          email: "admin@katirtifaki.net",
          password: hash,
          name: "Admin",
          role: "admin",
          isActive: true,
        },
      });
    } else {
      // Update password and ensure active
      const hash = await hashPassword("admin123");
      await prisma.user.update({
        where: { email: "admin@katirtifaki.net" },
        data: { password: hash, isActive: true, role: "admin" },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Kurulum tamamlandı! Giriş: admin@katirtifaki.net / admin123",
    });
  } catch (err) {
    console.error("Setup error:", err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
