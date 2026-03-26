import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar user={user} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
