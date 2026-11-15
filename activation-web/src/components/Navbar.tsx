import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BrandLogo from "./BrandLogo";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const links = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/#features" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "About", href: "/#about" },
  ];

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8EBF2] bg-white/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between px-5 sm:px-8">
        <Link to="/" onClick={closeMenu}>
          <BrandLogo />
        </Link>

        <div className="hidden items-center gap-9 md:flex">
          {links.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                location.pathname === "/" && item.href === "/"
                  ? "text-[#2468DF]"
                  : "text-[#687386] hover:text-[#2468DF]"
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <Link
            to="/activate"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#2468DF] px-5 text-sm font-semibold text-white transition-all hover:bg-[#1957C5] hover:shadow-lg hover:shadow-blue-600/20"
          >
            Activate account
            <ArrowUpRight size={17} />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E8EBF2] text-[#20201F] md:hidden"
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-[#E8EBF2] bg-white md:hidden"
          >
            <div className="space-y-1 px-5 py-4">
              {links.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={closeMenu}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-[#687386] hover:bg-[#F5F7FB] hover:text-[#2468DF]"
                >
                  {item.label}
                </a>
              ))}

              <Link
                to="/activate"
                onClick={closeMenu}
                className="mt-3 flex h-12 items-center justify-center gap-2 rounded-xl bg-[#2468DF] text-sm font-semibold text-white"
              >
                Activate account
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
