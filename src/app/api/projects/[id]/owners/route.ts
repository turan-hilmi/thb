import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: projectId } = await params;

  const project = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } });
  if (!project) return NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });

  const data = await req.json();

  const owner = await prisma.owner.create({
    data: {
      name: data.name,
      fatherName: data.fatherName || "",
      isCompany: data.isCompany || false,
      companyM2: parseFloat(data.companyM2) || 0,
      projectId,
    },
    include: { shares: true, attorney: true },
  });

  return NextResponse.json({ owner }, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: projectId } = await params;

  const { ownerId } = await req.json();

  const owner = await prisma.owner.findFirst({
    where: { id: ownerId, projectId },
    include: { project: true },
  });

  if (!owner || owner.project.userId !== user.id) {
    return NextResponse.json({ error: "Hissedar bulunamadı." }, { status: 404 });
  }

  await prisma.owner.delete({ where: { id: ownerId } });
  return NextResponse.json({ success: true });
}
