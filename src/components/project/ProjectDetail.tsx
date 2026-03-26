"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash2, Calculator, FileText, FileSpreadsheet, ArrowLeft, Plus, ChevronDown, ChevronUp, UserCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { ILLER, NITELIKLER } from "@/lib/locations";
import { cn } from "@/lib/utils";

// Types
interface Share { id: string; pay: number; payda: number; }
interface Attorney { id: string; name: string; notaryInfo: string; }
interface Owner {
  id: string; name: string; fatherName: string;
  isCompany: boolean; companyM2: number;
  shares: Share[]; attorney: Attorney | null;
}
interface SectionOwner { id: string; owner: { id: string; name: string }; }
interface Section {
  id: string; order: number; blokNo: string; katNo: string;
  bagimsizBolumNo: string; nitelik: string; brutM2: number; netM2: number;
  arsaPayi: string; arsaPayiPayda: string;
  sectionOwners: SectionOwner[];
}
interface Project {
  id: string; name: string; il: string; ilce: string; semt: string;
  mahalle: string; pafta: string; ada: string; parsel: string;
  yuzolcum: number; fontSize: number; orientation: string;
  paperSize: string; fitToPage: boolean;
  owners: Owner[]; attorneys: Attorney[]; sections: Section[];
}

export default function ProjectDetail({ project: initial }: { project: Project }) {
  const router = useRouter();
  const [project, setProject] = useState<Project>(initial);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Owner form
  const [ownerName, setOwnerName] = useState("");
  const [ownerFather, setOwnerFather] = useState("");
  const [ownerIsCompany, setOwnerIsCompany] = useState(false);
  const [shareOwnerIdx, setShareOwnerIdx] = useState<number | null>(null);
  const [sharePay, setSharePay] = useState("");
  const [sharePayda, setSharePayda] = useState("");

  // Attorney form
  const [attName, setAttName] = useState("");
  const [attNotary, setAttNotary] = useState("");
  const [editAttorney, setEditAttorney] = useState<Attorney | null>(null);

  // Section modals
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editSection, setEditSection] = useState<Section | null>(null);
  const [sectionForm, setSectionForm] = useState({
    blokNo: "", katNo: "", bagimsizBolumNo: "", nitelik: "", brutM2: "", netM2: "",
  });
  const [sectionOwnerIds, setSectionOwnerIds] = useState<string[]>([]);
  const [showOwnerSelectModal, setShowOwnerSelectModal] = useState<string | null>(null);

  // Panels
  const [infoOpen, setInfoOpen] = useState(true);
  const [attOpen, setAttOpen] = useState(true);
  const [ownersOpen, setOwnersOpen] = useState(true);
  const [sectionsOpen, setSectionsOpen] = useState(true);

  function setField<K extends keyof Project>(key: K, value: Project[K]) {
    setProject((p) => ({ ...p, [key]: value }));
  }

  async function saveProject() {
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
      });
      if (res.ok) {
        setSaveMsg("Kaydedildi!");
        setTimeout(() => setSaveMsg(""), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  // --- OWNER OPERATIONS ---
  async function addOwner() {
    if (!ownerName.trim()) return;
    const res = await fetch(`/api/projects/${project.id}/owners`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: ownerName, fatherName: ownerFather, isCompany: ownerIsCompany }),
    });
    if (res.ok) {
      const { owner } = await res.json();
      setProject((p) => ({ ...p, owners: [...p.owners, owner] }));
      setOwnerName(""); setOwnerFather(""); setOwnerIsCompany(false);
    }
  }

  async function deleteOwner(ownerId: string) {
    const res = await fetch(`/api/projects/${project.id}/owners`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerId }),
    });
    if (res.ok) {
      setProject((p) => ({ ...p, owners: p.owners.filter((o) => o.id !== ownerId) }));
    }
  }

  async function addShare(ownerId: string) {
    if (!sharePay || !sharePayda) return;
    const res = await fetch(`/api/projects/${project.id}/owners/${ownerId}/shares`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pay: sharePay, payda: sharePayda }),
    });
    if (res.ok) {
      const { share } = await res.json();
      setProject((p) => ({
        ...p,
        owners: p.owners.map((o) =>
          o.id === ownerId ? { ...o, shares: [...o.shares, share] } : o
        ),
      }));
      setSharePay(""); setSharePayda("");
    }
  }

  async function deleteShare(ownerId: string, shareId: string) {
    const res = await fetch(`/api/projects/${project.id}/owners/${ownerId}/shares`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shareId }),
    });
    if (res.ok) {
      setProject((p) => ({
        ...p,
        owners: p.owners.map((o) =>
          o.id === ownerId ? { ...o, shares: o.shares.filter((s) => s.id !== shareId) } : o
        ),
      }));
    }
  }

  async function assignAttorney(ownerId: string, attorneyId: string | null) {
    const res = await fetch(`/api/projects/${project.id}/owners/${ownerId}/assign-attorney`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attorneyId }),
    });
    if (res.ok) {
      const { owner } = await res.json();
      setProject((p) => ({
        ...p,
        owners: p.owners.map((o) => (o.id === ownerId ? { ...o, attorney: owner.attorney } : o)),
      }));
    }
  }

  // --- ATTORNEY OPERATIONS ---
  async function addAttorney() {
    if (!attName.trim()) return;
    const res = await fetch(`/api/projects/${project.id}/attorneys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: attName, notaryInfo: attNotary }),
    });
    if (res.ok) {
      const { attorney } = await res.json();
      setProject((p) => ({ ...p, attorneys: [...p.attorneys, attorney] }));
      setAttName(""); setAttNotary("");
    }
  }

  async function deleteAttorney(attorneyId: string) {
    const res = await fetch(`/api/projects/${project.id}/attorneys`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attorneyId }),
    });
    if (res.ok) {
      setProject((p) => ({
        ...p,
        attorneys: p.attorneys.filter((a) => a.id !== attorneyId),
        owners: p.owners.map((o) => o.attorney?.id === attorneyId ? { ...o, attorney: null } : o),
      }));
    }
  }

  // --- SECTION OPERATIONS ---
  function openNewSection() {
    setEditSection(null);
    setSectionForm({ blokNo: "", katNo: "", bagimsizBolumNo: "", nitelik: "", brutM2: "", netM2: "" });
    setSectionOwnerIds([]);
    setShowSectionModal(true);
  }

  function openEditSection(section: Section) {
    setEditSection(section);
    setSectionForm({
      blokNo: section.blokNo, katNo: section.katNo,
      bagimsizBolumNo: section.bagimsizBolumNo, nitelik: section.nitelik,
      brutM2: section.brutM2.toString(), netM2: section.netM2.toString(),
    });
    setSectionOwnerIds(section.sectionOwners.map((so) => so.owner.id));
    setShowSectionModal(true);
  }

  async function saveSection() {
    const url = `/api/projects/${project.id}/sections`;
    const method = editSection ? "PUT" : "POST";
    const body = editSection
      ? { ...sectionForm, sectionId: editSection.id, ownerIds: sectionOwnerIds }
      : { ...sectionForm, ownerIds: sectionOwnerIds };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const { section } = await res.json();
      if (editSection) {
        setProject((p) => ({
          ...p,
          sections: p.sections.map((s) => (s.id === section.id ? section : s)),
        }));
      } else {
        setProject((p) => ({ ...p, sections: [...p.sections, section] }));
      }
      setShowSectionModal(false);
    }
  }

  async function deleteSection(sectionId: string) {
    const res = await fetch(`/api/projects/${project.id}/sections`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId }),
    });
    if (res.ok) {
      setProject((p) => ({ ...p, sections: p.sections.filter((s) => s.id !== sectionId) }));
    }
  }

  async function calculate() {
    setCalculating(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/calculate`, { method: "POST" });
      if (res.ok) {
        const { sections } = await res.json();
        setProject((p) => ({ ...p, sections }));
      }
    } finally {
      setCalculating(false);
    }
  }

  function downloadCSV() {
    window.open(`/api/projects/${project.id}/export?format=csv`, "_blank");
  }

  async function downloadXLS() {
    const res = await fetch(`/api/projects/${project.id}/export?format=json`);
    const { project: data } = await res.json();
    const XLSX = await import("xlsx");
    const rows = data.sections.map((s: Section, i: number) => ({
      "Sıra": i + 1,
      "Blok No": s.blokNo,
      "Kat No": s.katNo,
      "BB No": s.bagimsizBolumNo,
      "Nitelik": s.nitelik,
      "Brüt m²": s.brutM2,
      "Net m²": s.netM2,
      "Arsa Payı": s.arsaPayi,
      "Arsa Payı Paydası": s.arsaPayiPayda,
      "Malik/Hissedar": s.sectionOwners.map((so: SectionOwner) => so.owner.name).join(" / "),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bağımsız Bölümler");
    XLSX.writeFile(wb, `${data.name}.xlsx`);
  }

  async function downloadPDF() {
    const res = await fetch(`/api/projects/${project.id}/export?format=json`);
    const { project: data } = await res.json();
    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF({ orientation: data.orientation === "Yatay" ? "landscape" : "portrait", format: data.paperSize.toLowerCase() });

    doc.setFont("helvetica");
    doc.setFontSize(14);
    doc.text(data.name, 14, 15);
    doc.setFontSize(9);
    doc.text(`${[data.il, data.ilce, data.mahalle].filter(Boolean).join(" / ")}  •  Ada: ${data.ada}  Parsel: ${data.parsel}`, 14, 22);

    autoTable(doc, {
      startY: 28,
      styles: { fontSize: data.fontSize },
      head: [["Sıra", "Blok", "Kat", "BB No", "Nitelik", "Brüt m²", "Net m²", "Arsa Payı", "Malik/Hissedar"]],
      body: data.sections.map((s: Section, i: number) => [
        i + 1, s.blokNo, s.katNo, s.bagimsizBolumNo, s.nitelik,
        s.brutM2, s.netM2,
        s.arsaPayi && s.arsaPayiPayda ? `${s.arsaPayi}/${s.arsaPayiPayda}` : "",
        s.sectionOwners.map((so: SectionOwner) => so.owner.name).join(" / "),
      ]),
    });

    doc.save(`${data.name}.pdf`);
  }

  const panelHeader = (title: string, open: boolean, toggle: () => void) => (
    <button
      onClick={toggle}
      className="w-full flex items-center justify-between px-5 py-3 bg-indigo-50 hover:bg-indigo-100 transition-colors rounded-t-xl"
    >
      <span className="font-semibold text-indigo-800 text-sm uppercase tracking-wide">{title}</span>
      {open ? <ChevronUp size={16} className="text-indigo-500" /> : <ChevronDown size={16} className="text-indigo-500" />}
    </button>
  );

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft size={16} className="mr-1" />Geri
          </Button>
          <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
          {saveMsg && <span className="text-green-600 text-sm font-medium">{saveMsg}</span>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={downloadCSV} title="CSV İndir">
            <FileText size={15} className="mr-1" />CSV
          </Button>
          <Button variant="outline" size="sm" onClick={downloadXLS} title="Excel İndir">
            <FileSpreadsheet size={15} className="mr-1" />XLS
          </Button>
          <Button variant="outline" size="sm" onClick={downloadPDF} title="PDF İndir">
            <FileText size={15} className="mr-1" />PDF
          </Button>
          <Button variant="secondary" size="sm" onClick={calculate} disabled={calculating}>
            <Calculator size={15} className="mr-1" />
            {calculating ? "Hesaplanıyor..." : "Hesapla"}
          </Button>
          <Button size="sm" onClick={saveProject} disabled={saving}>
            <Save size={15} className="mr-1" />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </div>

      {/* PROJECT INFO */}
      <Card>
        {panelHeader("Proje Bilgileri", infoOpen, () => setInfoOpen(!infoOpen))}
        {infoOpen && (
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <Input label="Proje Adı" value={project.name} onChange={(e) => setField("name", e.target.value)} className="col-span-2" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İl</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white" value={project.il} onChange={(e) => setField("il", e.target.value)}>
                  <option value="">Seçiniz...</option>
                  {ILLER.map((il) => <option key={il} value={il}>{il}</option>)}
                </select>
              </div>
              <Input label="İlçe" value={project.ilce} onChange={(e) => setField("ilce", e.target.value)} />
              <Input label="Semt" value={project.semt} onChange={(e) => setField("semt", e.target.value)} />
              <Input label="Mahalle" value={project.mahalle} onChange={(e) => setField("mahalle", e.target.value)} />
              <Input label="Pafta" value={project.pafta} onChange={(e) => setField("pafta", e.target.value)} />
              <Input label="Ada" value={project.ada} onChange={(e) => setField("ada", e.target.value)} />
              <Input label="Parsel" value={project.parsel} onChange={(e) => setField("parsel", e.target.value)} />
              <Input label="Yüzölçüm (m²)" type="number" value={project.yuzolcum || ""} onChange={(e) => setField("yuzolcum", parseFloat(e.target.value) || 0)} />
            </div>
            <div className="flex gap-4 mt-4 items-end flex-wrap">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yazı Tipi (PDF)</label>
                <input type="number" min={6} max={16} className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm" value={project.fontSize} onChange={(e) => setField("fontSize", parseInt(e.target.value) || 8)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sayfa Yönü</label>
                <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white" value={project.orientation} onChange={(e) => setField("orientation", e.target.value)}>
                  <option>Dikey</option><option>Yatay</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kağıt</label>
                <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white" value={project.paperSize} onChange={(e) => setField("paperSize", e.target.value)}>
                  <option>A3</option><option>A4</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer mb-0.5">
                <input type="checkbox" className="rounded" checked={project.fitToPage} onChange={(e) => setField("fitToPage", e.target.checked)} />
                <span className="text-sm text-gray-700">Sayfaya sığdır</span>
              </label>
            </div>
          </CardContent>
        )}
      </Card>

      {/* VEKALET */}
      <Card>
        {panelHeader("Vekalet Bilgileri", attOpen, () => setAttOpen(!attOpen))}
        {attOpen && (
          <CardContent className="pt-4 space-y-3">
            <div className="flex gap-2">
              <Input placeholder="Vekil adı soyadı" value={attName} onChange={(e) => setAttName(e.target.value)} />
              <Input placeholder="Vekalet noter bilgisi" value={attNotary} onChange={(e) => setAttNotary(e.target.value)} />
              <Button size="sm" onClick={addAttorney} className="shrink-0"><Plus size={14} className="mr-1" />Ekle</Button>
            </div>
            {project.attorneys.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">Henüz vekil eklenmedi.</p>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Vekil Adı</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Noter Bilgisi</th>
                    <th className="w-12 px-4 py-2"></th>
                  </tr></thead>
                  <tbody>
                    {project.attorneys.map((att) => (
                      <tr key={att.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-2">{att.name}</td>
                        <td className="px-4 py-2 text-gray-500">{att.notaryInfo}</td>
                        <td className="px-4 py-2">
                          <button onClick={() => deleteAttorney(att.id)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* MALİK / HİSSEDAR */}
      <Card>
        {panelHeader("Malik / Hissedar Listesi", ownersOpen, () => setOwnersOpen(!ownersOpen))}
        {ownersOpen && (
          <CardContent className="pt-4 space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Input placeholder="Adı Soyadı" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="flex-1 min-w-32" />
              <Input placeholder="Baba Adı (isteğe bağlı)" value={ownerFather} onChange={(e) => setOwnerFather(e.target.value)} className="flex-1 min-w-32" />
              <label className="flex items-center gap-1.5 text-sm cursor-pointer shrink-0">
                <input type="checkbox" className="rounded" checked={ownerIsCompany} onChange={(e) => setOwnerIsCompany(e.target.checked)} />
                Firma
              </label>
              <Button size="sm" onClick={addOwner} className="shrink-0"><Plus size={14} className="mr-1" />Ekle</Button>
            </div>

            {project.owners.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">Henüz hissedar eklenmedi.</p>
            ) : (
              <div className="space-y-2">
                {project.owners.map((owner, idx) => (
                  <div key={owner.id} className="border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-t-lg">
                      <div>
                        <span className="font-medium text-gray-900">{owner.name}</span>
                        {owner.fatherName && <span className="text-gray-400 text-sm ml-2">({owner.fatherName})</span>}
                        {owner.isCompany && <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">Firma</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                          value={owner.attorney?.id || ""}
                          onChange={(e) => assignAttorney(owner.id, e.target.value || null)}
                        >
                          <option value="">Vekil yok</option>
                          {project.attorneys.map((att) => (
                            <option key={att.id} value={att.id}>{att.name}</option>
                          ))}
                        </select>
                        <button
                          className="text-red-400 hover:text-red-600"
                          onClick={() => deleteOwner(owner.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="px-4 py-2">
                      {owner.shares.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {owner.shares.map((share) => (
                            <span key={share.id} className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                              {share.pay}/{share.payda}
                              <button onClick={() => deleteShare(owner.id, share.id)} className="hover:text-red-500 ml-0.5">×</button>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="PAY"
                          className="w-20 rounded border border-gray-200 px-2 py-1 text-xs"
                          value={shareOwnerIdx === idx ? sharePay : ""}
                          onFocus={() => setShareOwnerIdx(idx)}
                          onChange={(e) => setSharePay(e.target.value)}
                        />
                        <span className="text-gray-400 text-xs">/</span>
                        <input
                          type="number"
                          placeholder="PAYDA"
                          className="w-20 rounded border border-gray-200 px-2 py-1 text-xs"
                          value={shareOwnerIdx === idx ? sharePayda : ""}
                          onFocus={() => setShareOwnerIdx(idx)}
                          onChange={(e) => setSharePayda(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addShare(owner.id)}
                        />
                        <button
                          className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"
                          onClick={() => addShare(owner.id)}
                        >
                          Hisse Ekle
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* BAĞIMSIZ BÖLÜM LİSTESİ */}
      <Card>
        {panelHeader("Bağımsız Bölüm Listesi", sectionsOpen, () => setSectionsOpen(!sectionsOpen))}
        {sectionsOpen && (
          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-end">
              <Button size="sm" onClick={openNewSection}>
                <Plus size={14} className="mr-1" />Bölüm Ekle
              </Button>
            </div>

            {project.sections.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">Henüz bağımsız bölüm eklenmedi.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
                      <th className="text-left px-3 py-2 border border-gray-200">#</th>
                      <th className="text-left px-3 py-2 border border-gray-200">Blok</th>
                      <th className="text-left px-3 py-2 border border-gray-200">Kat</th>
                      <th className="text-left px-3 py-2 border border-gray-200">BB No</th>
                      <th className="text-left px-3 py-2 border border-gray-200">Nitelik</th>
                      <th className="text-right px-3 py-2 border border-gray-200">Brüt m²</th>
                      <th className="text-right px-3 py-2 border border-gray-200">Net m²</th>
                      <th className="text-center px-3 py-2 border border-gray-200">Arsa Payı</th>
                      <th className="text-left px-3 py-2 border border-gray-200">Malik</th>
                      <th className="px-3 py-2 border border-gray-200"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.sections.map((section, i) => (
                      <tr key={section.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-3 py-1.5 border border-gray-200 text-gray-500">{i + 1}</td>
                        <td className="px-3 py-1.5 border border-gray-200">{section.blokNo}</td>
                        <td className="px-3 py-1.5 border border-gray-200">{section.katNo}</td>
                        <td className="px-3 py-1.5 border border-gray-200 font-medium">{section.bagimsizBolumNo}</td>
                        <td className="px-3 py-1.5 border border-gray-200">{section.nitelik}</td>
                        <td className="px-3 py-1.5 border border-gray-200 text-right">{section.brutM2}</td>
                        <td className="px-3 py-1.5 border border-gray-200 text-right">{section.netM2}</td>
                        <td className="px-3 py-1.5 border border-gray-200 text-center font-mono text-indigo-700">
                          {section.arsaPayi && section.arsaPayiPayda ? `${section.arsaPayi}/${section.arsaPayiPayda}` : "—"}
                        </td>
                        <td className="px-3 py-1.5 border border-gray-200">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {section.sectionOwners.map((so) => (
                              <span key={so.id} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                                {so.owner.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-1.5 border border-gray-200">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEditSection(section)} className="text-gray-400 hover:text-indigo-600 text-xs px-1">Düzenle</button>
                            <button onClick={() => deleteSection(section.id)} className="text-red-400 hover:text-red-600">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* SECTION MODAL */}
      <Modal
        isOpen={showSectionModal}
        onClose={() => setShowSectionModal(false)}
        title={editSection ? "Bölümü Düzenle" : "Yeni Bağımsız Bölüm"}
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Input label="Blok No" value={sectionForm.blokNo} onChange={(e) => setSectionForm((f) => ({ ...f, blokNo: e.target.value }))} />
            <Input label="Kat No" value={sectionForm.katNo} onChange={(e) => setSectionForm((f) => ({ ...f, katNo: e.target.value }))} />
            <Input label="BB No" value={sectionForm.bagimsizBolumNo} onChange={(e) => setSectionForm((f) => ({ ...f, bagimsizBolumNo: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nitelik</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={sectionForm.nitelik}
                onChange={(e) => setSectionForm((f) => ({ ...f, nitelik: e.target.value }))}
              >
                <option value="">Seçiniz...</option>
                {NITELIKLER.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <Input label="Brüt m²" type="number" value={sectionForm.brutM2} onChange={(e) => setSectionForm((f) => ({ ...f, brutM2: e.target.value }))} />
            <Input label="Net m²" type="number" value={sectionForm.netM2} onChange={(e) => setSectionForm((f) => ({ ...f, netM2: e.target.value }))} />
          </div>

          {/* Owner selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Malik / Hissedar
            </label>
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-40 overflow-y-auto">
              {project.owners.length === 0 ? (
                <p className="text-sm text-gray-400 px-3 py-2">Önce hissedar ekleyin.</p>
              ) : (
                project.owners.map((owner) => (
                  <label key={owner.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={sectionOwnerIds.includes(owner.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSectionOwnerIds((prev) => [...prev, owner.id]);
                        } else {
                          setSectionOwnerIds((prev) => prev.filter((id) => id !== owner.id));
                        }
                      }}
                    />
                    <span className="text-sm">{owner.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setShowSectionModal(false)}>İptal</Button>
            <Button onClick={saveSection}>{editSection ? "Güncelle" : "Ekle"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
