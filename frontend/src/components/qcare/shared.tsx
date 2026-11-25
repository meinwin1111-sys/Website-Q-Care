import { useState, type CSSProperties, type ReactNode } from "react";
import { Check, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";

import {
  CHARCOAL,
  MINT,
  PET_OPTIONS,
  TIME_SLOTS,
  VI_DAYS,
  VI_MONTHS,
} from "../../data/mockData";

export function fmtPrice(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function isTimeSlotPast(date: string, time: string, now: Date) {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const slotDate = new Date(year, month - 1, day, hours, minutes);

  return slotDate.getTime() <= now.getTime() + 15 * 60 * 1000;
}

export function fmtDateVi(y: number, m: number, d: number) {
  return `${pad(d)}/${pad(m + 1)}/${y}`;
}

export function fmtDateStr(s: string) {
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}

export function genBid() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "QC-";
  for (let i = 0; i < 6; i += 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function getPetOpt(v: string) {
  return PET_OPTIONS.find((p) => p.value === v) ?? PET_OPTIONS[5];
}

export function getPetDisplay(type: string, customType: string) {
  return type === "other" ? (customType || "Khác") : getPetOpt(type).label;
}

function getTodayAtMidnight() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function isDayDisabled(y: number, m: number, d: number) {
  return new Date(y, m, d) < getTodayAtMidnight();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone: string) {
  return /^\d{10}$/.test(phone.trim());
}

export function validatePassword(password: string): string | null {
  if (password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
  if (!/[A-Z]/.test(password)) return "Mật khẩu phải có ít nhất 1 chữ hoa";
  if (!/[a-z]/.test(password)) return "Mật khẩu phải có ít nhất 1 chữ thường";
  if (!/[0-9]/.test(password)) return "Mật khẩu phải có ít nhất 1 chữ số";
  if (!/[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?]/.test(password)) {
    return "Mật khẩu phải có ít nhất 1 ký tự đặc biệt";
  }
  return null;
}

export function getUserInitials(name: string) {
  return name.trim().split(/\s+/).map((word) => word[0]?.toUpperCase() || "").slice(-2).join("") || "?";
}

export function getUserShortName(name: string) {
  return name.trim().split(/\s+/).slice(-2).join(" ") || "Người dùng";
}

export function inputStyle(focused: boolean, hasError?: boolean): CSSProperties {
  return {
    backgroundColor: focused ? "#fff" : "#F5F5F5",
    border: `1.5px solid ${hasError ? "#EF4444" : focused ? MINT : "transparent"}`,
    color: CHARCOAL,
    width: "100%",
    padding: "11px 14px",
    borderRadius: 12,
    fontSize: 13.5,
    outline: "none",
    transition: "all 0.15s",
    fontFamily: "inherit",
  };
}

export function QCareCross({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <rect width="56" height="56" rx="14" fill={CHARCOAL} />
      <rect x="22" y="10" width="12" height="36" rx="3.5" fill={MINT} />
      <rect x="10" y="22" width="36" height="12" rx="3.5" fill={MINT} />
      <ellipse cx="14.5" cy="11.5" rx="3" ry="4" fill={CHARCOAL} />
      <ellipse cx="20" cy="10.5" rx="2.5" ry="3.5" fill={CHARCOAL} />
      <polygon points="36,8 40.5,13.5 31.5,13.5" fill={CHARCOAL} />
      <polygon points="43,8 48,13.5 38,13.5" fill={CHARCOAL} />
    </svg>
  );
}

export function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#7A7A7A", display: "flex", alignItems: "center" }}
    >
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );
}

export function LabeledInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  hint,
  rightElement,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  rightElement?: ReactNode;
}) {
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const focused = focusedInput === id;

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#7A7A7A", marginBottom: 6 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...inputStyle(focused, !!error), paddingRight: rightElement ? 44 : 14 }}
          onFocus={() => setFocusedInput(id)}
          onBlur={() => setFocusedInput(null)}
        />
        {rightElement && (
          <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
            {rightElement}
          </div>
        )}
      </div>
      {error && <p style={{ fontSize: 11, color: "#EF4444", marginTop: 4 }}>⚠ {error}</p>}
      {hint && !error && <p style={{ fontSize: 11, color: "#7A7A7A", marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

export function PetGrid({ selected, onSelect }: { selected: string | null; onSelect: (value: string) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
      {PET_OPTIONS.map((opt) => {
        const active = selected === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              padding: "14px 8px",
              borderRadius: 16,
              border: `2px solid ${active ? MINT : "#EBEBEB"}`,
              backgroundColor: active ? `${MINT}12` : "#FAFAFA",
              boxShadow: active ? "0 0 0 4px rgba(163,228,215,0.2)" : "none",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: 28 }}>{opt.emoji}</span>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: CHARCOAL, textAlign: "center" }}>{opt.label}</span>
            {active && (
              <div style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: MINT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Check size={9} strokeWidth={3} style={{ color: CHARCOAL }} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function MiniCalendar({
  calY,
  calM,
  cells,
  selD,
  isPrevDis,
  onPrev,
  onNext,
  onSelect,
}: {
  calY: number;
  calM: number;
  cells: (number | null)[];
  selD: number | null;
  isPrevDis: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (day: number) => void;
}) {
  const today = getTodayAtMidnight();

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button onClick={onPrev} disabled={isPrevDis} style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#F5F5F5", border: "none", cursor: isPrevDis ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: isPrevDis ? 0.4 : 1 }}>
          <ChevronLeft size={13} style={{ color: CHARCOAL }} />
        </button>
        <span style={{ fontSize: 13, fontWeight: 700, color: CHARCOAL }}>{VI_MONTHS[calM]} {calY}</span>
        <button onClick={onNext} style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#F5F5F5", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ChevronRight size={13} style={{ color: CHARCOAL }} />
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 2 }}>
        {VI_DAYS.map((day) => (
          <div key={day} style={{ textAlign: "center", fontSize: 9.5, fontWeight: 700, color: "#7A7A7A", padding: "3px 0" }}>{day}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const currentDate = new Date(calY, calM, day);
          const disabled = currentDate < today;
          const isSelected = selD === day;
          const isToday = !disabled && currentDate.getTime() === today.getTime();
          return (
            <button
              key={idx}
              disabled={disabled}
              onClick={() => !disabled && onSelect(day)}
              style={{
                aspectRatio: "1",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 7,
                fontSize: 12,
                fontWeight: isSelected ? 700 : isToday ? 700 : 500,
                border: isSelected ? "none" : isToday ? `1px solid ${MINT}` : "none",
                backgroundColor: isSelected ? CHARCOAL : isToday ? `${MINT}24` : "transparent",
                color: isSelected ? "#fff" : disabled ? "#CCC" : CHARCOAL,
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "all 0.1s",
                boxShadow: isToday && !isSelected ? `inset 0 0 0 1px ${MINT}` : "none",
              }}
              onMouseEnter={(e) => {
                if (!disabled && !isSelected) e.currentTarget.style.backgroundColor = `${MINT}35`;
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.backgroundColor = isToday ? `${MINT}24` : "transparent";
              }}
            >
              <span>{day}</span>
              {isToday && !isSelected && <span style={{ position: "absolute", bottom: 3, width: 4, height: 4, borderRadius: "50%", backgroundColor: MINT }} />}
            </button>
          );
        })}
      </div>
      {selD && <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 10, backgroundColor: `${MINT}20`, border: `1px solid ${MINT}55`, textAlign: "center", fontSize: 12, fontWeight: 600, color: CHARCOAL }}>{fmtDateVi(calY, calM, selD)}</div>}
    </div>
  );
}

export function TimeSlotGrid({
  selDay,
  selTime,
  calY,
  calM,
  onSelect,
  bookedSlots,
  timeSlotGroups,
  onSelectSlot,
  now,
}: {
  selDay: number | null;
  selTime: string | null;
  calY: number;
  calM: number;
  onSelect: (time: string) => void;
  bookedSlots: Set<string>;
  timeSlotGroups?: Array<{ label: string; slots: Array<{ id: number; time: string }> }>;
  onSelectSlot?: (slot: { id: number; time: string }) => void;
  now?: Date;
}) {
  const currentNow = now instanceof Date && !Number.isNaN(now.getTime()) ? now : new Date();
  if (!selDay) return <p style={{ fontSize: 12.5, color: "#CCC", textAlign: "center", padding: "28px 0" }}>Chọn ngày trước</p>;

  const groups = timeSlotGroups ?? TIME_SLOTS.map((group) => ({
    label: group.label,
    slots: group.times.map((time) => ({ id: 0, time })),
  }));
  const dateStr = `${calY}-${pad(calM + 1)}-${pad(selDay)}`;
  const isToday = dateStr === `${currentNow.getFullYear()}-${pad(currentNow.getMonth() + 1)}-${pad(currentNow.getDate())}`;
  const slots = groups.flatMap((group) => group.slots);

  if (isToday && slots.length > 0 && slots.every((slot) => isTimeSlotPast(dateStr, slot.time, currentNow))) {
    return <p style={{ fontSize: 12.5, color: "#7A7A7A", textAlign: "center", padding: "28px 8px" }}>Không còn khung giờ phù hợp hôm nay. Vui lòng chọn ngày tiếp theo.</p>;
  }

  return (
    <div style={{ overflowY: "auto", maxHeight: 250, scrollbarWidth: "none" }}>
      {groups.map((group) => (
        <div key={group.label} style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#7A7A7A", marginBottom: 7 }}>{group.label}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5 }}>
            {group.slots.map((slot) => {
              const time = slot.time;
              const booked = bookedSlots.has(`${dateStr}|${time}`);
              const isPast = isTimeSlotPast(dateStr, time, currentNow);
              const disabled = booked || isPast;
              const isSelected = selTime === time && !disabled;
              return (
                <button
                  key={`${group.label}-${time}`}
                  disabled={disabled}
                  title={booked ? "Khung giờ này đã được đặt" : isPast ? "Khung giờ này đã qua hoặc không đủ thời gian chuẩn bị" : ""}
                  onClick={() => {
                    if (!disabled) {
                      onSelect(time);
                      onSelectSlot?.(slot);
                    }
                  }}
                  style={{
                    padding: "7px 3px",
                    borderRadius: 7,
                    fontSize: 11.5,
                    fontWeight: 600,
                    border: `1.5px solid ${isSelected ? CHARCOAL : "transparent"}`,
                    backgroundColor: isSelected ? CHARCOAL : disabled ? "#F0F0F0" : "#F5F5F5",
                    color: isSelected ? "#fff" : disabled ? "#BBBBBB" : CHARCOAL,
                    cursor: disabled ? "not-allowed" : "pointer",
                    textDecoration: booked ? "line-through" : "none",
                    transition: "all 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    if (!disabled && !isSelected) e.currentTarget.style.backgroundColor = `${MINT}35`;
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && !disabled) e.currentTarget.style.backgroundColor = "#F5F5F5";
                  }}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
