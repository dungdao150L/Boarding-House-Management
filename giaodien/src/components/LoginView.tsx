import React, { useState } from "react";
import { Building2, Eye, EyeOff, KeyRound, LogIn, UserPlus } from "lucide-react";
import { RegisterPayload } from "../api/client";

interface LoginViewProps {
  error?: string;
  loading?: boolean;
  onLogin: (username: string, password: string) => Promise<void> | void;
  onRegister: (payload: RegisterPayload) => Promise<void> | void;
}

type AuthMode = "login" | "register";

export default function LoginView({ error, loading = false, onLogin, onRegister }: LoginViewProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isRegister = mode === "register";
  const visibleError = localError || error;

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setLocalError("");
    setSuccessMessage("");

    setPassword("");
    setConfirmPassword("");

    if (nextMode === "register") {
      setUsername("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setSuccessMessage("");

    if (isRegister) {
      if (password.length < 6) {
        setLocalError("Mật khẩu cần tối thiểu 6 ký tự.");
        return;
      }

      if (password !== confirmPassword) {
        setLocalError("Mật khẩu xác nhận chưa khớp.");
        return;
      }

      try {
        await onRegister({
          email: email.trim() || undefined,
          fullName: fullName.trim(),
          password,
          phone: phone.trim() || undefined,
          role: "tenant",
          username: username.trim(),
        });
        switchMode("login");
        setUsername(username.trim());
        setPassword("");
        setSuccessMessage("Đăng ký thành công. Bạn có thể đăng nhập bằng tài khoản vừa tạo.");
      } catch {
        return;
      }
      return;
    }

    await onLogin(username.trim(), password);
  };

  return (
    <div className="min-h-screen w-full bg-[#f7f4ef] text-[#121c2a]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[#101828] px-10 pb-14 pt-16 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0">
            <div
              className="h-full w-full bg-cover bg-center opacity-45 mix-blend-overlay"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1400&auto=format&fit=crop')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#101828] via-[#101828]/80 to-[#101828]/20" />
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c9a45c] text-[#523a00] shadow-lg">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold uppercase text-[#e8c176]">LUMI Residence</p>
              <p className="text-xs font-mono uppercase tracking-[0.24em] text-white/50">Boarding Management</p>
            </div>
          </div>

          <div className="relative z-10 max-w-xl">
            <h1 className="mb-5 text-4xl font-bold leading-tight text-[#e8c176] lg:text-5xl">
              Quản lý phòng trọ rõ ràng, bảo mật và dễ vận hành
            </h1>
            <p className="max-w-lg text-base leading-7 text-[#d9e3f6]/80">
              Theo dõi phòng, người thuê, hợp đồng, hóa đơn và báo cáo vận hành trong một hệ thống thống nhất.
            </p>
          </div>

        </section>

        <section className="flex items-center justify-center px-5 py-8 sm:px-8 lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-7 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c9a45c] text-[#523a00] shadow-md">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold uppercase text-[#775a19]">LUMI Residence</p>
                <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#4e4639]/60">Management</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#d1c5b4]/30 bg-white p-6 shadow-[0_20px_70px_rgba(16,24,40,0.08)] sm:p-8">
              <div className="mb-7 flex rounded-xl border border-[#d1c5b4]/40 bg-[#f8f9ff] p-1">
                <button
                  type="button"
                  className={`h-10 flex-1 rounded-lg text-sm font-bold transition ${
                    !isRegister ? "bg-white text-[#775a19] shadow-sm" : "text-[#4e4639]/70 hover:text-[#775a19]"
                  }`}
                  onClick={() => switchMode("login")}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  className={`h-10 flex-1 rounded-lg text-sm font-bold transition ${
                    isRegister ? "bg-white text-[#775a19] shadow-sm" : "text-[#4e4639]/70 hover:text-[#775a19]"
                  }`}
                  onClick={() => switchMode("register")}
                >
                  Đăng ký
                </button>
              </div>

              <div className="mb-7">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#c9a45c] text-[#523a00]">
                  {isRegister ? <UserPlus className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-[#121c2a]">
                  {isRegister ? "Tạo tài khoản người thuê" : "Chào mừng trở lại"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#4e4639]/70">
                  {isRegister
                    ? "Tài khoản mới dùng vai trò người thuê và có thể được chủ trọ liên kết với hồ sơ thuê phòng."
                    : "Đăng nhập để quản lý phòng, người thuê, hợp đồng và hóa đơn."}
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {isRegister && (
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-[#121c2a]" htmlFor="fullName">
                      Họ tên
                    </label>
                    <input
                      id="fullName"
                      className="h-12 w-full rounded-xl border border-[#d1c5b4]/60 bg-[#f8f9ff] px-4 text-sm font-medium text-[#121c2a] outline-none transition focus:border-[#c9a45c] focus:ring-2 focus:ring-[#c9a45c]/25"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn An"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-[#121c2a]" htmlFor="username">
                    Tài khoản
                  </label>
                  <input
                    id="username"
                    className="h-12 w-full rounded-xl border border-[#d1c5b4]/60 bg-[#f8f9ff] px-4 text-sm font-medium text-[#121c2a] outline-none transition focus:border-[#c9a45c] focus:ring-2 focus:ring-[#c9a45c]/25"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    placeholder={isRegister ? "tenant02" : "Tên đăng nhập"}
                  />
                </div>

                {isRegister && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase text-[#121c2a]" htmlFor="phone">
                        Số điện thoại
                      </label>
                      <input
                        id="phone"
                        className="h-12 w-full rounded-xl border border-[#d1c5b4]/60 bg-[#f8f9ff] px-4 text-sm font-medium text-[#121c2a] outline-none transition focus:border-[#c9a45c] focus:ring-2 focus:ring-[#c9a45c]/25"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0900000000"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase text-[#121c2a]" htmlFor="email">
                        Email
                      </label>
                      <input
                        id="email"
                        className="h-12 w-full rounded-xl border border-[#d1c5b4]/60 bg-[#f8f9ff] px-4 text-sm font-medium text-[#121c2a] outline-none transition focus:border-[#c9a45c] focus:ring-2 focus:ring-[#c9a45c]/25"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tenant@email.com"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase text-[#121c2a]" htmlFor="password">
                      Mật khẩu
                    </label>
                    {!isRegister && (
                      <button
                        type="button"
                        className="text-xs font-semibold text-[#775a19] transition hover:text-[#c9a45c]"
                        onClick={() => alert("Vui lòng liên hệ quản trị viên để đặt lại mật khẩu.")}
                      >
                        Quên mật khẩu?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      className="h-12 w-full rounded-xl border border-[#d1c5b4]/60 bg-[#f8f9ff] px-4 pr-12 text-sm font-medium text-[#121c2a] outline-none transition focus:border-[#c9a45c] focus:ring-2 focus:ring-[#c9a45c]/25"
                      required
                      autoComplete={isRegister ? "new-password" : "current-password"}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-4 text-[#4e4639]/50 transition hover:text-[#775a19]"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {isRegister && (
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-[#121c2a]" htmlFor="confirmPassword">
                      Xác nhận mật khẩu
                    </label>
                    <input
                      id="confirmPassword"
                      className="h-12 w-full rounded-xl border border-[#d1c5b4]/60 bg-[#f8f9ff] px-4 text-sm font-medium text-[#121c2a] outline-none transition focus:border-[#c9a45c] focus:ring-2 focus:ring-[#c9a45c]/25"
                      required
                      autoComplete="new-password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                )}

                {!isRegister && (
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      className="h-4 w-4 rounded border-[#d1c5b4] text-[#c9a45c] focus:ring-[#c9a45c]"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label className="ml-2 text-sm text-[#4e4639]/80" htmlFor="remember-me">
                      Ghi nhớ đăng nhập
                    </label>
                  </div>
                )}

                {visibleError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {visibleError}
                  </div>
                )}

                {successMessage && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                    {successMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c9a45c] text-sm font-bold uppercase text-[#523a00] shadow-md transition hover:bg-[#e8c176] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Đang xử lý..." : isRegister ? "Tạo tài khoản" : "Đăng nhập"}
                  {isRegister ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                </button>
              </form>

              <div className="mt-7 border-t border-[#d1c5b4]/30 pt-5 text-center text-sm text-[#4e4639]/70">
                {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
                <button
                  type="button"
                  className="font-bold text-[#775a19] transition hover:text-[#c9a45c]"
                  onClick={() => switchMode(isRegister ? "login" : "register")}
                >
                  {isRegister ? "Đăng nhập" : "Đăng ký người thuê"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
