import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function getProject(id: string, userId: string) {
  return prisma.project.findFirst({ where: { id, userId } });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
    include: {
      owners: {
        include: {
          shares: true,
          attorney: true,
        },
        orderBy: { createdAt: "asc" },
      },
      attorneys: { orderBy: { createdAt: "asc" } },
      sections: {
        include: {
          sectionOwners: { include: { owner: true } },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!project) return NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });
  return NextResponse.json({ project });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await getProject(id, user.id);
  if (!existing) return NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });

  const data = await req.json();

  const project = await prisma.project.update({
    where: { id },
    data: {
      name: data.name,
      il: data.il,
      ilce: data.ilce,
      semt: data.semt,
      mahalle: data.mahalle,
      pafta: data.pafta,
      ada: data.ada,
      parsel: data.parsel,
      yuzolcum: parseFloat(data.yuzolcum) || 0,
      fontSize: data.fontSize,
      orientation: data.orientation,
      paperSize: data.paperSize,
      fitToPage: data.fitToPage,
    },
  });

  return NextResponse.json({ project });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await getProject(id, user.id);
  if (!existing) return NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
