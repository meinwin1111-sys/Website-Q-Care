import { AlertTriangle, Check, CheckCircle2, ExternalLink, Pencil, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { CHARCOAL, MINT, SLATE, STATUS_MAP } from "../../data/mockData";
import { useAppointments } from "../../contexts/AppointmentsContext";
import type { Appointment } from "../../types";
import { MiniCalendar, TimeSlotGrid, fmtDateStr, fmtDateVi, pad } from "./shared";

export default function AdminAppointmentsPanel() {
  const { appointments, cancelAppointment, updateAppointment } = useAppointments();
  const [adminApptSearch, setAdminApptSearch] = useState("");
  const [adminSelAppt, setAdminSelAppt] = useState<Appointment | null>(null);
  const [adminApptMode, setAdminApptMode] = useState<"view" | "edit" | "cancel">("view");
  const today = new Date();
  const [adminEditCalYear, setAdminEditCalYear] = useState(today.getFullYear());
  const [adminEditCalMonth, setAdminEditCalMonth] = useState(today.getMonth());
  const [adminEditDay, setAdminEditDay] = useState<number | null>(null);
  const [adminEditTime, setAdminEditTime] = useState<string | null>(null);
  const [adminCancelReason, setAdminCancelReason] = useState("");
  const [adminCancelError, setAdminCancelError] = useState("");
  const [adminShowConfirm, setAdminShowConfirm] = useState(false);

  const adminApptFirstDow = new Date(adminEditCalYear, adminEditCalMonth, 1).getDay();
  const adminApptDaysInMonth = new Date(adminEditCalYear, adminEditCalMonth + 1, 0).getDate();
  const adminApptCalCells = [...Array(adminApptFirstDow).fill(null), ...Array.from({ length: adminApptDaysInMonth }, (_, i) => i + 1)];
  const isAdminEditPrevDis = adminEditCalYear === today.getFullYear() && adminEditCalMonth === today.getMonth();
  const todayKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const todaySuccess = appointments.filter((item) => item.date === todayKey && item.status === "success").length;

  const filteredAdminAppts = useMemo(() => appointments.filter((appt) => {
    const query = adminApptSearch.toLowerCase();
    return !query || appt.id.toLowerCase().includes(query) || (appt.vet ?? "").toLowerCase().includes(query) || fmtDateStr(appt.date).includes(query);
  }), [appointments, adminApptSearch]);

  function openAdminApptDetail(appt: Appointment) {
    setAdminSelAppt(appt);
    setAdminApptMode("view");
    const [year, month, day] = appt.date.split("-").map(Number);
    setAdminEditCalYear(year);
    setAdminEditCalMonth(month - 1);
    setAdminEditDay(day);
    setAdminEditTime(appt.time);
    setAdminCancelReason("");
    setAdminCancelError("");
    setAdminShowConfirm(false);
  }

  function saveAdminApptEdit() {
    if (!adminSelAppt) return;
    const newDate = adminEditDay ? `${adminEditCalYear}-${pad(adminEditCalMonth + 1)}-${pad(adminEditDay)}` : adminSelAppt.date;
    updateAppointment(adminSelAppt.id, (appt) => ({ ...appt, date: newDate, time: adminEditTime || appt.time }));
    setAdminShowConfirm(false);
    setAdminSelAppt(null);
  }

  async function confirmAdminCancel() {
    if (!adminSelAppt) return;
    if (!adminCancelReason.trim()) {
      setAdminCancelError("Vui lòng nhập lý do hủy");
      return;
    }

    try {
      await cancelAppointment(adminSelAppt.id, adminCancelReason.trim());
      toast.success("Hủy lịch hẹn thành công");
      setAdminSelAppt(null);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Không thể hủy lịch hẹn.";
      setAdminCancelError(message);
      toast.error(message);
    }
  }

  return (
    <>
      <div style={{ padding: 32 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: CHARCOAL, letterSpacing: "-0.02em", marginBottom: 4 }}>Chào mừng trở lại, Admin 👋</h1>
          <p style={{ fontSize: 13.5, color: SLATE }}>Đây là tổng quan hoạt động đặt lịch ngày hôm nay.</p>
        </div>
        <div style={{ marginBottom: 32 }}>
          <div style={{ backgroundColor: "#fff", borderRadius: 20, padding: "24px 28px", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 20, maxWidth: 400 }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, backgroundColor: `${MINT}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <CheckCircle2 size={28} style={{ color: "#0D6E5A" }} />
            </div>
            <div>
              <p style={{ fontSize: 42, fontWeight: 800, color: CHARCOAL, letterSpacing: "-0.03em", lineHeight: 1 }}>{todaySuccess}</p>
              <p style={{ fontSize: 13, color: SLATE, marginTop: 6, fontWeight: 500 }}>Lịch hẹn thành công hôm nay</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: "#fff", borderRadius: 20, border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 28, overflow: "hidden" }}>
          <div style={{ padding: "20px 28px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: CHARCOAL }}>Danh sách lịch hẹn</h2>
                <p style={{ fontSize: 12, color: SLATE, marginTop: 2 }}>{filteredAdminAppts.length} lịch hẹn</p>
              </div>
            </div>
            <div style={{ position: "relative", maxWidth: 440 }}>
              <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: SLATE, pointerEvents: "none" }} />
              <input type="text" placeholder="Tìm theo mã, tên khách hàng, ngày hẹn..." value={adminApptSearch} onChange={(e) => setAdminApptSearch(e.target.value)} style={{ width: "100%", padding: "9px 14px 9px 40px", borderRadius: 10, border: "1.5px solid transparent", backgroundColor: "#F0F0EE", fontSize: 13, color: CHARCOAL, outline: "none", fontFamily: "inherit" }} />
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#FAFAFA" }}>
                  {["Mã lịch hẹn", "Khách hàng", "Thú cưng", "Dịch vụ", "Ngày hẹn", "Giờ hẹn", "Trạng thái", "Thao tác"].map((column) => (
                    <th key={column} style={{ padding: "11px 20px", textAlign: "left", fontSize: 10.5, fontWeight: 700, color: SLATE, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid rgba(0,0,0,0.06)", whiteSpace: "nowrap" }}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAdminAppts.length === 0 && <tr><td colSpan={8} style={{ padding: 48, textAlign: "center", color: SLATE, fontSize: 13 }}>Không tìm thấy lịch hẹn nào</td></tr>}
                {filteredAdminAppts.map((appt, idx) => {
                  const status = STATUS_MAP[appt.status];
                  return (
                    <tr key={appt.id} style={{ borderBottom: idx < filteredAdminAppts.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none", transition: "background 0.1s" }}>
                      <td style={{ padding: "14px 20px" }}><span style={{ fontSize: 11.5, fontFamily: "monospace", fontWeight: 600, color: CHARCOAL, backgroundColor: "#F5F5F5", padding: "3px 8px", borderRadius: 6 }}>{appt.id}</span></td>
                      <td style={{ padding: "14px 20px" }}><div style={{ display: "flex", alignItems: "center", gap: 9 }}><div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: `${MINT}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 11, fontWeight: 700, color: CHARCOAL }}>{(appt.vet ?? "").split(" ").pop()?.[0]}</span></div><span style={{ fontSize: 13, fontWeight: 600, color: CHARCOAL }}>{appt.vet}</span></div></td>
                      <td style={{ padding: "14px 20px", fontSize: 13, color: CHARCOAL }}>{appt.pet}</td>
                      <td style={{ padding: "14px 20px" }}><span style={{ fontSize: 12.5, color: CHARCOAL, maxWidth: 160, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{appt.service}</span></td>
                      <td style={{ padding: "14px 20px", fontSize: 13, color: SLATE, whiteSpace: "nowrap" }}>{fmtDateStr(appt.date)}</td>
                      <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600, color: CHARCOAL }}>{appt.time}</td>
                      <td style={{ padding: "14px 20px" }}><span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, backgroundColor: status.bg, color: status.color, whiteSpace: "nowrap" }}>{status.label}</span></td>
                      <td style={{ padding: "14px 20px" }}><button onClick={() => openAdminApptDetail(appt)} style={{ height: 32, padding: "0 14px", borderRadius: 9, border: `1.5px solid ${MINT}`, backgroundColor: "transparent", cursor: "pointer", fontSize: 12, fontWeight: 600, color: CHARCOAL, display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.15s" }}><ExternalLink size={11} /> Xem chi tiết</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {adminSelAppt && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={(e) => { if (e.target === e.currentTarget && !adminShowConfirm) setAdminSelAppt(null); }}>
          <div style={{ backgroundColor: "#fff", borderRadius: 24, overflow: "hidden", display: "flex", flexDirection: "column", width: "100%", maxWidth: adminApptMode === "edit" ? 640 : 460, maxHeight: "88vh", boxShadow: "0 32px 80px rgba(0,0,0,0.25)", animation: "slideUp 0.3s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)", flexShrink: 0 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: SLATE }}>{adminApptMode === "view" ? "Chi tiết lịch hẹn" : adminApptMode === "edit" ? "Đổi ngày / giờ" : "Hủy lịch hẹn"}</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: CHARCOAL, marginTop: 2 }}>{adminSelAppt.service}</p>
              </div>
              <button onClick={() => setAdminSelAppt(null)} style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "#F5F5F5", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: SLATE }}><X size={14} /></button>
            </div>
            <div style={{ overflowY: "auto", flex: 1, scrollbarWidth: "none", padding: "20px 28px" }}>
              {adminApptMode === "view" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                    {[{ label: "Mã lịch hẹn", value: adminSelAppt.id }, { label: "Khách hàng", value: adminSelAppt.vet }, { label: "Thú cưng", value: adminSelAppt.pet }, { label: "Dịch vụ", value: adminSelAppt.service }, { label: "Ngày hẹn", value: fmtDateStr(adminSelAppt.date) }, { label: "Giờ hẹn", value: adminSelAppt.time }].map((row) => (
                      <div key={row.label} style={{ padding: "12px 16px", borderRadius: 12, backgroundColor: "#F9F9F9", border: "1px solid rgba(0,0,0,0.05)" }}>
                        <p style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: SLATE, marginBottom: 4 }}>{row.label}</p>
                        <p style={{ fontSize: 13.5, fontWeight: 600, color: CHARCOAL }}>{row.value}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 12, marginBottom: 20, backgroundColor: STATUS_MAP[adminSelAppt.status].bg }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: STATUS_MAP[adminSelAppt.status].color }}>Trạng thái: {STATUS_MAP[adminSelAppt.status].label}</span>
                  </div>
                  {adminSelAppt.status === "success" && (
                    <div style={{ display: "flex", gap: 12 }}>
                      <button onClick={() => setAdminApptMode("edit")} style={{ flex: 1, padding: "12px", borderRadius: 12, border: `1.5px solid ${MINT}`, backgroundColor: `${MINT}15`, cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: CHARCOAL, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "inherit" }}><Pencil size={14} /> Đổi ngày / giờ</button>
                      <button onClick={() => setAdminApptMode("cancel")} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid #FFCDD2", backgroundColor: "#FFF5F5", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "#C62828", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "inherit" }}><Trash2 size={14} /> Hủy lịch hẹn</button>
                    </div>
                  )}
                </>
              )}
              {adminApptMode === "edit" && (
                <>
                  <p style={{ fontSize: 13, color: SLATE, marginBottom: 20 }}>Chọn ngày và giờ mới cho lịch hẹn. Thay đổi sẽ được lưu sau khi xác nhận.</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: SLATE, marginBottom: 10 }}>Chọn ngày mới</p>
                      <MiniCalendar calY={adminEditCalYear} calM={adminEditCalMonth} cells={adminApptCalCells} selD={adminEditDay} isPrevDis={isAdminEditPrevDis} onPrev={() => { if (isAdminEditPrevDis) return; adminEditCalMonth === 0 ? (setAdminEditCalYear((year) => year - 1), setAdminEditCalMonth(11)) : setAdminEditCalMonth((month) => month - 1); setAdminEditDay(null); }} onNext={() => { adminEditCalMonth === 11 ? (setAdminEditCalYear((year) => year + 1), setAdminEditCalMonth(0)) : setAdminEditCalMonth((month) => month + 1); setAdminEditDay(null); }} onSelect={(day) => { setAdminEditDay(day); setAdminEditTime(null); }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: SLATE, marginBottom: 10 }}>Chọn giờ mới</p>
                      <TimeSlotGrid selDay={adminEditDay} selTime={adminEditTime} calY={adminEditCalYear} calM={adminEditCalMonth} onSelect={setAdminEditTime} bookedSlots={new Set()} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                    <button onClick={() => setAdminApptMode("view")} style={{ flex: 1, padding: "12px", borderRadius: 12, backgroundColor: "#F5F5F5", border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: CHARCOAL, fontFamily: "inherit" }}>Quay lại</button>
                    <button onClick={() => setAdminShowConfirm(true)} disabled={!adminEditDay || !adminEditTime} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", cursor: adminEditDay && adminEditTime ? "pointer" : "not-allowed", fontSize: 13.5, fontWeight: 700, fontFamily: "inherit", backgroundColor: adminEditDay && adminEditTime ? MINT : "#EBEBEB", color: adminEditDay && adminEditTime ? CHARCOAL : SLATE }}>Lưu thay đổi</button>
                  </div>
                </>
              )}
              {adminApptMode === "cancel" && (
                <>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 12, backgroundColor: "#FFF8F0", border: "1px solid #FDDCB5", marginBottom: 20 }}>
                    <AlertTriangle size={18} style={{ color: "#E67E22", flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: "#B45309" }}>Xác nhận hủy lịch hẹn</p>
                      <p style={{ fontSize: 12, color: "#92400E", marginTop: 3 }}>{adminSelAppt.service} — {fmtDateStr(adminSelAppt.date)} lúc {adminSelAppt.time}</p>
                    </div>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: SLATE, marginBottom: 6 }}>Lý do hủy <span style={{ color: "#EF4444" }}>*</span></label>
                    <textarea value={adminCancelReason} onChange={(e) => { setAdminCancelReason(e.target.value); setAdminCancelError(""); }} rows={3} placeholder="Nhập lý do hủy lịch..." style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${adminCancelError ? "#EF4444" : "transparent"}`, backgroundColor: "#F5F5F5", fontSize: 13.5, color: CHARCOAL, outline: "none", resize: "none", fontFamily: "inherit" }} />
                    {adminCancelError && <p style={{ fontSize: 11, color: "#EF4444", marginTop: 4 }}>⚠ {adminCancelError}</p>}
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => setAdminApptMode("view")} style={{ flex: 1, padding: "12px", borderRadius: 12, backgroundColor: "#F5F5F5", border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: CHARCOAL, fontFamily: "inherit" }}>Quay lại</button>
                    <button onClick={confirmAdminCancel} style={{ flex: 1, padding: "12px", borderRadius: 12, backgroundColor: "#C62828", border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "#fff", fontFamily: "inherit" }}>Xác nhận hủy</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {adminShowConfirm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 210, backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: 20, padding: 28, maxWidth: 360, width: "calc(100% - 48px)", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", animation: "slideUp 0.25s ease" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: `${MINT}25`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}><Check size={22} style={{ color: CHARCOAL }} /></div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: CHARCOAL, marginBottom: 8 }}>Xác nhận thay đổi</h3>
            <p style={{ fontSize: 13, color: SLATE, marginBottom: 24 }}>Đổi lịch thành <strong style={{ color: CHARCOAL }}>{adminEditDay ? fmtDateVi(adminEditCalYear, adminEditCalMonth, adminEditDay) : ""}</strong> lúc <strong style={{ color: CHARCOAL }}>{adminEditTime}</strong>?</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setAdminShowConfirm(false)} style={{ flex: 1, padding: "10px", borderRadius: 12, backgroundColor: "#F5F5F5", border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: CHARCOAL, fontFamily: "inherit" }}>Huỷ bỏ</button>
              <button onClick={saveAdminApptEdit} style={{ flex: 1, padding: "10px", borderRadius: 12, backgroundColor: MINT, border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: CHARCOAL, fontFamily: "inherit" }}>Đồng ý</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
