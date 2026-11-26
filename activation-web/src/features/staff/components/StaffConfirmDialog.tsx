import { AlertTriangle, CheckCircle2, LoaderCircle } from "lucide-react";
import StaffModal from "./StaffModal";

interface Props {
  open: boolean;
  loading: boolean;
  action: "activate" | "suspend";
  staffName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function StaffConfirmDialog({
  open,
  loading,
  action,
  staffName,
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  const activating = action === "activate";

  return (
    <StaffModal
      title={activating ? "Activate staff account" : "Suspend staff account"}
      description="Please review this action before continuing."
      onClose={loading ? () => {} : onClose}
    >
      <div className="flex items-start gap-4">
        <div
          className={`rounded-xl p-3 ${
            activating
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {activating ? (
            <CheckCircle2 size={22} />
          ) : (
            <AlertTriangle size={22} />
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-900">
            {activating
              ? `Activate ${staffName}'s account?`
              : `Suspend ${staffName}'s account?`}
          </p>

          <p className="mt-1 text-sm leading-6 text-gray-500">
            {activating
              ? "This will change the account status to ACTIVE."
              : "This will change the account status to SUSPENDED. The staff member may lose access according to your backend authorization rules."}
          </p>
        </div>
      </div>

      <div className="mt-7 flex flex-col-reverse gap-2 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60 ${
            activating
              ? "bg-emerald-700 hover:bg-emerald-800"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {loading && <LoaderCircle size={16} className="animate-spin" />}
          {loading
            ? "Updating..."
            : activating
              ? "Activate account"
              : "Suspend account"}
        </button>
      </div>
    </StaffModal>
  );
}
