import { Users, UserCheck, UserX, GraduationCap } from "lucide-react";

import type { StudentListResponse } from "../students.types";

interface Props {
  students: StudentListResponse[];
  totalElements: number;
}

export default function StudentStats({ students, totalElements }: Props) {
  const active = students.filter(
    (student) => student.accountStatus.toUpperCase() === "ACTIVE",
  ).length;

  const inactive = students.filter((student) =>
    ["INACTIVE", "SUSPENDED"].includes(student.accountStatus.toUpperCase()),
  ).length;

  const cards = [
    {
      label: "Total students",
      value: totalElements,
      icon: Users,
      iconClass: "bg-gray-100 text-gray-700",
    },
    {
      label: "Active on this page",
      value: active,
      icon: UserCheck,
      iconClass: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Inactive on this page",
      value: inactive,
      icon: UserX,
      iconClass: "bg-red-50 text-red-700",
    },
    {
      label: "Current page records",
      value: students.length,
      icon: GraduationCap,
      iconClass: "bg-amber-50 text-amber-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-gray-500 sm:text-sm">
                {card.label}
              </p>

              <div className={`rounded-xl p-2 ${card.iconClass}`}>
                <Icon size={17} />
              </div>
            </div>

            <p className="mt-4 text-2xl font-semibold tracking-tight text-gray-900">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
