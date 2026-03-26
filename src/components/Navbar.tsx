"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Building2, Users, FolderOpen, LogOut, Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  user: { name: string; email: string; role: string };
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const navLinks = [
    { href: "/dashboard", label: "Projeler", icon: FolderOpen },
    ...(user.role === "admin" ? [{ href: "/dashboard/users", label: "Kullanıcı Yönetimi", icon: Users }] : []),
  ];

  return (
    <nav className="bg-indigo-700 shadow-lg">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Building2 className="text-white" size={18} />
            </div>
            <span className="text-white font-bold text-sm hidden sm:block">
              Kat İrtifakı Yönetim Sistemi
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-white/20 text-white"
                    : "text-indigo-100 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-indigo-100 hover:bg-white/10 transition-colors text-sm"
              >
                <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block">{user.name}</span>
                <ChevronDown size={14} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Oturumu Kapat
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-1.5 rounded-lg text-indigo-100 hover:bg-white/10"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden pb-3 space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-white/20 text-white"
                    : "text-indigo-100 hover:bg-white/10"
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
