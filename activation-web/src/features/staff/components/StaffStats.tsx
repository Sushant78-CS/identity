import { Users, UserCheck, UserX, ShieldCheck } from "lucide-react";
import type { StaffResponse } from "../staff.types";

interface Props {
  staff: StaffResponse[];
  totalElements: number;
}

export default function StaffStats({ staff, totalElements }: Props) {
  const active = staff.filter(
    (member) => member.status.toUpperCase() === "ACTIVE",
  ).length;

  const suspended = staff.filter(
    (member) => member.status.toUpperCase() === "SUSPENDED",
  ).length;

  const cards = [
    {
      label: "Total staff",
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
      label: "Suspended on this page",
      value: suspended,
      icon: UserX,
      iconClass: "bg-red-50 text-red-700",
    },
    {
      label: "Staff records",
      value: staff.length,
      icon: ShieldCheck,
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
