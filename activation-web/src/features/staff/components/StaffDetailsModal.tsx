import {
  CalendarDays,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  Pencil,
} from "lucide-react";

import type { StaffResponse } from "../staff.types";
import StaffModal from "./StaffModal";
import StaffStatusBadge from "./StaffStatusBadge";

interface Props {
  staff: StaffResponse;
  onClose: () => void;
  onEdit: () => void;
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 p-3.5">
      <div className="rounded-lg bg-gray-100 p-2 text-gray-600">
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="mt-1 break-words text-sm font-medium text-gray-900">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StaffDetailsModal({ staff, onClose, onEdit }: Props) {
  return (
    <StaffModal
      title="Staff profile"
      description="Staff account information and access status."
      onClose={onClose}
    >
      <div className="space-y-5">
        <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-gray-700 shadow-sm">
            <UserRound size={25} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-gray-900">
              {staff.fullName}
            </h3>
            <p className="mt-1 truncate text-sm text-gray-500">
              {staff.role.replaceAll("_", " ")}
            </p>
            <div className="mt-2">
              <StaffStatusBadge status={staff.status} />
            </div>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Personal information
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <Detail icon={Mail} label="Email address" value={staff.email} />
            <Detail
              icon={Phone}
              label="Phone number"
              value={staff.phoneNumber || "Not provided"}
            />
            <Detail
              icon={ShieldCheck}
              label="Role"
              value={staff.role.replaceAll("_", " ")}
            />
            <Detail
              icon={CalendarDays}
              label="Account created"
              value={formatDate(staff.createdAt)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 p-3.5">
          <p className="text-xs text-gray-500">Staff ID</p>
          <p className="mt-1 font-mono text-sm font-medium text-gray-900">
            #{staff.id}
          </p>
        </div>

        <div className="flex justify-end border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <Pencil size={15} />
            Edit profile
          </button>
        </div>
      </div>
    </StaffModal>
  );
}
