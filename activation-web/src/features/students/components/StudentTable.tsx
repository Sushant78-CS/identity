import { Eye, GraduationCap, RefreshCw, Users } from "lucide-react";

import type { StudentListResponse } from "../students.types";
import StudentStatusBadge from "./StudentStatusBadge";

interface Props {
  students: StudentListResponse[];
  loading: boolean;
  error: string;
  page: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  onView: (student: StudentListResponse) => void;
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

export default function StudentTable({
  students,
  loading,
  error,
  page,
  pageSize,
  totalPages,
  totalElements,
  onView,
  onRefresh,
  onPageChange,
  onRetry,
}: Props) {
  const start = totalElements === 0 ? 0 : page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, totalElements);

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="flex flex-col justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-semibold text-gray-900">Student directory</h2>
          <p className="mt-1 text-xs text-gray-500">
            {totalElements} student{totalElements === 1 ? "" : "s"} found
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
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-gray-50/80 text-xs text-gray-500">
            <tr>
              <th className="px-5 py-3.5 font-medium">Student</th>
              <th className="px-5 py-3.5 font-medium">Student ID</th>
              <th className="px-5 py-3.5 font-medium">Department / Course</th>
              <th className="px-5 py-3.5 font-medium">Academic details</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 font-medium">Admission</th>
              <th className="px-5 py-3.5 text-right font-medium">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  {Array.from({ length: 7 }).map((__, cell) => (
                    <td key={cell} className="px-5 py-5">
                      <div className="h-4 animate-pulse rounded-md bg-gray-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                    <Users size={22} />
                  </div>

                  <p className="mt-4 font-medium text-gray-900">
                    No students found
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Try changing your search or status filter.
                  </p>
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr
                  key={student.id}
                  className="transition-colors hover:bg-gray-50/70"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {student.profileImageUrl ? (
                        <img
                          src={student.profileImageUrl}
                          alt=""
                          className="size-10 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xs font-semibold text-gray-700">
                          {getInitials(student.fullName)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">
                          {student.fullName}
                        </p>
                        <p className="mt-0.5 max-w-52 truncate text-xs text-gray-500">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-medium text-gray-700">
                      {student.studentId}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800">
                      {student.departmentName || "—"}
                    </p>
                    <p className="mt-1 max-w-48 truncate text-xs text-gray-500">
                      {student.courseName || "—"}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-gray-700">
                      {student.academicYear != null
                        ? `Year ${student.academicYear}`
                        : "—"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {student.semester != null
                        ? `Semester ${student.semester}`
                        : "—"}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <StudentStatusBadge status={student.accountStatus} />
                  </td>

                  <td className="px-5 py-4 text-gray-600">
                    {student.admissionYear ?? "—"}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onView(student)}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                    >
                      <Eye size={15} />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
        <p className="text-sm text-gray-500">
          Showing {start}–{end} of {totalElements}
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
