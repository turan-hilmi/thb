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

  // Get next order
  const maxOrder = await prisma.section.aggregate({
    where: { projectId },
    _max: { order: true },
  });

  const section = await prisma.section.create({
    data: {
      order: (maxOrder._max.order ?? 0) + 1,
      blokNo: data.blokNo || "",
      katNo: data.katNo || "",
      bagimsizBolumNo: data.bagimsizBolumNo || "",
      nitelik: data.nitelik || "",
      brutM2: parseFloat(data.brutM2) || 0,
      netM2: parseFloat(data.netM2) || 0,
      arsaPayi: data.arsaPayi || "",
      arsaPayiPayda: data.arsaPayiPayda || "",
      projectId,
    },
    include: { sectionOwners: { include: { owner: true } } },
  });

  return NextResponse.json({ section }, { status: 201 });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: projectId } = await params;

  const project = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } });
  if (!project) return NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });

  const { sectionId, ownerIds, ...data } = await req.json();

  const section = await prisma.section.update({
    where: { id: sectionId },
    data: {
      blokNo: data.blokNo,
      katNo: data.katNo,
      bagimsizBolumNo: data.bagimsizBolumNo,
      nitelik: data.nitelik,
      brutM2: parseFloat(data.brutM2) || 0,
      netM2: parseFloat(data.netM2) || 0,
      arsaPayi: data.arsaPayi || "",
      arsaPayiPayda: data.arsaPayiPayda || "",
    },
  });

  // Update owners if provided
  if (ownerIds !== undefined) {
    await prisma.sectionOwner.deleteMany({ where: { sectionId } });
    if (ownerIds.length > 0) {
      await prisma.sectionOwner.createMany({
        data: ownerIds.map((ownerId: string) => ({ sectionId, ownerId })),
      });
    }
  }

  const updated = await prisma.section.findUnique({
    where: { id: sectionId },
    include: { sectionOwners: { include: { owner: true } } },
  });

  return NextResponse.json({ section: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: projectId } = await params;

  const { sectionId } = await req.json();

  const section = await prisma.section.findFirst({ where: { id: sectionId, projectId } });
  if (!section) return NextResponse.json({ error: "Bölüm bulunamadı." }, { status: 404 });

  await prisma.section.delete({ where: { id: sectionId } });
  return NextResponse.json({ success: true });
}
