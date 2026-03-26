import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; ownerId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: projectId, ownerId } = await params;

  const owner = await prisma.owner.findFirst({
    where: { id: ownerId, projectId },
    include: { project: true },
  });
  if (!owner || owner.project.userId !== user.id) {
    return NextResponse.json({ error: "Hissedar bulunamadı." }, { status: 404 });
  }

  const { pay, payda } = await req.json();

  const share = await prisma.share.create({
    data: { pay: parseInt(pay), payda: parseInt(payda), ownerId },
  });

  return NextResponse.json({ share }, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; ownerId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { ownerId } = await params;
  const { shareId } = await req.json();

  const share = await prisma.share.findFirst({
    where: { id: shareId, ownerId },
  });
  if (!share) return NextResponse.json({ error: "Hisse bulunamadı." }, { status: 404 });

  await prisma.share.delete({ where: { id: shareId } });
  return NextResponse.json({ success: true });
}
