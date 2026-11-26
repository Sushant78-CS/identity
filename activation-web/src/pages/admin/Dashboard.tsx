import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  Building2,
  GraduationCap,
  RefreshCw,
  ScanLine,
  UserCheck,
  Users,
} from "lucide-react";

import { dashboardService } from "../../features/dashboard/dashboard.service";
import type { CollegeAdminDashboard } from "../../features/dashboard/dashboard.types";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
}

function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>

        <div className="rounded-lg bg-gray-100 p-2.5">
          <Icon size={20} className="text-gray-700" />
        </div>
      </div>

      <h3 className="mt-5 text-3xl font-semibold tracking-tight text-gray-900">
        {value.toLocaleString("en-IN")}
      </h3>

      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<CollegeAdminDashboard | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await dashboardService.getDashboard();

      setDashboard(data);
    } catch (err) {
      console.error("Dashboard loading failed:", err);

      setError("Unable to load dashboard information. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const stats = dashboard
    ? [
        {
          title: "Total Students",
          value: dashboard.totalStudents,
          icon: GraduationCap,
          description: "Registered student accounts",
        },
        {
          title: "Active Students",
          value: dashboard.activeStudents,
          icon: UserCheck,
          description: "Currently active students",
        },
        {
          title: "Total Staff",
          value: dashboard.totalStaff,
          icon: Users,
          description: "Registered staff accounts",
        },
        {
          title: "Active Staff",
          value: dashboard.activeStaff,
          icon: UserCheck,
          description: "Currently active staff",
        },
        {
          title: "Departments",
          value: dashboard.totalDepartments,
          icon: Building2,
          description: "College departments",
        },
        {
          title: "Courses",
          value: dashboard.totalCourses,
          icon: BookOpen,
          description: "Available college courses",
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Overview of your college's identity management.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchDashboard()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-red-700">{error}</p>

          <button
            type="button"
            onClick={() => void fetchDashboard()}
            className="text-sm font-semibold text-red-700 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {loading && !dashboard ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-xl border border-gray-200 bg-gray-100"
            />
          ))}
        </div>
      ) : dashboard ? (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-gray-100 p-3">
                <ScanLine size={24} className="text-gray-800" />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Today's Verifications
                </p>

                <h2 className="mt-1 text-3xl font-semibold text-gray-900">
                  {dashboard.todayVerifications.toLocaleString("en-IN")}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Student identity verifications performed today
                </p>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
