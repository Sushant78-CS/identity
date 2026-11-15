import { Link } from "react-router-dom";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import BrandLogo from "./BrandLogo";

export default function Footer() {
  return (
    <footer className="border-t border-[#E8EBF2] bg-white">
      <div className="mx-auto max-w-[1240px] px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <BrandLogo />

            <p className="mt-5 max-w-sm text-sm leading-7 text-[#687386]">
              One trusted digital identity for your campus. Connecting students,
              colleges and campus services through a secure digital platform.
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs font-medium text-[#687386]">
              <ShieldCheck size={16} className="text-green-600" />
              Designed for secure campus identity
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#20201F]">Explore</h3>

            <div className="mt-5 space-y-4">
              <a
                href="/#features"
                className="block text-sm text-[#687386] hover:text-[#2468DF]"
              >
                Features
              </a>
              <a
                href="/#how-it-works"
                className="block text-sm text-[#687386] hover:text-[#2468DF]"
              >
                How it works
              </a>
              <a
                href="/#about"
                className="block text-sm text-[#687386] hover:text-[#2468DF]"
              >
                About Identity
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#20201F]">Get started</h3>

            <div className="mt-5 space-y-4">
              <Link
                to="/activate"
                className="flex items-center gap-2 text-sm text-[#687386] hover:text-[#2468DF]"
              >
                Activate your account
                <ArrowUpRight size={15} />
              </Link>

              <a
                href="mailto:support@identity.example"
                className="block text-sm text-[#687386] hover:text-[#2468DF]"
              >
                Contact support
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[#E8EBF2] pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#8A94A5]">
            © {new Date().getFullYear()} Identity Campus Platform.
          </p>

          <p className="text-xs text-[#8A94A5]">One identity. Your campus.</p>
        </div>
      </div>
    </footer>
  );
}
