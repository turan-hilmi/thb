import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import ProjectDetail from "@/components/project/ProjectDetail";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
    include: {
      owners: {
        include: { shares: true, attorney: true },
        orderBy: { createdAt: "asc" },
      },
      attorneys: { orderBy: { createdAt: "asc" } },
      sections: {
        include: { sectionOwners: { include: { owner: true } } },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!project) notFound();

  return <ProjectDetail project={JSON.parse(JSON.stringify(project))} />;
}
