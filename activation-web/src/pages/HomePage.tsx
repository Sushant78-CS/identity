import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Fingerprint,
  QrCode,
  Smartphone,
  Building2,
  GraduationCap,
  CheckCircle2,
  Sparkles,
  Globe2,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" as const },
  },
};

const features = [
  {
    icon: Fingerprint,
    title: "Digital Student Identity",
    description:
      "A unified digital identity that represents your student credentials and campus membership.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: QrCode,
    title: "QR Campus Verification",
    description:
      "Make campus identity verification simpler with a scannable digital student credential.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: ShieldCheck,
    title: "Secure Access",
    description:
      "Protected student accounts with secure authentication and controlled access.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Smartphone,
    title: "Mobile Experience",
    description:
      "Access your campus identity through a dedicated mobile application.",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: Building2,
    title: "College Connected",
    description:
      "College-managed student identities designed for multi-college environments.",
    color: "bg-cyan-50 text-cyan-600",
  },
  {
    icon: GraduationCap,
    title: "Campus Platform",
    description:
      "A foundation for connecting students with campus information and services.",
    color: "bg-pink-50 text-pink-600",
  },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#F7F8FC] text-[#171B27]">
      {/* HERO */}
      <section className="relative">
        <div className="pointer-events-none absolute -right-40 top-0 h-[550px] w-[550px] rounded-full bg-blue-200/30 blur-[120px]" />

        <div className="mx-auto grid min-h-[660px] max-w-[1240px] items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            {/* <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold text-[#2468DF]">
              <Sparkles size={15} />
              YOUR DIGITAL CAMPUS IDENTITY
            </div> */}

            <h1 className="max-w-[680px] text-5xl font-extrabold leading-[1.1] tracking-[-2px] sm:text-6xl lg:text-[68px]">
              One identity.
              <br />
              <span className="text-[#2468DF]">Your campus.</span>
            </h1>

            <p className="mt-7 max-w-[530px] text-base leading-8 text-[#687386] sm:text-lg">
              A connected digital campus experience. Access your student
              identity, verify your credentials and stay connected with your
              college through Identity.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/activate"
                className="group inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#2468DF] px-7 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1 hover:bg-[#1957C5]"
              >
                Activate your account
                <ArrowRight
                  size={19}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <a
                href="#features"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-[#E2E6EF] bg-white px-7 text-sm font-bold text-[#30394A] transition-colors hover:border-blue-200 hover:text-[#2468DF]"
              >
                Explore Identity
                <ArrowUpRight size={17} />
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-[#687386]">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-600" />
                College-managed accounts
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-600" />
                Secure authentication
              </span>
            </div>
          </motion.div>

          {/* Digital ID visual */}
          <motion.div
            initial={{ opacity: 0, x: 45, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto w-full max-w-[510px]"
          >
            <div className="absolute -left-10 top-10 h-28 w-28 rounded-full bg-blue-200/50 blur-3xl" />

            <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#2468DF] via-[#2058B9] to-[#153E88] p-7 text-white shadow-[0_30px_80px_rgba(36,104,223,0.25)] sm:p-9">
              <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-[45px] border-white/5" />
              <div className="absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-white/5" />

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-2xl font-extrabold tracking-[3px]">
                    IDENTITY
                  </p>
                  <p className="mt-1 text-[10px] font-semibold tracking-[3px] text-blue-100">
                    DIGITAL STUDENT CREDENTIAL
                  </p>
                </div>

                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-bold tracking-widest">
                  STUDENT
                </span>
              </div>

              <div className="relative mt-12 flex items-center gap-5">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/15">
                  <GraduationCap size={48} />
                </div>

                <div>
                  <p className="text-[10px] font-bold tracking-widest text-blue-100">
                    DIGITAL CAMPUS ID
                  </p>
                  <p className="mt-2 text-xl font-bold">Your Identity</p>
                  <p className="mt-1 text-sm text-blue-100">
                    One identity. Your campus.
                  </p>
                </div>
              </div>

              <div className="relative my-8 h-px bg-white/20" />

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-blue-100">
                    POWERED BY
                  </p>
                  <p className="mt-2 text-sm font-bold">
                    Identity Campus Platform
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-[#2468DF]">
                  <QrCode size={38} />
                </div>
              </div>

              <div className="relative mt-8 flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 p-3">
                <ShieldCheck size={17} className="text-green-300" />
                <span className="text-xs font-medium text-blue-50">
                  Your digital identity, securely connected.
                </span>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-8 -left-5 hidden items-center gap-3 rounded-2xl border border-[#E8EBF2] bg-white p-4 shadow-xl sm:flex"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#20201F]">
                  Secure identity
                </p>
                <p className="mt-1 text-[10px] text-[#8A94A5]">
                  Campus-connected access
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-[#E8EBF2] bg-white">
        <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-7 px-5 py-8 sm:px-8 md:grid-cols-4">
          {[
            { icon: ShieldCheck, text: "Secure identity" },
            { icon: Building2, text: "College managed" },
            { icon: Smartphone, text: "Mobile ready" },
            { icon: Globe2, text: "Connected campus" },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center justify-center gap-3"
            >
              <item.icon size={20} className="text-[#2468DF]" />
              <span className="text-xs font-bold text-[#687386] sm:text-sm">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="scroll-mt-24 py-24 sm:py-28">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="mx-auto mb-14 max-w-2xl text-center"
          >
            <span className="text-xs font-extrabold tracking-[3px] text-[#2468DF]">
              THE IDENTITY EXPERIENCE
            </span>

            <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl">
              Everything starts with
              <span className="text-[#2468DF]"> your identity.</span>
            </h2>

            <p className="mt-5 text-sm leading-8 text-[#687386] sm:text-base">
              A digital foundation designed to make student identity and campus
              access more convenient and connected.
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.article
                key={feature.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -6 }}
                className="rounded-[24px] border border-[#E8EBF2] bg-white p-7 transition-shadow hover:shadow-xl hover:shadow-blue-900/5"
              >
                <div
                  className={`flex h-13 w-13 items-center justify-center rounded-2xl ${feature.color}`}
                >
                  <feature.icon size={25} />
                </div>

                <h3 className="mt-7 text-lg font-bold text-[#20201F]">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#687386]">
                  {feature.description}
                </p>

                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-[#2468DF]">
                  Built for your campus
                  <ArrowUpRight size={15} />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="scroll-mt-24 bg-white py-24">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-xs font-extrabold tracking-[3px] text-[#2468DF]">
                GETTING STARTED
              </span>

              <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl">
                Getting started is
                <span className="text-[#2468DF]"> simple.</span>
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-8 text-[#687386] sm:text-base">
                Your college creates your student account. You activate it once,
                set your password and access Identity through the mobile
                application.
              </p>

              <Link
                to="/activate"
                className="mt-8 inline-flex h-13 items-center gap-3 rounded-xl bg-[#2468DF] px-6 text-sm font-bold text-white transition-all hover:bg-[#1957C5]"
              >
                Activate your account
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="space-y-4">
              {[
                {
                  number: "01",
                  title: "Your college creates your account",
                  description:
                    "Your college administrator adds your student details to Identity.",
                },
                {
                  number: "02",
                  title: "Receive your activation email",
                  description:
                    "A secure, time-limited activation link is sent to your registered email.",
                },
                {
                  number: "03",
                  title: "Set your password",
                  description:
                    "Open the activation link and create your account password.",
                },
                {
                  number: "04",
                  title: "Access Identity",
                  description:
                    "Install the mobile application and sign in using your student credentials.",
                },
              ].map((step) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex gap-5 rounded-2xl border border-[#E8EBF2] bg-[#F7F8FC] p-5 sm:p-6"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-extrabold text-[#2468DF]">
                    {step.number}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#20201F] sm:text-base">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-xs leading-6 text-[#687386] sm:text-sm">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT / CTA */}
      <section id="about" className="scroll-mt-24 px-5 py-24 sm:px-8">
        <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[32px] bg-[#174AAB] px-7 py-16 text-center text-white sm:px-14 sm:py-20">
          <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full border-[55px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-36 -left-20 h-80 w-80 rounded-full bg-white/5" />

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative mx-auto max-w-2xl"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <ShieldCheck size={30} />
            </div>

            <h2 className="mt-7 text-3xl font-extrabold tracking-tight sm:text-5xl">
              Your campus.
              <br />
              Your digital identity.
            </h2>

            <p className="mt-5 text-sm leading-8 text-blue-100 sm:text-base">
              Your college has created your Identity account. Take the first
              step and activate your student identity.
            </p>

            <Link
              to="/activate"
              className="mt-9 inline-flex h-14 items-center gap-3 rounded-2xl bg-white px-7 text-sm font-bold text-[#174AAB] transition-all hover:-translate-y-1 hover:bg-blue-50"
            >
              Activate your account
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
