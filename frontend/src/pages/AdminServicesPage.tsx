import { AlignLeft, Clock, DollarSign, ImagePlus, Pencil, Plus, Scissors, Search, Tag, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../app/components/ui/alert-dialog";
import { CATEGORIES, CHARCOAL, MINT, SLATE } from "../data/mockData";
import { useServices } from "../contexts/ServicesContext";
import type { Service } from "../types";
import { fmtPrice } from "../components/qcare/shared";

interface SvcForm {
  title: string;
  category: string;
  price: string;
  duration: string;
  image: string;
  description: string;
}

export default function AdminServicesPage() {
  const { services, addService, updateService, deleteService: deleteServiceApi } = useServices();
  const [svcSearch, setSvcSearch] = useState("");
  const [svcCatFilter, setSvcCatFilter] = useState("all");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingSvcId, setEditingSvcId] = useState<number | null>(null);
  const [svcForm, setSvcForm] = useState<SvcForm>({ title: "", category: "spa", price: "", duration: "", image: "", description: "" });
  const [svcFormErrors, setSvcFormErrors] = useState<Record<string, string>>({});
  const [isDeletingService, setIsDeletingService] = useState(false);

  const filteredAdminSvcs = useMemo(() => services.filter((service) => {
    const matchesQuery = !svcSearch.trim() || service.title.toLowerCase().includes(svcSearch.toLowerCase());
    const matchesCategory = svcCatFilter === "all" || service.category === svcCatFilter;
    return matchesQuery && matchesCategory;
  }), [services, svcCatFilter, svcSearch]);

  function openSvcEdit(svc: Service) {
    setEditingSvcId(svc.id);
    setSvcForm({ title: svc.title, category: svc.category, price: String(svc.price), duration: svc.duration, image: svc.image, description: svc.description });
    setSvcFormErrors({});
    setIsEditModalOpen(true);
  }

  function openSvcAdd() {
    setEditingSvcId(null);
    setSvcForm({ title: "", category: "spa", price: "", duration: "", image: "", description: "" });
    setSvcFormErrors({});
    setIsEditModalOpen(true);
  }

  async function saveSvcForm() {
    const errors: Record<string, string> = {};
    if (!svcForm.title.trim()) errors.title = "Vui lòng nhập tên dịch vụ";
    if (!svcForm.price.trim() || Number.isNaN(Number(svcForm.price))) errors.price = "Giá tiền không hợp lệ";
    if (Object.keys(errors).length > 0) {
      setSvcFormErrors(errors);
      return;
    }

    try {
      if (editingSvcId !== null) {
        await updateService(editingSvcId, (service) => ({
          ...service,
          title: svcForm.title,
          category: svcForm.category,
          price: Number(svcForm.price),
          duration: svcForm.duration,
          image: svcForm.image || service.image,
          description: svcForm.description,
        }));
      } else {
        const newId = Math.max(...services.map((service) => service.id)) + 1;
        await addService({
          id: newId,
          category: svcForm.category,
          title: svcForm.title,
          subtitle: svcForm.description.slice(0, 60),
          price: Number(svcForm.price),
          duration: svcForm.duration || "30–60 phút",
          image: svcForm.image || "https://images.unsplash.com/photo-1611173622933-91942d394b04?w=900&h=520&fit=crop&auto=format",
          description: svcForm.description,
          priceBreakdown: [{ label: svcForm.title, price: Number(svcForm.price) }],
          steps: [],
        });
      }

      toast.success(editingSvcId !== null ? "Đã lưu thay đổi dịch vụ" : "Đã thêm dịch vụ mới");
      setIsEditModalOpen(false);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Không thể lưu dịch vụ. Vui lòng thử lại.";
      toast.error(message);
    }
  }

  function closeEditModal() {
    setIsEditModalOpen(false);
  }

  async function confirmDeleteService() {
    if (editingSvcId === null) return;

    try {
      setIsDeletingService(true);
      await deleteServiceApi(editingSvcId);
      toast.success(`Đã xóa dịch vụ "${svcForm.title || "đã chọn"}" thành công`);
      setIsDeleteConfirmOpen(false);
      setIsEditModalOpen(false);
      setEditingSvcId(null);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Không thể xóa dịch vụ. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setIsDeletingService(false);
    }
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: CHARCOAL, letterSpacing: "-0.02em", marginBottom: 4 }}>Quản lý dịch vụ</h1>
          <p style={{ fontSize: 13, color: SLATE }}>{filteredAdminSvcs.length} dịch vụ</p>
        </div>
        <button onClick={openSvcAdd} style={{ height: 40, padding: "0 18px", borderRadius: 12, backgroundColor: MINT, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: CHARCOAL, display: "flex", alignItems: "center", gap: 7, fontFamily: "inherit" }}><Plus size={15} /> Thêm dịch vụ mới</button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 380 }}>
          <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: SLATE, pointerEvents: "none" }} />
          <input type="text" placeholder="Tìm theo tên dịch vụ..." value={svcSearch} onChange={(e) => setSvcSearch(e.target.value)} style={{ width: "100%", padding: "10px 14px 10px 40px", borderRadius: 12, border: "1.5px solid transparent", backgroundColor: "#EBEBEB", fontSize: 13.5, color: CHARCOAL, outline: "none", fontFamily: "inherit" }} />
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setSvcCatFilter(cat.id)} style={{ padding: "8px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 600, border: "none", cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit", backgroundColor: svcCatFilter === cat.id ? CHARCOAL : "#EBEBEB", color: svcCatFilter === cat.id ? "#fff" : SLATE }}>{cat.label}</button>
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: "#fff", borderRadius: 20, border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#FAFAFA" }}>
              {["Hình ảnh", "Tên dịch vụ", "Danh mục", "Giá", "Thời gian", "Mô tả", "Thao tác"].map((column) => (
                <th key={column} style={{ padding: "11px 20px", textAlign: "left", fontSize: 10.5, fontWeight: 700, color: SLATE, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid rgba(0,0,0,0.06)", whiteSpace: "nowrap" }}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAdminSvcs.length === 0 && <tr><td colSpan={7} style={{ padding: 48, textAlign: "center", color: SLATE, fontSize: 13 }}>Không tìm thấy dịch vụ nào</td></tr>}
            {filteredAdminSvcs.map((svc, idx) => (
              <tr key={svc.id} style={{ borderBottom: idx < filteredAdminSvcs.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none", transition: "background 0.1s" }}>
                <td style={{ padding: "12px 20px" }}><div style={{ width: 56, height: 40, borderRadius: 10, overflow: "hidden", backgroundColor: "#F0F0EE" }}><img src={svc.image} alt={svc.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div></td>
                <td style={{ padding: "12px 20px" }}><span style={{ fontSize: 13.5, fontWeight: 700, color: CHARCOAL }}>{svc.title}</span></td>
                <td style={{ padding: "12px 20px" }}><span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, backgroundColor: `${MINT}25`, color: CHARCOAL }}>{CATEGORIES.find((category) => category.id === svc.category)?.label ?? "Dịch vụ"}</span></td>
                <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 700, color: CHARCOAL, whiteSpace: "nowrap" }}>{fmtPrice(svc.price)}</td>
                <td style={{ padding: "12px 20px", fontSize: 12.5, color: SLATE, whiteSpace: "nowrap" }}>{svc.duration}</td>
                <td style={{ padding: "12px 20px" }}><span style={{ fontSize: 12, color: SLATE, display: "block", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{svc.description}</span></td>
                <td style={{ padding: "12px 20px" }}><button onClick={() => openSvcEdit(svc)} style={{ height: 32, padding: "0 14px", borderRadius: 9, border: `1.5px solid ${MINT}`, backgroundColor: "transparent", cursor: "pointer", fontSize: 12, fontWeight: 600, color: CHARCOAL, display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "inherit", transition: "all 0.15s" }}><Pencil size={11} /> Chỉnh sửa</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, pointerEvents: "auto" }} onClick={(e) => { if (e.target === e.currentTarget) closeEditModal(); }}>
          <div style={{ backgroundColor: "#fff", borderRadius: 24, overflow: "hidden", display: "flex", flexDirection: "column", width: "100%", maxWidth: 560, maxHeight: "90vh", boxShadow: "0 32px 80px rgba(0,0,0,0.25)", animation: "slideUp 0.3s ease", pointerEvents: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)", flexShrink: 0, backgroundColor: CHARCOAL }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: `${MINT}30`, display: "flex", alignItems: "center", justifyContent: "center" }}><Scissors size={16} style={{ color: MINT }} /></div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{editingSvcId !== null ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}</p>
              </div>
              <button onClick={closeEditModal} style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><X size={14} /></button>
            </div>
            <div style={{ overflowY: "auto", flex: 1, scrollbarWidth: "none", padding: 28 }}>
              {svcForm.image && <div style={{ height: 120, borderRadius: 16, overflow: "hidden", marginBottom: 20, backgroundColor: "#F0F0EE" }}><img src={svcForm.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => (e.currentTarget.style.display = "none")} /></div>}
              {([
                { id: "sf-title", label: "Tên dịch vụ *", icon: <Tag size={13} />, value: svcForm.title, onChange: (value: string) => setSvcForm((form) => ({ ...form, title: value })), placeholder: "VD: Tắm Spa Premium", error: svcFormErrors.title },
                { id: "sf-price", label: "Giá tiền (đ) *", icon: <DollarSign size={13} />, value: svcForm.price, onChange: (value: string) => setSvcForm((form) => ({ ...form, price: value })), placeholder: "VD: 250000", error: svcFormErrors.price },
                { id: "sf-duration", label: "Thời gian", icon: <Clock size={13} />, value: svcForm.duration, onChange: (value: string) => setSvcForm((form) => ({ ...form, duration: value })), placeholder: "VD: 60–90 phút", error: undefined },
                { id: "sf-image", label: "URL hình ảnh", icon: <ImagePlus size={13} />, value: svcForm.image, onChange: (value: string) => setSvcForm((form) => ({ ...form, image: value })), placeholder: "https://images.unsplash.com/...", error: undefined },
              ] as const).map((field) => (
                <div key={field.id} style={{ marginBottom: 16 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: SLATE, marginBottom: 6 }}>{field.icon} {field.label}</label>
                  <input type="text" value={field.value} onChange={(e) => field.onChange(e.target.value)} placeholder={field.placeholder} style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: `1.5px solid ${field.error ? "#EF4444" : "transparent"}`, backgroundColor: "#F5F5F5", fontSize: 13.5, color: CHARCOAL, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                  {field.error && <p style={{ fontSize: 11, color: "#EF4444", marginTop: 4 }}>⚠ {field.error}</p>}
                </div>
              ))}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: SLATE, marginBottom: 6 }}><Tag size={13} /> Danh mục</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {CATEGORIES.filter((category) => category.id !== "all").map((cat) => (
                    <button key={cat.id} type="button" onClick={() => setSvcForm((form) => ({ ...form, category: cat.id }))} style={{ padding: "7px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", backgroundColor: svcForm.category === cat.id ? CHARCOAL : "#EBEBEB", color: svcForm.category === cat.id ? "#fff" : SLATE }}>{cat.label}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: SLATE, marginBottom: 6 }}><AlignLeft size={13} /> Mô tả chi tiết</label>
                <textarea value={svcForm.description} onChange={(e) => setSvcForm((form) => ({ ...form, description: e.target.value }))} rows={4} placeholder="Mô tả dịch vụ, quy trình, lợi ích..." style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1.5px solid transparent", backgroundColor: "#F5F5F5", fontSize: 13.5, color: CHARCOAL, outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {editingSvcId !== null && (
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setIsDeleteConfirmOpen(true);
                    }}
                    disabled={isDeletingService}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 12,
                      backgroundColor: "#DC2626",
                      border: "none",
                      cursor: isDeletingService ? "not-allowed" : "pointer",
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: "#fff",
                      fontFamily: "inherit",
                      opacity: isDeletingService ? 0.7 : 1,
                    }}
                  >
                    Xóa dịch vụ
                  </button>
                )}
                <div style={{ display: "flex", gap: 12, flex: 1, justifyContent: "flex-end" }}>
                  <button onClick={closeEditModal} style={{ minWidth: 120, padding: "12px", borderRadius: 12, backgroundColor: "#F5F5F5", border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: CHARCOAL, fontFamily: "inherit" }}>Hủy</button>
                  <button onClick={saveSvcForm} style={{ minWidth: 120, padding: "12px", borderRadius: 12, backgroundColor: MINT, border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: CHARCOAL, fontFamily: "inherit" }}>{editingSvcId !== null ? "Lưu thay đổi" : "Thêm dịch vụ"}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa dịch vụ</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa dịch vụ "{svcForm.title || "đã chọn"}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingService}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteService} disabled={isDeletingService} style={{ backgroundColor: "#DC2626" }}>
              {isDeletingService ? "Đang xóa..." : "Xác nhận xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
