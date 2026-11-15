interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
  showTagline?: boolean;
}

const SIZES = {
  sm: { word: "text-xl", tag: "text-[10px]", rule: "w-4" },
  md: { word: "text-3xl", tag: "text-xs", rule: "w-5" },
  lg: { word: "text-5xl", tag: "text-sm", rule: "w-7" },
};

const VARIANTS = {
  light: { word: "text-[#20201F]", tag: "text-[#6B6A64]" },
  dark: { word: "text-white", tag: "text-white/70" },
};

export default function BrandLogo({
  className = "",
  size = "md",
  variant = "light",
}: BrandLogoProps) {
  const s = SIZES[size];
  const v = VARIANTS[variant];

  return (
    <div
      className={`inline-flex flex-col leading-none select-none ${className}`}
      role="img"
      aria-label="Identity, Campus Platform"
    >
      {/* Wordmark */}
      <span
        className={`${s.word} ${v.word} font-black tracking-[-0.045em]`}
        aria-hidden="true"
      >
        IDENTITY
      </span>
    </div>
  );
}
