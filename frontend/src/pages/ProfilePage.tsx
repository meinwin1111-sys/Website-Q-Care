import { ArrowLeft, Check, Eye, EyeOff, Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { CHARCOAL, MINT, SLATE } from "../data/mockData";
import { useAuth } from "../contexts/AuthContext";
import { changePassword } from "../services/authService";
import { getUserInitials, isValidEmail, validatePassword } from "../components/qcare/shared";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { loggedInEmail, loggedInName, profilePhone, updateProfile } = useAuth();

  const [profileEditing, setProfileEditing] = useState(false);
  const [profileName, setProfileName] = useState(loggedInName);
  const [profileEmail, setProfileEmail] = useState(loggedInEmail);
  const [phone, setPhone] = useState(profilePhone);
  const [profileNameErr, setProfileNameErr] = useState("");
  const [profileEmailErr, setProfileEmailErr] = useState("");
  const [profilePhoneErr, setProfilePhoneErr] = useState("");
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [pwdCurrent, setPwdCurrent] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [showPwdCurrent, setShowPwdCurrent] = useState(false);
  const [showPwdNew, setShowPwdNew] = useState(false);
  const [showPwdConfirm, setShowPwdConfirm] = useState(false);
  const [pwdCurrentErr, setPwdCurrentErr] = useState("");
  const [pwdNewErr, setPwdNewErr] = useState("");
  const [pwdConfirmErr, setPwdConfirmErr] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const handleChangePassword = async () => {
    setPwdCurrentErr("");
    setPwdNewErr("");
    setPwdConfirmErr("");

    let valid = true;
    if (!pwdCurrent) {
      setPwdCurrentErr("Vui lòng nhập mật khẩu hiện tại");
      valid = false;
    }
    const newError = validatePassword(pwdNew);
    if (newError) {
      setPwdNewErr(newError);
      valid = false;
    }
    if (pwdNew !== pwdConfirm) {
      setPwdConfirmErr("Mật khẩu xác nhận không khớp");
      valid = false;
    }
    if (!valid) return;

    try {
      await changePassword(pwdCurrent, pwdNew);
      setPwdSuccess(true);
      setPwdCurrent("");
      setPwdNew("");
      setPwdConfirm("");
      setTimeout(() => {
        setShowChangePwd(false);
        setPwdSuccess(false);
      }, 2000);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (message === "Mật khẩu hiện tại không đúng.") {
        setPwdCurrentErr(message);
      } else if (typeof message === "string") {
        setPwdNewErr(message);
      } else {
        setPwdNewErr("Không thể đổi mật khẩu. Vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none", backgroundColor: "#F7F7F5" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px 80px" }}>
        <button onClick={() => navigate("/")} className="flex items-center gap-2 mb-6 text-sm font-semibold transition-all" style={{ color: SLATE, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }} onMouseEnter={(e) => (e.currentTarget.style.color = CHARCOAL)} onMouseLeave={(e) => (e.currentTarget.style.color = SLATE)}><ArrowLeft size={15} /> Quay lại</button>

        <div className="flex items-center gap-4 mb-8">
          <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: CHARCOAL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: MINT }}>{getUserInitials(profileName)}</span>
          </div>
          <div>
            <p style={{ fontSize: 20, fontWeight: 800, color: CHARCOAL, letterSpacing: "-0.02em" }}>{profileName}</p>
            <p style={{ fontSize: 12.5, color: SLATE, marginTop: 2 }}>Khách hàng · Q Care</p>
          </div>
        </div>

        <div style={{ backgroundColor: "#fff", borderRadius: 20, border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "18px 24px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: CHARCOAL, textTransform: "uppercase", letterSpacing: "0.08em" }}>Thông tin cá nhân</p>
          </div>
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { label: "Họ và tên", value: profileName, setter: setProfileName, error: profileNameErr, setError: setProfileNameErr, type: "text" },
              { label: "Email", value: profileEmail, setter: setProfileEmail, error: profileEmailErr, setError: setProfileEmailErr, type: "email" },
              { label: "Số điện thoại", value: phone, setter: (value: string) => setPhone(value.replace(/\D/g, "").slice(0, 10)), error: profilePhoneErr, setError: setProfilePhoneErr, type: "tel" },
            ].map((field) => (
              <div key={field.label}>
                <label style={{ display: "block", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: SLATE, marginBottom: 6 }}>{field.label}</label>
                {profileEditing ? (
                  <>
                    <input type={field.type} value={field.value} onChange={(e) => { field.setter(e.target.value); field.setError(""); }} style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: `1.5px solid ${field.error ? "#EF4444" : "transparent"}`, backgroundColor: "#F5F5F5", fontSize: 14, color: CHARCOAL, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                    {field.error && <p style={{ fontSize: 11, color: "#EF4444", marginTop: 4 }}>⚠ {field.error}</p>}
                  </>
                ) : (
                  <p style={{ fontSize: 14.5, fontWeight: 600, color: CHARCOAL }}>{field.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: "#fff", borderRadius: 20, border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "18px 24px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: CHARCOAL, textTransform: "uppercase", letterSpacing: "0.08em" }}>Thông tin tài khoản</p>
          </div>
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <label style={{ display: "block", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: SLATE, marginBottom: 6 }}>Mật khẩu</label>
                <p style={{ fontSize: 14.5, fontWeight: 600, color: CHARCOAL, letterSpacing: "0.2em" }}>••••••••</p>
              </div>
              <button onClick={() => { setShowChangePwd((value) => !value); setPwdCurrent(""); setPwdNew(""); setPwdConfirm(""); setPwdCurrentErr(""); setPwdNewErr(""); setPwdConfirmErr(""); setPwdSuccess(false); }} style={{ height: 36, padding: "0 16px", borderRadius: 12, border: `1.5px solid ${MINT}`, backgroundColor: "transparent", cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: CHARCOAL, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}><Pencil size={12} /> Đổi mật khẩu</button>
            </div>

            {showChangePwd && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: 14 }}>
                {pwdSuccess && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, backgroundColor: "#E8F8F5", border: "1px solid #A3E4D7" }}><Check size={14} style={{ color: "#0D6E5A", flexShrink: 0 }} /><p style={{ fontSize: 12.5, fontWeight: 600, color: "#0D6E5A" }}>Đổi mật khẩu thành công!</p></div>}
                {[{ label: "Mật khẩu hiện tại", value: pwdCurrent, setter: setPwdCurrent, show: showPwdCurrent, toggle: () => setShowPwdCurrent((value) => !value), error: pwdCurrentErr }, { label: "Mật khẩu mới", value: pwdNew, setter: setPwdNew, show: showPwdNew, toggle: () => setShowPwdNew((value) => !value), error: pwdNewErr }, { label: "Xác nhận mật khẩu mới", value: pwdConfirm, setter: setPwdConfirm, show: showPwdConfirm, toggle: () => setShowPwdConfirm((value) => !value), error: pwdConfirmErr }].map((field) => (
                  <div key={field.label}>
                    <label style={{ display: "block", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: SLATE, marginBottom: 6 }}>{field.label}</label>
                    <div style={{ position: "relative" }}>
                      <input type={field.show ? "text" : "password"} value={field.value} onChange={(e) => { field.setter(e.target.value); if (field.label === "Mật khẩu hiện tại") setPwdCurrentErr(""); if (field.label === "Mật khẩu mới") setPwdNewErr(""); if (field.label === "Xác nhận mật khẩu mới") setPwdConfirmErr(""); }} style={{ width: "100%", padding: "10px 42px 10px 14px", borderRadius: 12, border: `1.5px solid ${field.error ? "#EF4444" : "transparent"}`, backgroundColor: "#F5F5F5", fontSize: 14, color: CHARCOAL, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                      <button type="button" onClick={field.toggle} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: SLATE, padding: 0, display: "flex" }}>{field.show ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                    </div>
                    {field.error && <p style={{ fontSize: 11, color: "#EF4444", marginTop: 4 }}>⚠ {field.error}</p>}
                  </div>
                ))}
                <button onClick={handleChangePassword} style={{ width: "100%", padding: "11px", borderRadius: 12, backgroundColor: MINT, border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: CHARCOAL, fontFamily: "inherit" }}>Xác nhận đổi mật khẩu</button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {!profileEditing ? (
            <button onClick={() => { setProfileEditing(true); setProfileSaved(false); }} style={{ flex: 1, padding: "13px", borderRadius: 14, border: `1.5px solid ${MINT}`, backgroundColor: "transparent", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: CHARCOAL, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Pencil size={14} /> Chỉnh sửa thông tin</button>
          ) : (
            <>
              <button onClick={() => { setProfileEditing(false); setProfileName(loggedInName); setProfileEmail(loggedInEmail); setPhone(profilePhone); }} style={{ flex: 1, padding: "13px", borderRadius: 14, backgroundColor: "#F0F0EE", border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: SLATE, fontFamily: "inherit" }}>Hủy</button>
              <button onClick={() => {
                let valid = true;
                if (!profileName.trim()) { setProfileNameErr("Vui lòng nhập họ và tên"); valid = false; }
                if (!isValidEmail(profileEmail)) { setProfileEmailErr("Email không đúng định dạng"); valid = false; }
                if (!/^\d{10}$/.test(phone)) { setProfilePhoneErr("Số điện thoại phải đúng 10 chữ số"); valid = false; }
                if (!valid) return;
                updateProfile({ name: profileName, email: profileEmail, phone });
                setProfileEditing(false);
                setProfileSaved(true);
                setTimeout(() => setProfileSaved(false), 2500);
              }} style={{ flex: 1, padding: "13px", borderRadius: 14, backgroundColor: MINT, border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: CHARCOAL, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Check size={14} /> Lưu thay đổi</button>
            </>
          )}
        </div>

        {profileSaved && <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 12, backgroundColor: "#E8F8F5", border: "1px solid #A3E4D7" }}><Check size={14} style={{ color: "#0D6E5A", flexShrink: 0 }} /><p style={{ fontSize: 12.5, fontWeight: 600, color: "#0D6E5A" }}>Thông tin đã được lưu thành công!</p></div>}
      </div>
    </div>
  );
}
