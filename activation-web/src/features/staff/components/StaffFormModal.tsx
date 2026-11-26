import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LoaderCircle, UserPlus } from "lucide-react";

import type { CreateStaffRequest, UpdateStaffRequest } from "../staff.types";

import StaffModal from "./StaffModal";
import StaffFormField from "./StaffFormField";

interface Props {
  mode: "create" | "edit";
  initialValues: CreateStaffRequest | UpdateStaffRequest;
  loading: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (values: CreateStaffRequest | UpdateStaffRequest) => Promise<void>;
}

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-500 focus:ring-4 focus:ring-gray-100 disabled:bg-gray-50";

export default function StaffFormModal({
  mode,
  initialValues,
  loading,
  error,
  onClose,
  onSubmit,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  const [values, setValues] = useState({
    fullName: initialValues.fullName,
    email: initialValues.email,
    phoneNumber: initialValues.phoneNumber,
    initialPassword:
      "initialPassword" in initialValues ? initialValues.initialPassword : "",
  });

  const isCreate = mode === "create";

  const update = (field: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isCreate) {
      await onSubmit({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phoneNumber: values.phoneNumber.trim(),
        initialPassword: values.initialPassword,
      });
    } else {
      await onSubmit({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phoneNumber: values.phoneNumber.trim(),
      });
    }
  };

  return (
    <StaffModal
      title={isCreate ? "Add staff member" : "Edit staff member"}
      description={
        isCreate
          ? "Create a staff account for your college."
          : "Update this staff member's information."
      }
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <StaffFormField label="Full name" required>
          <input
            required
            maxLength={isCreate ? 150 : 100}
            value={values.fullName}
            onChange={(event) => update("fullName", event.target.value)}
            placeholder="Enter full name"
            autoComplete="name"
            className={inputClass}
          />
        </StaffFormField>

        <StaffFormField label="Email address" required>
          <input
            required
            type="email"
            maxLength={150}
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            placeholder="name@college.edu"
            autoComplete="email"
            className={inputClass}
          />
        </StaffFormField>

        <StaffFormField
          label="Phone number"
          hint={
            isCreate
              ? "Optional. Maximum 20 characters."
              : "Optional. Use 10–15 digits, with an optional + prefix."
          }
        >
          <input
            type="tel"
            maxLength={isCreate ? 20 : 16}
            value={values.phoneNumber}
            onChange={(event) => update("phoneNumber", event.target.value)}
            placeholder="+91 9876543210"
            autoComplete="tel"
            className={inputClass}
          />
        </StaffFormField>

        {isCreate && (
          <StaffFormField
            label="Initial password"
            required
            hint="Use 12–72 characters. Share this securely with the staff member."
          >
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                minLength={12}
                maxLength={72}
                value={values.initialPassword}
                onChange={(event) =>
                  update("initialPassword", event.target.value)
                }
                placeholder="Enter initial password"
                autoComplete="new-password"
                className={`${inputClass} pr-11`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </StaffFormField>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <UserPlus size={16} />
            )}
            {loading
              ? "Saving..."
              : isCreate
                ? "Create account"
                : "Save changes"}
          </button>
        </div>
      </form>
    </StaffModal>
  );
}
