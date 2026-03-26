import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { gcd } from "@/lib/utils";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: projectId } = await params;

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: user.id },
    include: { sections: { orderBy: { order: "asc" } } },
  });
  if (!project) return NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });

  const sections = project.sections;
  if (sections.length === 0) {
    return NextResponse.json({ error: "Hesaplanacak bölüm yok." }, { status: 400 });
  }

  const totalBrut = sections.reduce((sum, s) => sum + s.brutM2, 0);
  if (totalBrut === 0) {
    return NextResponse.json({ error: "Brüt m² değerleri girilmemiş." }, { status: 400 });
  }

  // Compute arsa payı as fractions with common denominator = 1000
  const PAYDA = 1000;

  const updates = sections.map((section) => {
    const share = section.brutM2 / totalBrut;
    const pay = Math.round(share * PAYDA);
    const g = gcd(pay, PAYDA);
    const simplifiedPay = pay / g;
    const simplifiedPayda = PAYDA / g;

    return prisma.section.update({
      where: { id: section.id },
      data: {
        arsaPayi: simplifiedPay.toString(),
        arsaPayiPayda: simplifiedPayda.toString(),
      },
    });
  });

  await prisma.$transaction(updates);

  const updated = await prisma.section.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
    include: { sectionOwners: { include: { owner: true } } },
  });

  return NextResponse.json({ sections: updated });
}
