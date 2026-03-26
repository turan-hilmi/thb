import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
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

  const { attorneyId } = await req.json();

  const updated = await prisma.owner.update({
    where: { id: ownerId },
    data: { attorneyId: attorneyId || null },
    include: { attorney: true, shares: true },
  });

  return NextResponse.json({ owner: updated });
}
