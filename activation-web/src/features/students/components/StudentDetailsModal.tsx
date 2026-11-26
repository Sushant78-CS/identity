import {
  CalendarDays,
  GraduationCap,
  Hash,
  Mail,
  Phone,
  School,
  UserRound,
} from "lucide-react";

import type { StudentDetailsResponse } from "../students.types";

import StudentModal from "./StudentModal";
import StudentStatusBadge from "./StudentStatusBadge";

interface Props {
  student: StudentDetailsResponse;
  onClose: () => void;
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-gray-100 p-3.5">
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

function EnrollmentDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-900">{value || "—"}</p>
    </div>
  );
}

export default function StudentDetailsModal({ student, onClose }: Props) {
  const enrollment = student.currentEnrollment;

  return (
    <StudentModal
      title="Student profile"
      description="Personal and academic information."
      onClose={onClose}
    >
      <div className="space-y-6">
        {/* Student header */}
        <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
          {student.profileImageUrl ? (
            <img
              src={student.profileImageUrl}
              alt=""
              className="size-16 shrink-0 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white text-gray-600 shadow-sm">
              <UserRound size={28} />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-gray-900">
              {student.fullName}
            </h3>

            <p className="mt-1 font-mono text-xs text-gray-500">
              {student.studentId}
            </p>

            <div className="mt-2">
              <StudentStatusBadge status={student.accountStatus} />
            </div>
          </div>
        </div>

        {/* Personal information */}
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Personal information
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem
              icon={Mail}
              label="Email address"
              value={student.email}
            />

            <DetailItem
              icon={Phone}
              label="Phone number"
              value={student.phoneNumber || "Not provided"}
            />

            <DetailItem
              icon={Hash}
              label="Student ID"
              value={student.studentId}
            />

            <DetailItem
              icon={CalendarDays}
              label="Admission year"
              value={student.admissionYear?.toString() || "—"}
            />
          </div>
        </section>

        {/* Current enrollment */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <GraduationCap size={17} className="text-gray-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Current enrollment
            </h3>
          </div>

          {enrollment ? (
            <div className="rounded-2xl border border-gray-200 p-4">
              <div className="grid gap-5 sm:grid-cols-2">
                <EnrollmentDetail
                  label="Department"
                  value={enrollment.departmentName || "—"}
                />

                <EnrollmentDetail
                  label="Course"
                  value={enrollment.courseName || "—"}
                />

                <EnrollmentDetail
                  label="Academic year"
                  value={
                    enrollment.academicYear != null
                      ? `Year ${enrollment.academicYear}`
                      : "—"
                  }
                />

                <EnrollmentDetail
                  label="Semester"
                  value={
                    enrollment.semester != null
                      ? `Semester ${enrollment.semester}`
                      : "—"
                  }
                />

                <EnrollmentDetail
                  label="Enrollment status"
                  value={enrollment.status || "—"}
                />

                <EnrollmentDetail
                  label="Enrollment ID"
                  value={enrollment.enrollmentId?.toString() || "—"}
                />

                <EnrollmentDetail
                  label="Start date"
                  value={formatDate(enrollment.startDate)}
                />

                <EnrollmentDetail
                  label="End date"
                  value={formatDate(enrollment.endDate)}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
              <School size={24} className="mx-auto text-gray-400" />

              <p className="mt-3 text-sm font-medium text-gray-700">
                No current enrollment
              </p>

              <p className="mt-1 text-xs text-gray-500">
                No enrollment information is available for this student.
              </p>
            </div>
          )}
        </section>

        {/* Account information */}
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Account information
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem
              icon={CalendarDays}
              label="Account created"
              value={formatDate(student.createdAt)}
            />

            <DetailItem
              icon={CalendarDays}
              label="Last updated"
              value={formatDate(student.updatedAt)}
            />
          </div>
        </section>
      </div>
    </StudentModal>
  );
}
