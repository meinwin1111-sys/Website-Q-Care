import { AlertTriangle, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

import { CHARCOAL, MINT, SLATE } from "../../data/mockData";
import { useAuth } from "../../contexts/AuthContext";
import { EyeToggle, LabeledInput, QCareCross, isValidEmail, isValidPhone, validatePassword } from "./shared";

export default function AuthCard({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginEmailErr, setLoginEmailErr] = useState("");
  const [loginPassErr, setLoginPassErr] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);

  const passErr = validatePassword(regPass);
  const isRegFormValid = useMemo(() => !!(
    regName.trim() &&
    isValidEmail(regEmail) &&
    isValidPhone(regPhone) &&
    passErr === null &&
    regPass === regConfirm
  ), [passErr, regConfirm, regEmail, regName, regPass, regPhone]);

  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";

  async function handleLoginSubmit(event: FormEvent) {
    event.preventDefault();
    setLoginError("");
    setLoginEmailErr("");
    setLoginPassErr("");

    let valid = true;
    if (!loginEmail.trim()) {
      setLoginEmailErr("Vui lòng nhập email");
      valid = false;
    } else if (!isValidEmail(loginEmail)) {
      setLoginEmailErr("Email không đúng định dạng");
      valid = false;
    }

    if (!loginPass.trim()) {
      setLoginPassErr("Vui lòng nhập mật khẩu");
      valid = false;
    }

    if (!valid) return;

    try {
      setIsSubmitting(true);
      const user = await login(loginEmail.trim(), loginPass);
      toast.success("Đăng nhập thành công");
      const nextPath = user.role === "admin" ? "/admin" : (redirectTo && redirectTo !== "/admin" ? redirectTo : "/");
      navigate(nextPath, { replace: true });
    } catch (err: any) {
      const message = err?.response?.data?.message || "Email hoặc mật khẩu không đúng.";
      setLoginError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegisterSubmit(event: FormEvent) {
    event.preventDefault();
    const errors: Record<string, string> = {};

    if (!regName.trim()) errors.name = "Vui lòng nhập họ và tên";
    if (!regEmail.trim()) errors.email = "Vui lòng nhập email";
    else if (!isValidEmail(regEmail)) errors.email = "Email không đúng định dạng";
    if (!regPhone.trim()) errors.phone = "Vui lòng nhập số điện thoại";
    else if (!isValidPhone(regPhone)) errors.phone = "Số điện thoại phải gồm đúng 10 chữ số";
    if (passErr) errors.pass = passErr;
    else if (regPass !== regConfirm) errors.confirm = "Mật khẩu xác nhận không khớp";

    if (Object.keys(errors).length > 0) {
      setRegErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await register(regName.trim(), regEmail.trim(), regPhone.trim(), regPass);
      toast.success("Đăng ký thành công");
      const nextPath = user.role === "admin" ? "/admin" : (redirectTo && redirectTo !== "/admin" ? redirectTo : "/");
      navigate(nextPath, { replace: true });
    } catch (err: any) {
      const message = err?.response?.data?.message || "Đăng ký thất bại.";
      setRegErrors({ email: message });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-10" style={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden" style={{ backgroundColor: "#fff", boxShadow: "0 32px 80px rgba(0,0,0,0.15)", animation: "slideUp 0.3s ease" }}>
        <div style={{ backgroundColor: CHARCOAL }} className="px-8 pt-7 pb-5 relative">
          <button onClick={() => navigate("/")} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#fff" }}><X size={14} /></button>
          <div className="flex items-center gap-2 mb-4">
            <QCareCross size={32} />
            <span className="font-bold text-xl" style={{ color: "#fff", letterSpacing: "-0.03em" }}>Q Care</span>
          </div>
          <div className="flex rounded-xl overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
            <Link to="/login" className="flex-1 py-2 text-sm font-semibold text-center transition-all" style={{ backgroundColor: mode === "login" ? MINT : "transparent", color: mode === "login" ? CHARCOAL : "rgba(255,255,255,0.6)", borderRadius: 10 }}>Đăng nhập</Link>
            <Link to="/register" className="flex-1 py-2 text-sm font-semibold text-center transition-all" style={{ backgroundColor: mode === "register" ? MINT : "transparent", color: mode === "register" ? CHARCOAL : "rgba(255,255,255,0.6)", borderRadius: 10 }}>Đăng ký</Link>
          </div>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLoginSubmit} className="px-7 py-6">
            <LabeledInput id="lemail" label="Email" type="email" value={loginEmail} onChange={(value) => { setLoginEmail(value); setLoginEmailErr(""); setLoginError(""); }} placeholder="minhtuan@email.com" error={loginEmailErr} />
            <LabeledInput id="lpass" label="Mật khẩu" type={showLoginPass ? "text" : "password"} value={loginPass} onChange={(value) => { setLoginPass(value); setLoginPassErr(""); setLoginError(""); }} placeholder="••••••••" rightElement={<EyeToggle show={showLoginPass} onToggle={() => setShowLoginPass((show) => !show)} />} error={loginPassErr} />
            {loginError && (
              <div className="flex items-center gap-2 p-3 rounded-xl mb-3" style={{ backgroundColor: "#FFF5F5", border: "1px solid #FFCDD2" }}>
                <AlertTriangle size={13} style={{ color: "#C62828", flexShrink: 0 }} />
                <p className="text-xs font-medium" style={{ color: "#C62828" }}>{loginError}</p>
              </div>
            )}
            <button type="submit" disabled={isSubmitting} className="w-full py-3.5 rounded-xl font-bold text-sm mt-1 transition-all" style={{ backgroundColor: isSubmitting ? "#B9EDE4" : MINT, color: CHARCOAL, cursor: isSubmitting ? "wait" : "pointer" }} onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = "#7DD8C6"; }} onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = MINT; }}>{isSubmitting ? "Đang xử lý..." : "Đăng nhập"}</button>
            <p className="text-center text-[12px] mt-4" style={{ color: SLATE }}>
              Chưa có tài khoản?{" "}
              <Link to="/register" className="font-semibold" style={{ color: CHARCOAL, textDecoration: "underline" }}>Đăng ký tài khoản</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="px-7 py-6 overflow-y-auto" style={{ maxHeight: "65vh", scrollbarWidth: "none" }}>
            <LabeledInput id="rname" label="Họ và tên" value={regName} onChange={setRegName} placeholder="Nguyễn Minh Tuấn" error={regErrors.name} />
            <LabeledInput id="remail" label="Email" type="email" value={regEmail} onChange={setRegEmail} placeholder="minhtuan@email.com" error={regErrors.email} />
            <LabeledInput id="rphone" label="Số điện thoại" type="tel" value={regPhone} onChange={setRegPhone} placeholder="09xxxxxxxx" error={regErrors.phone} hint="Gồm đúng 10 chữ số" />
            <LabeledInput id="rpass" label="Mật khẩu" type={showRegPass ? "text" : "password"} value={regPass} onChange={setRegPass} placeholder="••••••••" error={regErrors.pass} hint="Tối thiểu 6 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt" rightElement={<EyeToggle show={showRegPass} onToggle={() => setShowRegPass((show) => !show)} />} />
            <LabeledInput id="rconfirm" label="Xác nhận mật khẩu" type={showRegConfirm ? "text" : "password"} value={regConfirm} onChange={setRegConfirm} placeholder="••••••••" error={regErrors.confirm} rightElement={<EyeToggle show={showRegConfirm} onToggle={() => setShowRegConfirm((show) => !show)} />} />
            <button type="submit" disabled={!isRegFormValid || isSubmitting} className="w-full py-3.5 rounded-xl font-bold text-sm transition-all mt-1" style={{ backgroundColor: isRegFormValid && !isSubmitting ? MINT : "#EBEBEB", color: isRegFormValid && !isSubmitting ? CHARCOAL : SLATE, cursor: isRegFormValid && !isSubmitting ? "pointer" : "not-allowed" }} onMouseEnter={(e) => { if (isRegFormValid && !isSubmitting) e.currentTarget.style.backgroundColor = "#7DD8C6"; }} onMouseLeave={(e) => { if (isRegFormValid && !isSubmitting) e.currentTarget.style.backgroundColor = MINT; }}>{isSubmitting ? "Đang xử lý..." : "Tạo tài khoản"}</button>
            <p className="text-center text-[12px] mt-4" style={{ color: SLATE }}>
              Đã có tài khoản?{" "}
              <Link to="/login" className="font-semibold" style={{ color: CHARCOAL, textDecoration: "underline" }}>Đăng nhập ngay</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
