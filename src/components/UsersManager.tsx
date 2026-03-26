"use client";
import { useState } from "react";
import { Users, Plus, Trash2, Edit2, Check, X, Crown, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

interface UserRecord {
  id: string; email: string; name: string; role: string;
  isActive: boolean; subscriptionEnd: string | null; createdAt: string;
  _count: { projects: number };
}

interface FormData {
  name: string; email: string; password: string; role: string;
  isActive: boolean; subscriptionEnd: string;
}

const emptyForm: FormData = {
  name: "", email: "", password: "", role: "user", isActive: true, subscriptionEnd: "",
};

export default function UsersManager({ initialUsers, currentUserId }: {
  initialUsers: UserRecord[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function setField(key: keyof FormData, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openNew() {
    setEditUser(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  }

  function openEdit(user: UserRecord) {
    setEditUser(user);
    setForm({
      name: user.name, email: user.email, password: "",
      role: user.role, isActive: user.isActive,
      subscriptionEnd: user.subscriptionEnd
        ? new Date(user.subscriptionEnd).toISOString().split("T")[0]
        : "",
    });
    setError("");
    setShowModal(true);
  }

  async function save() {
    setError("");
    setSaving(true);
    try {
      if (editUser) {
        const res = await fetch(`/api/users/${editUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error); return; }
        setUsers((u) => u.map((x) => x.id === editUser.id ? { ...x, ...data.user } : x));
      } else {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error); return; }
        setUsers((u) => [{ ...data.user, _count: { projects: 0 } }, ...u]);
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser(id: string) {
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((u) => u.filter((x) => x.id !== id));
      setDeleteId(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-indigo-600" size={28} />
            Kullanıcı Yönetimi
          </h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} kullanıcı</p>
        </div>
        <Button onClick={openNew} className="flex items-center gap-2">
          <Plus size={18} />Yeni Kullanıcı
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Ad</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">E-Posta</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Rol</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Durum</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Projeler</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Abonelik Bitiş</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className={cn("hover:bg-gray-50 transition-colors", !u.isActive && "opacity-60")}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">{u.name}</span>
                    {u.id === currentUserId && <span className="text-xs text-gray-400">(siz)</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3 text-center">
                  {u.role === "admin" ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      <Crown size={11} />Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      <UserIcon size={11} />Kullanıcı
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {u.isActive ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      <Check size={11} />Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                      <X size={11} />Pasif
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-gray-600">{u._count.projects}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {u.subscriptionEnd
                    ? new Date(u.subscriptionEnd).toLocaleDateString("tr-TR")
                    : "—"}
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editUser ? "Kullanıcıyı Düzenle" : "Yeni Kullanıcı"}
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}
          <Input label="Ad Soyad" value={form.name} onChange={(e) => setField("name", e.target.value)} required />
          <Input label="E-Posta" type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} required />
          <Input
            label={editUser ? "Yeni Şifre (boş bırakılırsa değişmez)" : "Şifre"}
            type="password"
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
            required={!editUser}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200" value={form.role} onChange={(e) => setField("role", e.target.value)}>
                <option value="user">Kullanıcı</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Input
              label="Abonelik Bitiş"
              type="date"
              value={form.subscriptionEnd}
              onChange={(e) => setField("subscriptionEnd", e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" checked={form.isActive} onChange={(e) => setField("isActive", e.target.checked)} />
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
