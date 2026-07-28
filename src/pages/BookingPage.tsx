import { ArrowLeft, Check, Stethoscope, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

import {
  CHARCOAL,
  MINT,
  SLATE,
  VET_NAME,
} from "../data/mockData";
import { useAppointments } from "../contexts/AppointmentsContext";
import { useServices } from "../contexts/ServicesContext";
import { useAuth } from "../contexts/AuthContext";
import { addPet } from "../services/petService";
import { createAppointment } from "../services/appointmentService";
import { getTimeSlots, type TimeSlotGroup } from "../services/timeSlotService";
import {
  EyeToggle,
  LabeledInput,
  MiniCalendar,
  PetGrid,
  TimeSlotGrid,
  fmtDateVi,
  fmtPrice,
  getPetDisplay,
  getPetOpt,
  pad,
} from "../components/qcare/shared";

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { services } = useServices();
  const serviceId = Number(searchParams.get("serviceId") ?? services[0]?.id ?? 0);
  const selectedSvc = services.find((service) => service.id === serviceId);
  const { appointments, addAppointment, refreshAppointments } = useAppointments();
  const { loggedInName } = useAuth();

  const today = new Date();
  const [wizStep, setWizStep] = useState(1);
  const [petType, setPetType] = useState<string | null>(null);
  const [petName, setPetName] = useState("");
  const [customPetType, setCustomPetType] = useState("");
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selDay, setSelDay] = useState<number | null>(null);
  const [selTime, setSelTime] = useState<string | null>(null);
  const [wizAddress, setWizAddress] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [timeSlotGroups, setTimeSlotGroups] = useState<TimeSlotGroup[]>([]);
  const [bookingId, setBookingId] = useState("");
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getTimeSlots()
      .then(({ grouped }) => {
        if (active) {
          setTimeSlotGroups(grouped || []);
        }
      })
      .catch(() => {
        if (active) {
          setTimeSlotGroups([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const firstDow = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calCells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  const isPrevDis = calYear === today.getFullYear() && calMonth === today.getMonth();

  const bookedSlots = useMemo(() => new Set(
    appointments
      // Preserve original behavior: only customer-visible appointments block booking.
      .filter((appointment) => appointment.status !== "cancelled" && appointment.address.trim().length > 0)
      .map((appointment) => `${appointment.date}|${appointment.time}`),
  ), [appointments]);

  const step1Ready = !!petType && petName.trim().length > 0 && (petType !== "other" || customPetType.trim().length > 0);
  const step3Ready = !!selDay && !!selTime && !!selectedSlotId && wizAddress.trim().length > 0;

  if (!selectedSvc) {
    return <Navigate to="/" replace />;
  }

  async function confirmBooking() {
    if (!selectedSvc || !selDay || !selTime || !selectedSlotId) return;

    setIsBooking(true);
    setBookingError(null);

    try {
      const createdPet = await addPet({
        name: petName.trim(),
        petType: petType === "other" ? customPetType.trim() || "other" : petType,
        customType: petType === "other" ? customPetType.trim() || null : null,
      });

      const createdAppointment = await createAppointment({
        serviceId: selectedSvc.id,
        petId: createdPet.id,
        date: `${calYear}-${pad(calMonth + 1)}-${pad(selDay)}`,
        slotId: selectedSlotId,
        address: wizAddress.trim(),
        vetName: loggedInName || VET_NAME,
      });

      addAppointment(createdAppointment);
      await refreshAppointments();
      setBookingId(String(createdAppointment.id));
      toast.success("Đặt lịch thành công");
      setWizStep(4);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Đặt lịch thất bại. Vui lòng thử lại.";
      setBookingError(message);
      toast.error(message);
    } finally {
      setIsBooking(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-8" style={{ backgroundColor: "rgba(0,0,0,0.03)" }}>
      <div className="bg-white rounded-3xl overflow-hidden flex flex-col" style={{ width: "100%", maxWidth: wizStep === 3 ? 720 : 500, maxHeight: "92vh", boxShadow: "0 32px 80px rgba(0,0,0,0.25)", animation: "slideUp 0.3s ease" }}>
        {wizStep < 4 && (
          <div className="flex items-center justify-between px-7 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="flex items-center gap-2.5">
              {wizStep > 1 && <button onClick={() => setWizStep((step) => step - 1)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#F5F5F5" }}><ArrowLeft size={14} style={{ color: CHARCOAL }} /></button>}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: SLATE }}>Bước {wizStep} / 3</p>
                <p className="text-base font-bold" style={{ color: CHARCOAL }}>{["Thú cưng của bạn", "Xác nhận dịch vụ", "Ngày, giờ & địa chỉ"][wizStep - 1]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((step) => <div key={step} className="h-2 rounded-full transition-all duration-300" style={{ width: wizStep === step ? 20 : 8, backgroundColor: step < wizStep ? MINT : step === wizStep ? CHARCOAL : "#E0E0E0" }} />)}
              <Link to="/" className="ml-2 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F5F5F5", color: SLATE }}><X size={13} /></Link>
            </div>
          </div>
        )}

        {wizStep === 1 && (
          <div className="px-7 py-6 overflow-y-auto flex-1" style={{ scrollbarWidth: "none" }}>
            <p className="text-sm mb-4" style={{ color: SLATE }}>Cho chúng tôi biết về thú cưng để chuẩn bị dịch vụ tốt nhất.</p>
            <PetGrid selected={petType} onSelect={(value) => { setPetType(value); if (value !== "other") setCustomPetType(""); }} />
            {petType === "other" && <LabeledInput id="wcustom" label="Loại thú cưng của bạn" value={customPetType} onChange={setCustomPetType} placeholder="Ví dụ: Rùa, Cá, Rắn cảnh..." />}
            <LabeledInput id="wpetname" label="Tên thú cưng" value={petName} onChange={setPetName} placeholder="Ví dụ: Milo, Luna, Bông..." />
            <button onClick={() => setWizStep(2)} disabled={!step1Ready} className="w-full py-3.5 rounded-xl font-bold text-sm transition-all" style={{ backgroundColor: step1Ready ? MINT : "#EBEBEB", color: step1Ready ? CHARCOAL : SLATE, cursor: step1Ready ? "pointer" : "not-allowed" }}>Tiếp theo →</button>
          </div>
        )}

        {wizStep === 2 && (
          <div className="px-7 py-6 overflow-y-auto flex-1" style={{ scrollbarWidth: "none" }}>
            <p className="text-sm mb-4" style={{ color: SLATE }}>Xác nhận dịch vụ bạn muốn đặt cho <strong style={{ color: CHARCOAL }}>{petName}</strong>.</p>
            <div className="rounded-2xl overflow-hidden mb-4" style={{ border: `1.5px solid ${MINT}`, boxShadow: "0 0 0 4px rgba(163,228,215,0.15)" }}>
              <div className="h-32 relative overflow-hidden" style={{ backgroundColor: "#F0F0EE" }}>
                <img src={selectedSvc.image} alt={selectedSvc.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(20,20,20,0.55) 0%,transparent 55%)" }} />
              </div>
              <div className="p-4 flex items-start justify-between gap-3">
                <div><h3 className="font-bold text-base" style={{ color: CHARCOAL }}>{selectedSvc.title}</h3><p className="text-xs mt-0.5" style={{ color: SLATE }}>{selectedSvc.subtitle}</p></div>
                <div className="text-right"><p className="text-lg font-extrabold" style={{ color: CHARCOAL }}>{fmtPrice(selectedSvc.price)}</p><p className="text-xs" style={{ color: SLATE }}>{selectedSvc.duration}</p></div>
              </div>
            </div>
            <div className="flex gap-3 mb-4">
              <div className="flex-1 flex items-center gap-3 p-3.5 rounded-xl" style={{ backgroundColor: "#F5F5F5" }}>
                <span className="text-2xl">{getPetOpt(petType ?? "other").emoji}</span>
                <div><p className="text-[11px]" style={{ color: SLATE }}>Thú cưng</p><p className="text-sm font-bold" style={{ color: CHARCOAL }}>{petName} · {getPetDisplay(petType ?? "other", customPetType)}</p></div>
              </div>
              <div className="flex-1 flex items-center gap-3 p-3.5 rounded-xl" style={{ backgroundColor: "#F5F5F5" }}>
                <Stethoscope size={20} style={{ color: CHARCOAL, flexShrink: 0 }} />
                <div><p className="text-[11px]" style={{ color: SLATE }}>Bác sĩ phụ trách</p><p className="text-sm font-bold" style={{ color: CHARCOAL }}>{VET_NAME}</p></div>
              </div>
            </div>
            <button onClick={() => setWizStep(3)} className="w-full py-3.5 rounded-xl font-bold text-sm transition-all" style={{ backgroundColor: MINT, color: CHARCOAL }}>Chọn ngày, giờ & địa chỉ →</button>
          </div>
        )}

        {wizStep === 3 && (
          <div className="px-7 py-6 overflow-y-auto flex-1" style={{ scrollbarWidth: "none" }}>
            <p className="text-sm mb-5" style={{ color: SLATE }}>Chọn thời gian và nhập địa chỉ để chúng tôi đến tận nơi phục vụ.</p>
            <div className="grid grid-cols-2 gap-6 mb-5">
              <MiniCalendar
                calY={calYear}
                calM={calMonth}
                cells={calCells}
                selD={selDay}
                isPrevDis={isPrevDis}
                onPrev={() => {
                  if (isPrevDis) return;
                  calMonth === 0 ? (setCalYear((year) => year - 1), setCalMonth(11)) : setCalMonth((month) => month - 1);
                  setSelDay(null);
                  setSelTime(null);
                  setSelectedSlotId(null);
                }}
                onNext={() => {
                  calMonth === 11 ? (setCalYear((year) => year + 1), setCalMonth(0)) : setCalMonth((month) => month + 1);
                  setSelDay(null);
                  setSelTime(null);
                  setSelectedSlotId(null);
                }}
                onSelect={(day) => { setSelDay(day); setSelTime(null); setSelectedSlotId(null); }}
              />
              <TimeSlotGrid
                selDay={selDay}
                selTime={selTime}
                calY={calYear}
                calM={calMonth}
                onSelect={(time) => {
                  setSelTime(time);
                }}
                onSelectSlot={(slot) => setSelectedSlotId(slot.id)}
                bookedSlots={bookedSlots}
                timeSlotGroups={timeSlotGroups}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: SLATE, marginBottom: 6 }}>Địa chỉ khám tại nhà <span style={{ color: "#EF4444" }}>*</span></label>
              <input
                type="text"
                value={wizAddress}
                onChange={(e) => setWizAddress(e.target.value)}
                placeholder="Số nhà, tên đường, phường, quận, Đà Nẵng"
                style={{
                  backgroundColor: focusedInput === "waddr" ? "#fff" : "#F5F5F5",
                  border: `1.5px solid ${focusedInput === "waddr" ? MINT : "transparent"}`,
                  color: CHARCOAL,
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 12,
                  fontSize: 13.5,
                  outline: "none",
                }}
                onFocus={() => setFocusedInput("waddr")}
                onBlur={() => setFocusedInput(null)}
              />
              {!wizAddress.trim() && selDay && selTime && <p style={{ fontSize: 11, color: "#EF4444", marginTop: 4 }}>⚠ Vui lòng nhập địa chỉ để tiếp tục</p>}
            </div>
            {bookingError && <p className="text-sm mb-3" style={{ color: "#EF4444" }}>{bookingError}</p>}
            <button onClick={confirmBooking} disabled={!step3Ready || isBooking} className="w-full py-3.5 rounded-xl font-bold text-sm transition-all" style={{ backgroundColor: step3Ready && !isBooking ? MINT : "#EBEBEB", color: step3Ready && !isBooking ? CHARCOAL : SLATE, cursor: step3Ready && !isBooking ? "pointer" : "not-allowed" }}>{isBooking ? "Đang xử lý..." : "Xác nhận đặt lịch ✓"}</button>
          </div>
        )}

        {wizStep === 4 && (
          <div className="flex flex-col items-center text-center px-8 py-10 overflow-y-auto flex-1" style={{ scrollbarWidth: "none" }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: `${MINT}20`, border: `2px solid ${MINT}` }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: MINT }}><Check size={28} strokeWidth={3} style={{ color: CHARCOAL }} /></div>
            </div>
            <h2 className="text-2xl font-bold mb-1.5" style={{ color: CHARCOAL, letterSpacing: "-0.02em" }}>Đặt lịch thành công!</h2>
            <p className="text-sm mb-5" style={{ color: SLATE }}>Cảm ơn bạn đã tin tưởng Q Care.<br />Bác sĩ <strong>{VET_NAME}</strong> sẽ liên hệ xác nhận sớm nhất.</p>
            <div className="px-6 py-3 rounded-xl mb-5" style={{ backgroundColor: "#F5F5F5", border: "1.5px solid #E0E0E0" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: SLATE }}>Mã đặt lịch</p>
              <p className="text-[22px] font-black tracking-[0.08em]" style={{ color: CHARCOAL }}>{bookingId}</p>
            </div>
            <div className="w-full rounded-2xl p-4 mb-5 text-left" style={{ backgroundColor: "#F9F9F9", border: "1px solid rgba(0,0,0,0.06)" }}>
              {[["Dịch vụ", selectedSvc.title], ["Thú cưng", `${petName} · ${getPetDisplay(petType ?? "other", customPetType)}`], ["Bác sĩ", `Bác sĩ: ${VET_NAME}`], ["Ngày hẹn", selDay ? fmtDateVi(calYear, calMonth, selDay) : ""], ["Giờ hẹn", selTime ?? ""], ["Địa chỉ", wizAddress], ["Tổng tiền", fmtPrice(selectedSvc.price)]].map(([label, value]) => (
                <div key={label} className="flex justify-between items-start py-1.5">
                  <span className="text-xs flex-shrink-0" style={{ color: SLATE }}>{label}</span>
                  <span className="text-sm font-semibold text-right ml-3" style={{ color: CHARCOAL }}>{value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={() => navigate("/")} className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all" style={{ backgroundColor: "#F5F5F5", color: CHARCOAL }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#EBEBEB")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F5F5F5")}>Về trang chủ</button>
              <button onClick={() => navigate("/my-appointments")} className="flex-1 py-3 rounded-xl font-bold text-sm transition-all" style={{ backgroundColor: MINT, color: CHARCOAL }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#7DD8C6")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = MINT)}>Xem lịch hẹn</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
