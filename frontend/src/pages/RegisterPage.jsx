import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mic } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { registerUser } from "../services/userService";
import { tts } from "../services/ttsService";

function getStrength(pw) {
  if (!pw) return { level: 0, label: "", cls: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: "Lemah", cls: "weak" };
  if (score <= 2) return { level: 2, label: "Cukup", cls: "fair" };
  return { level: 3, label: "Kuat", cls: "strong" };
}

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = getStrength(password);

  useEffect(() => {
    tts.speak('Halaman pendaftaran. Silakan isi nama, email, dan password.');
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setNameError("");
    setEmailError("");

    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(name)) {
      setNameError("Nama hanya berupa huruf");
      tts.error("Nama hanya boleh berupa huruf.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Masukkan email yang valid");
      tts.error("Email tidak valid.");
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser({ name, email, password });
      login(data.access_token, data.user);
      tts.registerSuccess(data.user.name);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.detail || "Registrasi gagal";
      setEmailError(msg);
      tts.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const segClass = (i) => {
    const base = "flex-1 h-[3px] rounded-full transition-colors duration-300";
    if (!password || strength.level < i)
      return `${base} bg-zinc-200 dark:bg-white/8`;
    const map = {
      1: "bg-pink-500 dark:bg-[#fbcfe8]",
      2: "bg-amber-500",
      3: "bg-emerald-500",
    };
    return `${base} ${map[strength.level]}`;
  };

  const strengthLabelClass = () => {
    const base = "text-[11px] mt-1 pl-0.5 transition-colors duration-300";
    const map = {
      weak: "text-pink-600 dark:text-pink-300",
      fair: "text-amber-500 dark:text-amber-400",
      strong: "text-emerald-600 dark:text-emerald-500",
    };
    return `${base} ${map[strength.cls] || "text-zinc-400 dark:text-white/30"}`;
  };

  return (
    <div
      className="
      min-h-screen min-h-[100dvh]
      bg-[#f4f4f5] dark:bg-[#09090b]
      bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.08)_0%,transparent_70%)]
      dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(29,78,216,0.12)_0%,transparent_70%)]
      flex items-center justify-center
      p-4 sm:p-6
      selection:bg-pink-500/10 dark:selection:bg-[#fbcfe8]/30
      font-sans
    "
    >
      <div
        className="
        relative
        w-full
        max-w-[420px]
        bg-white dark:bg-[#18181b]
        border border-zinc-200 dark:border-white/8
        rounded-[20px] sm:rounded-[24px]
        px-5 py-7
        sm:px-7 sm:py-9
        md:px-9 md:py-10
        shadow-xl dark:shadow-none
        backdrop-blur-[20px]
        animate-fade-up
        mx-auto
      "
      >
        {/* Decorative corners */}
        <div className="absolute w-6 h-6 border-pink-500/30 dark:border-[#fbcfe8]/30 border-solid top-[-1px] left-[-1px] border-t border-l rounded-tl-[20px] sm:rounded-tl-[24px]" />
        <div className="absolute w-6 h-6 border-pink-500/30 dark:border-[#fbcfe8]/30 border-solid bottom-[-1px] right-[-1px] border-b border-r rounded-br-[20px] sm:rounded-br-[24px]" />

        {/* Brand */}
        <div className="flex flex-col items-center gap-3 sm:gap-3.5 mb-7 sm:mb-9">
          <div
            className="
            w-12 h-12 sm:w-14 sm:h-14
            rounded-2xl
            bg-gradient-to-br from-pink-50 to-pink-100
            dark:from-[#1c0808] dark:to-[#3d0f0f]
            border border-pink-500/20 dark:border-[#fbcfe8]/25
            flex items-center justify-center
          "
          >
            <Mic
              size={22}
              className="text-pink-600 dark:text-[#fbcfe8] sm:hidden"
              strokeWidth={1.5}
            />
            <Mic
              size={24}
              className="text-pink-600 dark:text-[#fbcfe8] hidden sm:block"
              strokeWidth={1.5}
            />
          </div>

          <div className="font-syne text-[20px] sm:text-[22px] font-extrabold text-zinc-800 dark:text-white tracking-[0.12em]">
            VOICE<span className="text-pink-600 dark:text-[#fbcfe8]">BANK</span>
          </div>

          <p className="text-[12px] sm:text-[13px] font-light text-zinc-400 dark:text-white/38 text-center tracking-[0.01em] mt-[-4px] sm:mt-[-6px]">
            Buat akun baru Anda
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} noValidate>
          <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-zinc-400 dark:text-white/30 mb-4">
            Informasi Akun
          </p>

          <div className="flex flex-col gap-3 mb-5 sm:mb-6">
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="vb-name"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-zinc-500 dark:text-white/40 pl-0.5"
              >
                Nama lengkap
              </label>
              <input
                id="vb-name"
                type="text"
                placeholder="Nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`
                  w-full
                  bg-zinc-50 dark:bg-white/4
                  border rounded-xl
                  px-4 py-3 sm:py-3.5
                  font-sans text-sm font-normal
                  text-zinc-900 dark:text-white
                  outline-none transition-all
                  placeholder-zinc-400 dark:placeholder-white/20
                  hover:border-zinc-300 dark:hover:border-white/20
                  focus:border-pink-500/55 dark:focus:border-[#fbcfe8]/55
                  focus:bg-pink-50/20 dark:focus:bg-[#fbcfe8]/4
                  touch-manipulation
                  ${nameError ? "border-pink-500/55 dark:border-[#fbcfe8]/55" : "border-zinc-200 dark:border-white/8"}
                `}
                autoComplete="name"
              />
              {nameError && (
                <span className="text-xs font-normal text-pink-500 dark:text-pink-300 pl-1">
                  {nameError}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="vb-email"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-zinc-500 dark:text-white/40 pl-0.5"
              >
                Email
              </label>
              <input
                id="vb-email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`
                  w-full
                  bg-zinc-50 dark:bg-white/4
                  border rounded-xl
                  px-4 py-3 sm:py-3.5
                  font-sans text-sm font-normal
                  text-zinc-900 dark:text-white
                  outline-none transition-all
                  placeholder-zinc-400 dark:placeholder-white/20
                  hover:border-zinc-300 dark:hover:border-white/20
                  focus:border-pink-500/55 dark:focus:border-[#fbcfe8]/55
                  focus:bg-pink-50/20 dark:focus:bg-[#fbcfe8]/4
                  touch-manipulation
                  ${emailError ? "border-pink-500/55 dark:border-[#fbcfe8]/55" : "border-zinc-200 dark:border-white/8"}
                `}
                autoComplete="email"
                inputMode="email"
              />
              {emailError && (
                <span className="text-xs font-normal text-pink-500 dark:text-pink-300 pl-1">
                  {emailError}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="vb-password"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-zinc-500 dark:text-white/40 pl-0.5"
              >
                Password
              </label>
              <input
                id="vb-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                  w-full
                  bg-zinc-50 dark:bg-white/4
                  border border-zinc-200 dark:border-white/8
                  rounded-xl
                  px-4 py-3 sm:py-3.5
                  font-sans text-sm font-normal
                  text-zinc-900 dark:text-white
                  outline-none transition-all
                  placeholder-zinc-400 dark:placeholder-white/20
                  hover:border-zinc-300 dark:hover:border-white/20
                  focus:border-pink-500/55 dark:focus:border-[#fbcfe8]/55
                  focus:bg-pink-50/20 dark:focus:bg-[#fbcfe8]/4
                  touch-manipulation
                "
                autoComplete="new-password"
              />
              {/* Strength indicator */}
              {password && (
                <>
                  <div className="flex gap-1 mt-1.5">
                    <div className={segClass(1)} />
                    <div className={segClass(2)} />
                    <div className={segClass(3)} />
                  </div>
                  <span className={strengthLabelClass()}>
                    Keamanan password: {strength.label}
                  </span>
                </>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              p-[13px] sm:p-[15px]
              rounded-xl border-none cursor-pointer
              font-sans text-sm font-medium tracking-[0.05em]
              text-[#09090b]
              bg-gradient-to-br from-[#fbcfe8] to-[#f472b6]
              transition-all
              hover:opacity-88
              active:scale-[0.98]
              relative overflow-hidden
              after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/8 after:to-transparent after:pointer-events-none
              touch-manipulation
              min-h-[44px]
            "
          >
            {loading ? "Memproses..." : "Buat akun"}
          </button>
        </form>

        <p className="mt-3 text-center text-[11px] font-light text-zinc-400 dark:text-white/20 leading-relaxed">
          Dengan mendaftar, Anda menyetujui{" "}
          <a
            href="#"
            className="text-zinc-500 dark:text-white/40 underline underline-offset-2"
          >
            Syarat &amp; Ketentuan
          </a>{" "}
          kami.
        </p>

        <div className="h-[1px] bg-zinc-200 dark:bg-white/8 my-6 sm:my-7" />

        <p className="text-center text-[13px] font-light text-zinc-400 dark:text-white/30">
          Sudah punya akun?{" "}
          <Link
            to="/"
            className="text-pink-600 dark:text-pink-300 font-medium no-underline transition-colors hover:text-pink-700 dark:hover:text-red-300"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
