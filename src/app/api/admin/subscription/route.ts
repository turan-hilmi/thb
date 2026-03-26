import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const { userId, months } = await req.json();
  if (!userId || !months) {
    return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  const now = new Date();
  const base = target.subscriptionEnd && target.subscriptionEnd > now
    ? new Date(target.subscriptionEnd)
    : now;

  const newEnd = new Date(base);
  newEnd.setMonth(newEnd.getMonth() + months);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { subscriptionEnd: newEnd, isActive: true },
    select: {
      id: true, name: true, email: true, role: true,
      isActive: true, subscriptionEnd: true, createdAt: true,
      _count: { select: { projects: true } },
    },
  });

  return NextResponse.json({ user: updated });
}
