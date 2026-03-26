import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const data = await req.json();

  const updateData: Record<string, unknown> = {
    name: data.name,
    email: data.email,
    role: data.role,
    isActive: data.isActive,
    subscriptionEnd: data.subscriptionEnd ? new Date(data.subscriptionEnd) : null,
  };

  if (data.password) {
    updateData.password = await hashPassword(data.password);
  }

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, email: true, name: true, role: true, isActive: true, subscriptionEnd: true, createdAt: true },
  });

  return NextResponse.json({ user: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  if (id === user.id) {
    return NextResponse.json({ error: "Kendinizi silemezsiniz." }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
