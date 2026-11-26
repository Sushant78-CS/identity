import { useCallback, useEffect, useState } from "react";

import {
  Building2,
  CalendarDays,
  Globe,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { type ElementType } from "react";

import { profileService } from "../../features/profile/profile.service";
import type { CollegeAdminProfile } from "../../features/profile/profile.types";

function InfoItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: string | null;
  icon: ElementType;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-gray-100 p-2.5">
        <Icon size={18} className="text-gray-600" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-1 break-words text-sm font-medium text-gray-900">
          {value?.trim() || "Not provided"}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const active = status?.toUpperCase() === "ACTIVE";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-green-600" : "bg-gray-400"
        }`}
      />
      {status || "Unknown"}
    </span>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState<CollegeAdminProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await profileService.getProfile();

      setProfile(data);
    } catch (err) {
      console.error("Failed to load admin profile:", err);

      setError("Unable to load your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  if (loading && !profile) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />

        <div className="h-48 animate-pulse rounded-xl bg-gray-200" />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-64 animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <h2 className="font-semibold text-gray-900">Unable to load profile</h2>

        <p className="mt-2 text-sm text-gray-500">{error}</p>

        <button
          onClick={() => void fetchProfile()}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          <RefreshCw size={16} />
          Try again
        </button>
      </div>
    );
  }

  if (!profile) return null;

  const college = profile.college;

  const initials = profile.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const formattedDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not available";

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View your administrator and college information.
          </p>
        </div>

        <button
          onClick={() => void fetchProfile()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Administrator identity card */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gray-900 text-xl font-semibold text-white">
              {initials || "A"}
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-gray-900">
                {profile.fullName}
              </h2>

              <p className="mt-1 break-all text-sm text-gray-500">
                {profile.email}
              </p>

              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-gray-400">
                College Administrator
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={profile.status} />

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              {profile.role}
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Personal information */}
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-2.5">
              <UserRound size={19} className="text-gray-700" />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Personal Information
              </h3>
              <p className="text-xs text-gray-500">
                Your administrator details
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <InfoItem
              label="Full Name"
              value={profile.fullName}
              icon={UserRound}
            />

            <InfoItem label="Email Address" value={profile.email} icon={Mail} />

            <InfoItem
              label="Phone Number"
              value={profile.phoneNumber}
              icon={Phone}
            />

            <InfoItem
              label="Account Created"
              value={formattedDate}
              icon={CalendarDays}
            />
          </div>
        </section>

        {/* College information */}
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-2.5">
              <Building2 size={19} className="text-gray-700" />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                College Information
              </h3>
              <p className="text-xs text-gray-500">
                Your associated institution
              </p>
            </div>
          </div>

          {college ? (
            <>
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900">
                  {college.name}
                </h4>

                <p className="mt-1 text-sm text-gray-500">
                  College Code: {college.code}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <InfoItem
                  label="Official Email"
                  value={college.officialEmail}
                  icon={Mail}
                />

                <InfoItem
                  label="Contact Number"
                  value={college.contactNumber}
                  icon={Phone}
                />

                <InfoItem
                  label="Address"
                  value={[
                    college.address,
                    college.city,
                    college.state,
                    college.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                  icon={MapPin}
                />

                <InfoItem
                  label="Website"
                  value={college.websiteUrl}
                  icon={Globe}
                />

                <InfoItem
                  label="College Status"
                  value={college.status}
                  icon={ShieldCheck}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">
              No college information is associated with this account.
            </p>
          )}
        </section>
      </div>

      {/* Account information */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gray-100 p-2.5">
            <ShieldCheck size={19} className="text-gray-700" />
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">Account Information</h3>
            <p className="text-xs text-gray-500">Your account identification</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <InfoItem
            label="User ID"
            value={String(profile.userId)}
            icon={UserRound}
          />

          <InfoItem
            label="College ID"
            value={college ? String(college.id) : null}
            icon={Building2}
          />

          <InfoItem
            label="Account Status"
            value={profile.status}
            icon={ShieldCheck}
          />
        </div>
      </section>
    </div>
  );
}
