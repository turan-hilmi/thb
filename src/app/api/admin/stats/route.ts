import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const now = new Date();

  const [
    totalUsers,
    activeUsers,
    activeSubscriptions,
    expiredSubscriptions,
    totalProjects,
    newUsersThisMonth,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({
      where: { isActive: true, subscriptionEnd: { gt: now } },
    }),
    prisma.user.count({
      where: {
        OR: [
          { subscriptionEnd: { lt: now } },
          { subscriptionEnd: null },
        ],
        role: "user",
      },
    }),
    prisma.project.count(),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
        },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true, name: true, email: true, role: true,
        isActive: true, subscriptionEnd: true, createdAt: true,
        _count: { select: { projects: true } },
      },
    }),
  ]);

  return NextResponse.json({
    totalUsers,
    activeUsers,
    activeSubscriptions,
    expiredSubscriptions,
    totalProjects,
    newUsersThisMonth,
    recentUsers,
  });
}
