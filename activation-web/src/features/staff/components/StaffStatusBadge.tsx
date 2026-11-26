import { CheckCircle2, Clock3, Ban, CircleHelp } from "lucide-react";

interface Props {
  status: string;
}

const statusConfig: Record<
  string,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  ACTIVE: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    icon: CheckCircle2,
  },
  SUSPENDED: {
    label: "Suspended",
    className: "bg-red-50 text-red-700 ring-red-600/20",
    icon: Ban,
  },
  INACTIVE: {
    label: "Inactive",
    className: "bg-gray-100 text-gray-600 ring-gray-500/20",
    icon: Clock3,
  },
  PENDING: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 ring-amber-600/20",
    icon: Clock3,
  },
};

export default function StaffStatusBadge({ status }: Props) {
  const config = statusConfig[status.toUpperCase()] ?? {
    label: status.replaceAll("_", " "),
    className: "bg-gray-100 text-gray-600 ring-gray-500/20",
    icon: CircleHelp,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${config.className}`}
    >
      <Icon size={13} />
      {config.label}
    </span>
  );
}
