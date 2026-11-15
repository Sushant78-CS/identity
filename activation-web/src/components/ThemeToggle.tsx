import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import type { ThemeMode } from "../store/themeStore";

const options: {
  value: ThemeMode;
  label: string;
  Icon: typeof Sun;
}[] = [
  { value: "system", label: "System", Icon: Monitor },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
];

export default function ThemeToggle() {
  const { mode, setMode } = useTheme();

  return (
    <div
      className="flex items-center gap-1 rounded-full border p-1"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
      }}
      aria-label="Appearance preference"
    >
      {options.map(({ value, label, Icon }) => {
        const active = mode === value;

        return (
          <button
            key={value}
            type="button"
            title={label}
            aria-label={`${label} theme`}
            aria-pressed={active}
            onClick={() => setMode(value)}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
            style={{
              background: active ? "var(--surface-secondary)" : "transparent",
              color: active ? "var(--text-primary)" : "var(--text-muted)",
            }}
          >
            <Icon size={17} />
          </button>
        );
      })}
    </div>
  );
}
