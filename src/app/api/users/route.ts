import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      subscriptionEnd: true,
      createdAt: true,
      _count: { select: { projects: true } },
    },
  });

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, password, name, role } = await req.json();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Bu e-posta adresi zaten kayıtlı." }, { status: 409 });
  }

  const hashed = await hashPassword(password);
  const newUser = await prisma.user.create({
    data: { email, password: hashed, name, role: role || "user" },
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
  });

  return NextResponse.json({ user: newUser }, { status: 201 });
}
