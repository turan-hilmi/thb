import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProjectsList from "@/components/project/ProjectsList";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true, name: true, il: true, ilce: true,
      createdAt: true, updatedAt: true,
      _count: { select: { sections: true, owners: true } },
    },
  });

  return <ProjectsList initialProjects={projects} />;
}
