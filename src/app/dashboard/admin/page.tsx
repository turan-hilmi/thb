import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminPanel from "@/components/AdminPanel";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, email: true, name: true, role: true,
      isActive: true, subscriptionEnd: true, createdAt: true,
      _count: { select: { projects: true } },
    },
  });

  return (
    <AdminPanel
      initialUsers={JSON.parse(JSON.stringify(users))}
      currentUserId={user.id}
    />
  );
}
