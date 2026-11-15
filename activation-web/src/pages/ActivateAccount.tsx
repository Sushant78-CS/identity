import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  LockKeyhole,
  Smartphone,
  Loader2,
  KeyRound,
  ArrowLeft,
} from "lucide-react";

import BrandLogo from "../components/BrandLogo";
import PasswordInput from "../components/PasswordInput";
import { useActivation } from "../hooks/useActivation";

export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";

  const { loading, success, error, activate, clearError } = useActivation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });

  const missingToken = !token;

  const validate = () => {
    const next = {
      password: "",
      confirmPassword: "",
    };

    if (!password) {
      next.password = "Password is required.";
    } else if (password.length < 8) {
      next.password = "Use at least 8 characters.";
    } else if (password.length > 72) {
      next.password = "Maximum 72 characters allowed.";
    }

    if (!confirmPassword) {
      next.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      next.confirmPassword = "Passwords do not match.";
    }

    setErrors(next);

    return !next.password && !next.confirmPassword;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading || !token || !validate()) return;

    await activate(token, password);
  };

  const updatePassword = (value: string) => {
    setPassword(value);
    setErrors((previous) => ({
      ...previous,
      password: "",
    }));
    clearError();
  };

  const updateConfirmPassword = (value: string) => {
    setConfirmPassword(value);
    setErrors((previous) => ({
      ...previous,
      confirmPassword: "",
    }));
    clearError();
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#F7F8FC]">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-[450px] w-[450px] rounded-full bg-blue-100/70 blur-[100px]" />

      {/* Compact header */}
      <header className="relative z-10 border-b border-[#E8EBF2] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <Link to="/">
            <BrandLogo />
          </Link>

          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold text-[#687386] transition-colors hover:text-[#2468DF]"
          >
            <ArrowLeft size={17} />
            <span className="hidden sm:inline">Back to website</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </header>

      {/* Main activation content */}
      <section className="relative z-10 flex flex-1 items-center justify-center px-5 py-10 sm:py-16">
        <div className="w-full max-w-[470px]">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="rounded-[28px] border border-[#E8EBF2] bg-white p-7 text-center shadow-[0_20px_70px_rgba(25,40,75,0.07)] sm:p-10"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
                  <CheckCircle2 size={42} className="text-green-600" />
                </div>

                <span className="mt-7 inline-flex rounded-full bg-green-50 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[2px] text-green-700">
                  Activation successful
                </span>

                <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-[#171B27] sm:text-3xl">
                  You're all set!
                </h1>

                <p className="mt-4 text-sm leading-7 text-[#687386]">
                  Your student account has been activated successfully. You can
                  now sign in to the Identity mobile application.
                </p>

                <div className="mt-8 rounded-2xl bg-[#F7F8FC] p-5 text-left">
                  <div className="flex gap-3">
                    <Smartphone size={22} className="shrink-0 text-[#2468DF]" />

                    <div>
                      <p className="text-sm font-bold text-[#20201F]">
                        What's next?
                      </p>

                      <p className="mt-2 text-xs leading-6 text-[#687386]">
                        Open Identity on your Android device and sign in using
                        your college code, student ID and newly created
                        password.
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/"
                  className="mt-8 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#2468DF] text-sm font-bold text-white transition-colors hover:bg-[#1957C5]"
                >
                  Back to Identity
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
            ) : missingToken ? (
              <motion.div
                key="missing-token"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[28px] border border-[#E8EBF2] bg-white p-8 text-center shadow-[0_20px_70px_rgba(25,40,75,0.07)] sm:p-10"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                  <AlertCircle size={32} className="text-red-500" />
                </div>

                <h1 className="mt-7 text-2xl font-extrabold text-[#171B27]">
                  Invalid activation link
                </h1>

                <p className="mt-4 text-sm leading-7 text-[#687386]">
                  The activation token is missing from this link. Please open
                  the complete activation link sent to your registered email
                  address.
                </p>

                <Link
                  to="/"
                  className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2468DF] text-sm font-bold text-white hover:bg-[#1957C5]"
                >
                  Return to website
                  <ArrowRight size={17} />
                </Link>

                <p className="mt-6 text-xs leading-6 text-[#8A94A5]">
                  If you need another activation link, contact your college
                  administrator.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="activation-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="rounded-[28px] border border-[#E8EBF2] bg-white p-7 shadow-[0_20px_70px_rgba(25,40,75,0.07)] sm:p-10"
              >
                {/* Form heading */}
                <div className="mb-8">
                  {/* <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#2468DF]">
                    <KeyRound size={27} />
                  </div> */}

                  <span className="text-[10px] font-extrabold uppercase tracking-[2.5px] text-[#2468DF]">
                    Welcome to Identity
                  </span>

                  <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[#171B27] sm:text-3xl">
                    Activate your account
                  </h1>

                  <p className="mt-3 text-sm leading-7 text-[#687386]">
                    Create your password to complete your student account
                    activation.
                  </p>
                </div>

                {/* Error banner */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 overflow-hidden"
                    >
                      <div
                        role="alert"
                        aria-live="assertive"
                        className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
                      >
                        <AlertCircle
                          size={19}
                          className="mt-0.5 shrink-0 text-red-600"
                        />

                        <p className="text-xs leading-6 text-red-700">
                          {error}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  <PasswordInput
                    id="new-password"
                    label="Create password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={updatePassword}
                    error={errors.password}
                    autoComplete="new-password"
                    disabled={loading}
                  />

                  <PasswordInput
                    id="confirm-password"
                    label="Confirm password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={updateConfirmPassword}
                    error={errors.confirmPassword}
                    autoComplete="new-password"
                    disabled={loading}
                  />

                  {/* Requirements */}
                  <div className="rounded-2xl bg-[#F7F8FC] p-4">
                    <p className="mb-3 text-[10px] font-extrabold tracking-[1.5px] text-[#687386]">
                      PASSWORD REQUIREMENTS
                    </p>

                    {[
                      {
                        label: "At least 8 characters",
                        valid: password.length >= 8,
                      },
                      {
                        label: "Maximum 72 characters",
                        valid: password.length > 0 && password.length <= 72,
                      },
                      {
                        label: "Passwords match",
                        valid:
                          password.length > 0 && password === confirmPassword,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="mt-2 flex items-center gap-2 text-xs text-[#687386]"
                      >
                        <CheckCircle2
                          size={15}
                          className={
                            item.valid ? "text-green-600" : "text-[#A5ADBA]"
                          }
                        />
                        {item.label}
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#2468DF] px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/15 transition-all hover:-translate-y-0.5 hover:bg-[#1957C5] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={19} className="animate-spin" />
                        Activating account...
                      </>
                    ) : (
                      <>
                        Activate Account
                        <ArrowRight size={19} />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-7 flex items-center justify-center gap-2 border-t border-[#E8EBF2] pt-6">
                  <LockKeyhole size={15} className="text-green-600" />

                  <span className="text-[11px] text-[#8A94A5]">
                    Secure password creation
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-7 text-center text-xs text-[#8A94A5]">
            © {new Date().getFullYear()} Identity Campus Platform
          </p>
        </div>
      </section>
    </main>
  );
}
