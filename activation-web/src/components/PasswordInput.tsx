import { useState } from "react";

interface PasswordInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete: "new-password";
  disabled?: boolean;
  id: string;
}

export default function PasswordInput({
  label,
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
  disabled = false,
  id,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-[#171B27]"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={72}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`h-11 w-full rounded-lg border bg-white pl-3.5 pr-16 text-sm text-[#171B27] placeholder:text-[#8A94A5] focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-[#F7F8FC] disabled:opacity-60 ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
              : "border-[#D5DAE3] focus:border-[#2468DF] focus:ring-[#2468DF]/20"
          }`}
        />

        <button
          type="button"
          onClick={() => setVisible((previous) => !previous)}
          disabled={disabled}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 rounded-r-lg px-3.5 text-sm font-medium text-[#687386] hover:text-[#2468DF] focus:outline-none focus-visible:text-[#2468DF] focus-visible:underline disabled:opacity-60"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-xs text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
