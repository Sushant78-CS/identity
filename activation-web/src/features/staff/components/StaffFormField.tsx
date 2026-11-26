import type { ReactNode } from "react";

interface Props {
  label: string;
  children: ReactNode;
  hint?: string;
  required?: boolean;
}

export default function StaffFormField({
  label,
  children,
  hint,
  required,
}: Props) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {children}

      {hint && <p className="text-xs leading-5 text-gray-500">{hint}</p>}
    </div>
  );
}
