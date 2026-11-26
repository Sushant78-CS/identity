import {
  Ban,
  CheckCircle2,
  Eye,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Users,
} from "lucide-react";
import { useState } from "react";

import type { StaffResponse } from "../staff.types";
import StaffStatusBadge from "./StaffStatusBadge";

interface Props {
  staff: StaffResponse[];
  loading: boolean;
  error: string;
  page: number;
  totalPages: number;
  totalElements: number;
  updatingStatusId: number | null;
  onView: (member: StaffResponse) => void;
  onEdit: (member: StaffResponse) => void;
  onStatusChange: (member: StaffResponse) => void;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function StaffTable({
  staff,
  loading,
  error,
  page,
  totalPages,
  totalElements,
  updatingStatusId,
  onView,
  onEdit,
  onStatusChange,
  onRefresh,
  onPageChange,
  onRetry,
}: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="flex flex-col justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-semibold text-gray-900">Staff directory</h2>
          <p className="mt-1 text-xs text-gray-500">
            {totalElements} staff member{totalElements === 1 ? "" : "s"} found
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="m-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="self-start rounded-lg bg-white px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200 hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-gray-50/80 text-xs text-gray-500">
            <tr>
              <th className="px-5 py-3.5 font-medium">Staff member</th>
              <th className="px-5 py-3.5 font-medium">Phone</th>
              <th className="px-5 py-3.5 font-medium">Role</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 font-medium">Date added</th>
              <th className="px-5 py-3.5 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  {Array.from({ length: 6 }).map((__, cell) => (
                    <td key={cell} className="px-5 py-5">
                      <div className="h-4 animate-pulse rounded-md bg-gray-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : staff.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                    <Users size={22} />
                  </div>
                  <p className="mt-4 font-medium text-gray-900">
                    No staff members found
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Try changing your search or filters.
                  </p>
                </td>
              </tr>
            ) : (
              staff.map((member) => (
                <StaffTableRow
                  key={member.id}
                  member={member}
                  updating={updatingStatusId === member.id}
                  onView={() => onView(member)}
                  onEdit={() => onEdit(member)}
                  onStatusChange={() => onStatusChange(member)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
        <p className="text-sm text-gray-500">
          Showing {totalElements === 0 ? 0 : page * 10 + 1}–
          {Math.min((page + 1) * 10, totalElements)} of {totalElements}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page === 0 || loading}
            onClick={() => onPageChange(page - 1)}
            className="rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span className="min-w-20 text-center text-sm text-gray-500">
            {totalPages === 0 ? 0 : page + 1} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page + 1 >= totalPages || loading}
            onClick={() => onPageChange(page + 1)}
            className="rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

function StaffTableRow({
  member,
  updating,
  onView,
  onEdit,
  onStatusChange,
}: {
  member: StaffResponse;
  updating: boolean;
  onView: () => void;
  onEdit: () => void;
  onStatusChange: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = member.status.toUpperCase() === "ACTIVE";

  return (
    <tr className="transition-colors hover:bg-gray-50/70">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xs font-semibold text-gray-700">
            {getInitials(member.fullName)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-gray-900">
              {member.fullName}
            </p>
            <p className="mt-0.5 truncate text-xs text-gray-500">
              {member.email}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4 text-gray-600">{member.phoneNumber || "—"}</td>

      <td className="px-5 py-4 text-gray-600">
        {member.role.replaceAll("_", " ")}
      </td>

      <td className="px-5 py-4">
        <StaffStatusBadge status={member.status} />
      </td>

      <td className="px-5 py-4 text-gray-600">
        {formatDate(member.createdAt)}
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={onView}
            title="View staff details"
            aria-label={`View ${member.fullName}`}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <Eye size={17} />
          </button>

          <button
            type="button"
            onClick={onEdit}
            title="Edit staff"
            aria-label={`Edit ${member.fullName}`}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <Pencil size={17} />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              aria-label="More staff actions"
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <MoreHorizontal size={18} />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close actions menu"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setMenuOpen(false)}
                />

                <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => {
                      setMenuOpen(false);
                      onStatusChange();
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition disabled:opacity-50 ${
                      isActive
                        ? "text-red-600 hover:bg-red-50"
                        : "text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    {updating ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : isActive ? (
                      <Ban size={16} />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    {isActive ? "Suspend account" : "Activate account"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
