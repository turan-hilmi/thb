"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus, Trash2, FolderOpen, MapPin, Calendar, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

interface Project {
  id: string;
  name: string;
  il: string;
  ilce: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  _count: { sections: number; owners: number };
}

export default function ProjectsList({ initialProjects }: { initialProjects: Project[] }) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  async function createProject() {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowNewModal(false);
        setNewName("");
        router.push(`/dashboard/projects/${data.project.id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function deleteProject(id: string) {
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects((p) => p.filter((proj) => proj.id !== id));
      setShowDeleteModal(null);
    }
  }

  function formatDate(d: Date | string) {
    return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="text-indigo-600" size={28} />
            Proje Arşivi
          </h1>
          <p className="text-gray-500 text-sm mt-1">{projects.length} proje</p>
        </div>
        <Button onClick={() => setShowNewModal(true)} className="flex items-center gap-2">
          <Plus size={18} />
          Yeni Proje
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="text-indigo-300" size={40} />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">Henüz proje yok</h3>
          <p className="text-gray-400 text-sm mb-6">İlk projenizi oluşturarak başlayın.</p>
          <Button onClick={() => setShowNewModal(true)}>
            <Plus size={18} className="mr-2" />
            Yeni Proje Oluştur
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group"
            >
              <div
                className="p-5 cursor-pointer"
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <Building2 className="text-indigo-600" size={20} />
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(project.updatedAt)}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-indigo-700 transition-colors">
                  {project.name}
                </h3>

                {(project.il || project.ilce) && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                    <MapPin size={13} />
                    {[project.il, project.ilce].filter(Boolean).join(" / ")}
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Layers size={12} />
                    {project._count.sections} bölüm
                  </span>
                  <span className="flex items-center gap-1">
                    <svg viewBox="0 0 16 16" className="w-3 h-3 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3z"/>
                    </svg>
                    {project._count.owners} hissedar
                  </span>
                </div>
              </div>

              <div className="px-5 pb-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                >
                  <FolderOpen size={14} className="mr-1" />
                  Aç
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteModal(project.id)}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="Yeni Proje Oluştur">
        <div className="space-y-4">
          <Input
            label="Proje Adı"
            placeholder="Örn: Güneş Apartmanı Kat İrtifakı"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createProject()}
            autoFocus
          />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setShowNewModal(false)}>İptal</Button>
            <Button onClick={createProject} disabled={loading || !newName.trim()}>
              {loading ? "Oluşturuluyor..." : "Oluştur"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!showDeleteModal} onClose={() => setShowDeleteModal(null)} title="Projeyi Sil">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Bu projeyi silmek istediğinizden emin misiniz? Tüm veriler kalıcı olarak silinecektir.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setShowDeleteModal(null)}>İptal</Button>
            <Button variant="danger" onClick={() => showDeleteModal && deleteProject(showDeleteModal)}>
              Evet, Sil
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
