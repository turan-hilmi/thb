import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, il: true, ilce: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  const project = await prisma.project.create({
    data: {
      name: data.name || "Yeni Proje",
      il: data.il || "",
      ilce: data.ilce || "",
      semt: data.semt || "",
      mahalle: data.mahalle || "",
      pafta: data.pafta || "",
      ada: data.ada || "",
      parsel: data.parsel || "",
      yuzolcum: parseFloat(data.yuzolcum) || 0,
      fontSize: data.fontSize || 8,
      orientation: data.orientation || "Dikey",
      paperSize: data.paperSize || "A3",
      fitToPage: data.fitToPage || false,
      userId: user.id,
    },
  });

  return NextResponse.json({ project }, { status: 201 });
}
