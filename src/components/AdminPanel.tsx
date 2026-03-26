"use client";
import { useState, useEffect } from "react";
import {
  Users, FolderOpen, TrendingUp, AlertCircle, CheckCircle,
  UserPlus, Crown, User as UserIcon, Edit2, Trash2, Check, X,
  Plus, Calendar, RefreshCw, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

interface UserRecord {
  id: string; email: string; name: string; role: string;
  isActive: boolean; subscriptionEnd: string | null; createdAt: string;
  _count: { projects: number };
}

interface Stats {
  totalUsers: number; activeUsers: number; activeSubscriptions: number;
  expiredSubscriptions: number; totalProjects: number; newUsersThisMonth: number;
  recentUsers: UserRecord[];
}

interface FormData {
  name: string; email: string; password: string; role: string;
  isActive: boolean; subscriptionEnd: string;
}

const emptyForm: FormData = {
  name: "", email: "", password: "", role: "user", isActive: true, subscriptionEnd: "",
};

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: number | string;
  sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className={cn("p-2 rounded-lg", color)}>
          <Icon size={18} />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function subStatus(end: string | null) {
  if (!end) return { label: "Abonelik Yok", color: "bg-gray-100 text-gray-500" };
  const d = new Date(end);
  const now = new Date();
  if (d < now) return { label: "Süresi Dolmuş", color: "bg-red-100 text-red-600" };
  const days = Math.ceil((d.getTime() - now.getTime()) / 86400000);
  if (days <= 7) return { label: `${days} gün kaldı`, color: "bg-amber-100 text-amber-600" };
  return { label: d.toLocaleDateString("tr-TR"), color: "bg-green-100 text-green-700" };
}

export default function AdminPanel({ initialUsers, currentUserId }: {
  initialUsers: UserRecord[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tab, setTab] = useState<"overview" | "users">("overview");
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [extendingId, setExtendingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setStats(d));
  }, [users]);

  function setField(key: keyof FormData, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openNew() {
    setEditUser(null); setForm(emptyForm); setError(""); setShowModal(true);
  }

  function openEdit(user: UserRecord) {
    setEditUser(user);
    setForm({
      name: user.name, email: user.email, password: "",
      role: user.role, isActive: user.isActive,
      subscriptionEnd: user.subscriptionEnd
        ? new Date(user.subscriptionEnd).toISOString().split("T")[0] : "",
    });
    setError(""); setShowModal(true);
  }

  async function save() {
    setError(""); setSaving(true);
    try {
      if (editUser) {
        const res = await fetch(`/api/users/${editUser.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error); return; }
        setUsers((u) => u.map((x) => x.id === editUser.id ? { ...x, ...data.user } : x));
      } else {
        const res = await fetch("/api/users", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error); return; }
        setUsers((u) => [{ ...data.user, _count: { projects: 0 } }, ...u]);
      }
      setShowModal(false);
    } finally { setSaving(false); }
  }

  async function deleteUser(id: string) {
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) { setUsers((u) => u.filter((x) => x.id !== id)); setDeleteId(null); }
  }

  async function extendSubscription(userId: string, months: number) {
    setExtendingId(userId);
    const res = await fetch("/api/admin/subscription", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, months }),
    });
    const data = await res.json();
    if (res.ok) {
      setUsers((u) => u.map((x) => x.id === userId ? { ...x, ...data.user } : x));
    }
    setExtendingId(null);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="text-indigo-600" size={28} />
            Yönetici Paneli
          </h1>
          <p className="text-gray-500 text-sm mt-1">SaaS sistem yönetimi</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTab("overview")}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              tab === "overview" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50")}
          >
            Genel Bakış
          </button>
          <button
            onClick={() => setTab("users")}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              tab === "users" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50")}
          >
            Kullanıcılar ({users.length})
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="col-span-2 md:col-span-1 lg:col-span-1">
              <StatCard icon={Users} label="Toplam Kullanıcı" value={stats?.totalUsers ?? "—"}
                sub={`${stats?.newUsersThisMonth ?? 0} bu ay`} color="bg-indigo-50 text-indigo-600" />
            </div>
            <div className="col-span-2 md:col-span-1 lg:col-span-1">
              <StatCard icon={CheckCircle} label="Aktif Kullanıcı" value={stats?.activeUsers ?? "—"}
                color="bg-green-50 text-green-600" />
            </div>
            <div className="col-span-2 md:col-span-1 lg:col-span-1">
              <StatCard icon={TrendingUp} label="Aktif Abonelik" value={stats?.activeSubscriptions ?? "—"}
                sub="geçerli abonelik" color="bg-blue-50 text-blue-600" />
            </div>
            <div className="col-span-2 md:col-span-1 lg:col-span-1">
              <StatCard icon={AlertCircle} label="Süresi Dolmuş" value={stats?.expiredSubscriptions ?? "—"}
                sub="yenileme bekliyor" color="bg-red-50 text-red-500" />
            </div>
            <div className="col-span-2 md:col-span-1 lg:col-span-1">
              <StatCard icon={FolderOpen} label="Toplam Proje" value={stats?.totalProjects ?? "—"}
                color="bg-purple-50 text-purple-600" />
            </div>
            <div className="col-span-2 md:col-span-1 lg:col-span-1">
              <StatCard icon={UserPlus} label="Bu Ay Yeni" value={stats?.newUsersThisMonth ?? "—"}
                sub="kayıt" color="bg-amber-50 text-amber-600" />
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Son Kayıt Olan Kullanıcılar</h2>
              <button onClick={() => setTab("users")} className="text-xs text-indigo-600 hover:underline">
                Tümünü gör →
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {(stats?.recentUsers ?? []).map((u) => {
                const sub = subStatus(u.subscriptionEnd);
                return (
                  <div key={u.id} className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{u.name}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">{u._count.projects} proje</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", sub.color)}>
                        {sub.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === "users" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openNew} className="flex items-center gap-2">
              <Plus size={16} />Yeni Kullanıcı
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Kullanıcı</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Rol</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Projeler</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Abonelik</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Uzat</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => {
                  const sub = subStatus(u.subscriptionEnd);
                  return (
                    <tr key={u.id} className={cn("hover:bg-gray-50 transition-colors", !u.isActive && "opacity-60")}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-1">
                              {u.name}
                              {u.id === currentUserId && <span className="text-xs text-gray-400">(siz)</span>}
                            </div>
                            <div className="text-xs text-gray-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        {u.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            <Crown size={10} />Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            <UserIcon size={10} />Kullanıcı
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 hidden md:table-cell">
                        {u._count.projects}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium w-fit", sub.color)}>
                            {sub.label}
                          </span>
                          {!u.isActive && (
                            <span className="text-xs text-red-500">Hesap pasif</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {u.role !== "admin" && (
                          <div className="flex items-center gap-1">
                            {[
                              { label: "1A", months: 1 },
                              { label: "3A", months: 3 },
                              { label: "6A", months: 6 },
                              { label: "1Y", months: 12 },
                            ].map(({ label, months }) => (
                              <button
                                key={months}
                                onClick={() => extendSubscription(u.id, months)}
                                disabled={extendingId === u.id}
                                title={`${months} ay uzat`}
                                className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors disabled:opacity-50 font-medium"
                              >
                                {extendingId === u.id ? <RefreshCw size={10} className="animate-spin" /> : label}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-indigo-50 text-gray-400 hover:text-indigo-600">
                            <Edit2 size={14} />
                          </button>
                          {u.id !== currentUserId && (
                            <button onClick={() => setDeleteId(u.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editUser ? "Kullanıcıyı Düzenle" : "Yeni Kullanıcı"}>
        <div className="space-y-4">
          {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
          <Input label="Ad Soyad" value={form.name} onChange={(e) => setField("name", e.target.value)} required />
          <Input label="E-Posta" type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} required />
          <Input label={editUser ? "Yeni Şifre (boş bırakılırsa değişmez)" : "Şifre"}
            type="password" value={form.password}
            onChange={(e) => setField("password", e.target.value)} required={!editUser} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={form.role} onChange={(e) => setField("role", e.target.value)}>
                <option value="user">Kullanıcı</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Input label="Abonelik Bitiş" type="date" value={form.subscriptionEnd}
              onChange={(e) => setField("subscriptionEnd", e.target.value)} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" checked={form.isActive}
              onChange={(e) => setField("isActive", e.target.checked)} />
            <span className="text-sm text-gray-700">Aktif hesap</span>
          </label>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>İptal</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Kaydediliyor..." : "Kaydet"}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Kullanıcıyı Sil">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">Bu kullanıcıyı ve tüm projelerini silmek istediğinize emin misiniz?</p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setDeleteId(null)}>İptal</Button>
            <Button variant="danger" onClick={() => deleteId && deleteUser(deleteId)}>Sil</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
