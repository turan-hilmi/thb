"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kayıt başarısız.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Building2 className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Kat İrtifakı</h1>
          <p className="text-gray-500 text-sm mt-1">Yönetim Sistemi</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Üye Ol</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name"
              label="Ad Soyad"
              placeholder="Adınız Soyadınız"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              required
            />
            <Input
              id="email"
              type="email"
              label="E-Posta Adresi"
              placeholder="ornek@email.com"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              required
            />
            <Input
              id="password"
              type="password"
              label="Parola"
              placeholder="En az 6 karakter"
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              required
              minLength={6}
            />
            <Input
              id="confirm"
              type="password"
              label="Parola Tekrar"
              placeholder="Parolayı tekrar girin"
              value={form.confirm}
              onChange={(e) => setField("confirm", e.target.value)}
              required
            />

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Kayıt yapılıyor...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus size={18} />
                  Üye Ol
                </span>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Hesabın var mı?{" "}
            <Link href="/login" className="text-indigo-600 font-medium hover:underline">
              Oturum Aç
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
