import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: projectId } = await params;

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "csv";

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: user.id },
    include: {
      owners: { include: { shares: true, attorney: true } },
      attorneys: true,
      sections: {
        include: { sectionOwners: { include: { owner: true } } },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!project) return NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });

  if (format === "csv") {
    const rows = [
      ["Sıra", "Blok No", "Kat No", "BB No", "Nitelik", "Brüt m²", "Net m²", "Arsa Payı", "Arsa Payı Paydası", "Malik/Hissedar"],
      ...project.sections.map((s, i) => [
        i + 1,
        s.blokNo,
        s.katNo,
        s.bagimsizBolumNo,
        s.nitelik,
        s.brutM2,
        s.netM2,
        s.arsaPayi,
        s.arsaPayiPayda,
        s.sectionOwners.map((so) => so.owner.name).join(" / "),
      ]),
    ];

    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const bom = "\uFEFF";

    return new NextResponse(bom + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(project.name)}.csv"`,
      },
    });
  }

  // Return JSON for client-side PDF/XLS generation
  return NextResponse.json({ project });
}
