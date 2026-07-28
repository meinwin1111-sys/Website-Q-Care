import { AlertTriangle, Calendar, Check, ChevronRight, Pencil, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { CHARCOAL, MINT, PET_BG, SLATE, STATUS_MAP, VET_NAME } from "../data/mockData";
import { useAppointments } from "../contexts/AppointmentsContext";
import type { Appointment } from "../types";
import {
  LabeledInput,
  MiniCalendar,
  PetGrid,
  TimeSlotGrid,
  fmtDateStr,
  getPetDisplay,
  getPetOpt,
  pad,
} from "../components/qcare/shared";

export default function MyAppointmentsPage() {
  const navigate = useNavigate();
  const { appointments, cancelAppointment, updateAppointment } = useAppointments();

  const [apptSearch, setApptSearch] = useState("");
  const [apptFilter, setApptFilter] = useState<"all" | "success" | "cancelled">("all");
  const [detailAppt, setDetailAppt] = useState<Appointment | null>(null);
  const [detailMode, setDetailMode] = useState<"view" | "edit" | "cancel">("view");
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [editPetType, setEditPetType] = useState<string | null>(null);
  const [editPetName, setEditPetName] = useState("");
  const [editCustomPet, setEditCustomPet] = useState("");
  const [editCalYear, setEditCalYear] = useState(2026);
  const [editCalMonth, setEditCalMonth] = useState(6);
  const [editSelDay, setEditSelDay] = useState<number | null>(null);
  const [editSelTime, setEditSelTime] = useState<string | null>(null);
  const [editAddress, setEditAddress] = useState("");
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  // Customer view only shows appointments created from customer side (i.e. have a non-empty address).
  // Admin-only entries are still in the same single-source `appointments` array.
  const customerAppointments = useMemo(() => appointments.filter((a) => a.address.trim().length > 0), [appointments]);

  const sortedAppts = useMemo(() => [...customerAppointments].sort((a, b) => {
    const aDate = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
    const bDate = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
    return bDate - aDate;
  }), [customerAppointments]);

  const displayedAppts = useMemo(() => sortedAppts.filter((appt) => {
    const matchesStatus = apptFilter === "all" || appt.status === apptFilter;
    const query = apptSearch.toLowerCase();
    const matchesQuery = !query || appt.service.toLowerCase().includes(query) || appt.pet.toLowerCase().includes(query);
    return matchesStatus && matchesQuery;
  }), [apptFilter, apptSearch, sortedAppts]);

  const editFirstDow = new Date(editCalYear, editCalMonth, 1).getDay();
  const editDaysInMonth = new Date(editCalYear, editCalMonth + 1, 0).getDate();
  const editCalCells = [...Array(editFirstDow).fill(null), ...Array.from({ length: editDaysInMonth }, (_, i) => i + 1)];
  const isEditPrevDis = editCalYear === 2026 && editCalMonth === 6;

  const editBookedSlots = useMemo(() => new Set(
    customerAppointments
      .filter((appt) => appt.id !== detailAppt?.id && appt.status !== "cancelled")
      .map((appt) => `${appt.date}|${appt.time}`),
  ), [customerAppointments, detailAppt?.id]);

  function openDetail(appt: Appointment) {
    setDetailAppt(appt);
    setDetailMode("view");
    setCancelReason("");
    setCancelError("");
    setShowEditConfirm(false);
  }

  function enterEditMode() {
    if (!detailAppt) return;
    setEditPetType(detailAppt.petType);
    setEditPetName(detailAppt.pet);
    setEditCustomPet(detailAppt.petType === "other" ? detailAppt.petDisplay : "");
    const [year, month, day] = detailAppt.date.split("-").map(Number);
    setEditCalYear(year);
    setEditCalMonth(month - 1);
    setEditSelDay(day);
    setEditSelTime(detailAppt.time);
    setEditAddress(detailAppt.address);
    setDetailMode("edit");
  }

  function handleConfirmUpdate() {
    if (!detailAppt) return;

    const newDate = editSelDay ? `${editCalYear}-${pad(editCalMonth + 1)}-${pad(editSelDay)}` : detailAppt.date;
    updateAppointment(detailAppt.id, (appt) => ({
      ...appt,
      petType: editPetType || appt.petType,
      pet: editPetName || appt.pet,
      petDisplay: editPetType ? getPetDisplay(editPetType, editCustomPet) : appt.petDisplay,
      petEmoji: editPetType ? getPetOpt(editPetType).emoji : appt.petEmoji,
      date: newDate,
      time: editSelTime || appt.time,
      address: editAddress || appt.address,
    }));

    setShowEditConfirm(false);
    setDetailAppt(null);
  }

  async function handleCancelAppointment() {
    if (!detailAppt) return;
    if (!cancelReason.trim()) {
      setCancelError("Vui lòng nhập lý do hủy");
      return;
    }

    try {
      await cancelAppointment(detailAppt.id, cancelReason.trim());
      toast.success("Hủy lịch hẹn thành công");
      setDetailAppt(null);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Không thể hủy lịch hẹn.";
      setCancelError(message);
      toast.error(message);
    }
  }

  return (
    <div className="flex-1 max-w-[900px] mx-auto w-full px-8 py-8 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: CHARCOAL, letterSpacing: "-0.02em" }}>Lịch hẹn của tôi</h1>
          <p className="text-sm mt-0.5" style={{ color: SLATE }}>{customerAppointments.length} lịch hẹn · Đà Nẵng</p>
        </div>
        <button onClick={() => navigate("/")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all" style={{ backgroundColor: MINT, color: CHARCOAL }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#7DD8C6")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = MINT)}><Plus size={15} strokeWidth={2.5} /> Đặt lịch mới</button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: SLATE }} />
          <input type="text" placeholder="Tìm theo dịch vụ hoặc tên thú cưng..." value={apptSearch} onChange={(e) => setApptSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all" style={{ backgroundColor: "#EBEBEB", border: "1.5px solid transparent", color: CHARCOAL }} onFocus={(e) => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.borderColor = MINT; }} onBlur={(e) => { e.currentTarget.style.backgroundColor = "#EBEBEB"; e.currentTarget.style.borderColor = "transparent"; }} />
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ backgroundColor: "#EBEBEB" }}>
          {([{ key: "all", label: "Tất cả" }, { key: "success", label: "Thành công" }, { key: "cancelled", label: "Đã hủy" }] as const).map((filter) => (
            <button key={filter.key} onClick={() => setApptFilter(filter.key)} className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{ backgroundColor: apptFilter === filter.key ? "#fff" : "transparent", color: apptFilter === filter.key ? (filter.key === "cancelled" ? "#C62828" : filter.key === "success" ? "#0D6E5A" : CHARCOAL) : SLATE, boxShadow: apptFilter === filter.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>{filter.label}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {displayedAppts.length === 0 && (
          <div className="text-center py-20" style={{ color: SLATE }}>
            <Calendar size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p className="text-sm font-medium">Không tìm thấy lịch hẹn nào</p>
          </div>
        )}
        {displayedAppts.map((appt) => {
          const status = STATUS_MAP[appt.status];
          return (
            <button key={appt.id} onClick={() => openDetail(appt)} className="w-full text-left transition-all duration-200" style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", borderRadius: 20, backgroundColor: "#fff", border: "1.5px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = MINT; e.currentTarget.style.boxShadow = "0 4px 16px rgba(163,228,215,0.2)"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.07)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}>
              <div className="flex-shrink-0 text-2xl w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: PET_BG[appt.petType] || "#F5F5F5" }}>{appt.petEmoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-bold" style={{ color: CHARCOAL }}>{appt.service}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold" style={{ backgroundColor: status.bg, color: status.color }}>{status.label}</span>
                </div>
                <p className="text-xs" style={{ color: SLATE }}>{appt.pet} · {fmtDateStr(appt.date)} lúc {appt.time}</p>
                <p className="text-[11px] mt-0.5 font-mono" style={{ color: "#BBBBBB" }}>{appt.id}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold" style={{ color: CHARCOAL }}>{appt.price.toLocaleString("vi-VN")}đ</p>
                <ChevronRight size={15} style={{ color: "#D0D0D0", marginLeft: "auto", marginTop: 6 }} />
              </div>
            </button>
          );
        })}
      </div>

      {detailAppt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", padding: 24 }} onClick={(e) => { if (e.target === e.currentTarget && !showEditConfirm) setDetailAppt(null); }}>
          <div className="bg-white rounded-3xl overflow-hidden flex flex-col" style={{ width: "100%", maxWidth: detailMode === "edit" ? 700 : 480, maxHeight: "92vh", boxShadow: "0 32px 80px rgba(0,0,0,0.25)", animation: "slideUp 0.3s ease" }}>
            <div className="flex items-center justify-between px-7 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: SLATE }}>{detailMode === "view" ? "Chi tiết lịch hẹn" : detailMode === "edit" ? "Chỉnh sửa lịch hẹn" : "Hủy lịch hẹn"}</p>
                <p className="text-base font-bold mt-0.5" style={{ color: CHARCOAL }}>{detailAppt.service}</p>
              </div>
              <button onClick={() => setDetailAppt(null)} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: "#F5F5F5", color: SLATE }}><X size={14} /></button>
            </div>

            {detailMode === "view" && (
              <div className="overflow-y-auto flex-1">
                <div className="px-7 py-5">
                  <div className="flex items-center gap-4 p-4 rounded-2xl mb-5" style={{ backgroundColor: "#F9F9F9", border: "1px solid rgba(0,0,0,0.05)" }}>
                    <div className="text-4xl w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: PET_BG[detailAppt.petType] || "#F5F5F5" }}>{detailAppt.petEmoji}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-base" style={{ color: CHARCOAL }}>{detailAppt.pet}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold" style={{ backgroundColor: STATUS_MAP[detailAppt.status].bg, color: STATUS_MAP[detailAppt.status].color }}>{STATUS_MAP[detailAppt.status].label}</span>
                      </div>
                      <p className="text-xs" style={{ color: SLATE }}>{detailAppt.petDisplay}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-extrabold" style={{ color: CHARCOAL }}>{detailAppt.price.toLocaleString("vi-VN")}đ</p>
                      <p className="text-[10px] font-mono mt-0.5" style={{ color: "#BBBBBB" }}>{detailAppt.id}</p>
                    </div>
                  </div>

                  <div className="space-y-3.5 mb-5">
                    {[{ icon: "📅", label: "Ngày hẹn", value: fmtDateStr(detailAppt.date) }, { icon: "⏰", label: "Giờ hẹn", value: detailAppt.time }, { icon: "📍", label: "Địa chỉ", value: detailAppt.address }, { icon: "🩺", label: "Bác sĩ phụ trách", value: `Bác sĩ: ${VET_NAME}` }].map((row) => (
                      <div key={row.label} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm" style={{ backgroundColor: `${MINT}20` }}>{row.icon}</div>
                        <div><p className="text-[11px]" style={{ color: SLATE }}>{row.label}</p><p className="text-sm font-semibold" style={{ color: CHARCOAL }}>{row.value}</p></div>
                      </div>
                    ))}
                  </div>
                </div>

                {detailAppt.status === "success" && (
                  <div className="px-7 pb-7 flex gap-3">
                    <button onClick={enterEditMode} className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all" style={{ backgroundColor: `${MINT}20`, color: CHARCOAL, border: `1px solid ${MINT}60` }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${MINT}35`)} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `${MINT}20`)}><Pencil size={14} /> Chỉnh sửa</button>
                    <button onClick={() => setDetailMode("cancel")} className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all" style={{ backgroundColor: "#FFF5F5", color: "#C62828", border: "1px solid #FFCDD2" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FFEBEE")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FFF5F5")}><Trash2 size={14} /> Hủy lịch</button>
                  </div>
                )}
              </div>
            )}

            {detailMode === "cancel" && (
              <div className="px-7 py-6 overflow-y-auto flex-1" style={{ scrollbarWidth: "none" }}>
                <div className="flex items-start gap-3 p-4 rounded-xl mb-5" style={{ backgroundColor: "#FFF8F0", border: "1px solid #FDDCB5" }}>
                  <AlertTriangle size={18} style={{ color: "#E67E22", flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#B45309" }}>Bạn sắp hủy lịch hẹn này</p>
                    <p className="text-xs mt-0.5" style={{ color: "#92400E" }}><strong>{detailAppt.service}</strong> · {fmtDateStr(detailAppt.date)} lúc {detailAppt.time}</p>
                    <p className="text-[11px] mt-1" style={{ color: "#92400E" }}>Lịch hẹn sẽ được đánh dấu là Đã hủy.</p>
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: SLATE, marginBottom: 6 }}>Lý do hủy <span style={{ color: "#EF4444" }}>*</span></label>
                  <textarea value={cancelReason} onChange={(e) => { setCancelReason(e.target.value); setCancelError(""); }} placeholder="Nhập lý do hủy lịch hẹn của bạn..." rows={3} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${cancelError ? "#EF4444" : "transparent"}`, backgroundColor: "#F5F5F5", fontSize: 13.5, color: CHARCOAL, outline: "none", resize: "none", fontFamily: "inherit" }} />
                  {cancelError && <p style={{ fontSize: 11, color: "#EF4444", marginTop: 4 }}>⚠ {cancelError}</p>}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setDetailMode("view")} className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all" style={{ backgroundColor: "#F5F5F5", color: CHARCOAL }}>Quay lại</button>
                  <button onClick={handleCancelAppointment} className="flex-1 py-3 rounded-xl font-bold text-sm transition-all" style={{ backgroundColor: "#C62828", color: "#fff" }}>Xác nhận hủy</button>
                </div>
              </div>
            )}

            {detailMode === "edit" && (
              <div className="overflow-y-auto flex-1 px-7 py-6" style={{ scrollbarWidth: "none" }}>
                <p className="text-sm mb-5" style={{ color: SLATE }}>Chỉnh sửa thông tin lịch hẹn của bạn. Các khung giờ đã có người đặt sẽ bị khóa.</p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: SLATE }}>Loại thú cưng</p>
                    <PetGrid selected={editPetType} onSelect={(value) => { setEditPetType(value); if (value !== "other") setEditCustomPet(""); }} />
                    {editPetType === "other" && <LabeledInput id="ecustom" label="Loại thú cưng cụ thể" value={editCustomPet} onChange={setEditCustomPet} placeholder="Ví dụ: Rùa, Cá..." />}
                    <LabeledInput id="epname" label="Tên thú cưng" value={editPetName} onChange={setEditPetName} placeholder="Tên thú cưng" />
                    <LabeledInput id="eaddr" label="Địa chỉ khám tại nhà" value={editAddress} onChange={setEditAddress} placeholder="Số nhà, đường, phường..." />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: SLATE }}>Chọn ngày</p>
                    <MiniCalendar calY={editCalYear} calM={editCalMonth} cells={editCalCells} selD={editSelDay} isPrevDis={isEditPrevDis} onPrev={() => { if (isEditPrevDis) return; editCalMonth === 0 ? (setEditCalYear((year) => year - 1), setEditCalMonth(11)) : setEditCalMonth((month) => month - 1); setEditSelDay(null); setEditSelTime(null); }} onNext={() => { editCalMonth === 11 ? (setEditCalYear((year) => year + 1), setEditCalMonth(0)) : setEditCalMonth((month) => month + 1); setEditSelDay(null); setEditSelTime(null); }} onSelect={(day) => { setEditSelDay(day); setEditSelTime(null); }} />
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-4 mb-3" style={{ color: SLATE }}>Chọn giờ</p>
                    <TimeSlotGrid selDay={editSelDay} selTime={editSelTime} calY={editCalYear} calM={editCalMonth} onSelect={setEditSelTime} bookedSlots={editBookedSlots} />
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setDetailMode("view")} className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all" style={{ backgroundColor: "#F5F5F5", color: CHARCOAL }}>Hủy chỉnh sửa</button>
                  <button onClick={() => setShowEditConfirm(true)} className="flex-1 py-3 rounded-xl font-bold text-sm transition-all" style={{ backgroundColor: MINT, color: CHARCOAL }}>Cập nhật →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showEditConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }}>
          <div className="bg-white rounded-2xl p-7 mx-6 max-w-sm w-full" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.25)", animation: "slideUp 0.25s ease" }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${MINT}25` }}><Check size={22} style={{ color: CHARCOAL }} /></div>
            <h3 className="text-base font-bold mb-2" style={{ color: CHARCOAL }}>Xác nhận chỉnh sửa</h3>
            <p className="text-sm mb-6" style={{ color: SLATE }}>Bạn có đồng ý xác nhận chỉnh sửa lịch hẹn này không?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowEditConfirm(false)} className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all" style={{ backgroundColor: "#F5F5F5", color: CHARCOAL }}>Huỷ bỏ</button>
              <button onClick={handleConfirmUpdate} className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all" style={{ backgroundColor: MINT, color: CHARCOAL }}>Đồng ý</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
