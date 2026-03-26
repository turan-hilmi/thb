import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: projectId } = await params;

  const project = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } });
  if (!project) return NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });

  const { name, notaryInfo } = await req.json();

  const attorney = await prisma.attorney.create({
    data: { name, notaryInfo: notaryInfo || "", projectId },
  });

  return NextResponse.json({ attorney }, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: projectId } = await params;

  const { attorneyId } = await req.json();

  const attorney = await prisma.attorney.findFirst({
    where: { id: attorneyId, projectId },
    include: { project: true },
  });
  if (!attorney || attorney.project.userId !== user.id) {
    return NextResponse.json({ error: "Vekil bulunamadı." }, { status: 404 });
  }

  await prisma.attorney.delete({ where: { id: attorneyId } });
  return NextResponse.json({ success: true });
}
