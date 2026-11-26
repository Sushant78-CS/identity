import { useCallback, useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { Plus, Users } from "lucide-react";

import { staffService } from "../../features/staff/staff.service";

import type {
  AccountStatus,
  CreateStaffRequest,
  StaffResponse,
  UpdateStaffRequest,
} from "../../features/staff/staff.types";

import StaffStats from "../../features/staff/components/StaffStats";
import StaffFilters from "../../features/staff/components/StaffFilters";
import StaffTable from "../../features/staff/components/StaffTable";
import StaffFormModal from "../../features/staff/components/StaffFormModal";
import StaffDetailsModal from "../../features/staff/components/StaffDetailsModal";
import StaffConfirmDialog from "../../features/staff/components/StaffConfirmDialog";
import StaffModal from "../../features/staff/components/StaffModal";

const PAGE_SIZE = 10;

const emptyCreateForm: CreateStaffRequest = {
  fullName: "",
  email: "",
  phoneNumber: "",
  initialPassword: "",
};

const emptyUpdateForm: UpdateStaffRequest = {
  fullName: "",
  email: "",
  phoneNumber: "",
};

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: string;
          detail?: string;
          error?: string;
          errors?: Record<string, string>;
        }
      | undefined;

    if (data?.errors) {
      return Object.values(data.errors).join(", ");
    }

    return (
      data?.message ||
      data?.detail ||
      data?.error ||
      error.message ||
      "Something went wrong. Please try again."
    );
  }

  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export default function Staff() {
  const [staff, setStaff] = useState<StaffResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [formStaff, setFormStaff] = useState<StaffResponse | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [selectedStaff, setSelectedStaff] = useState<StaffResponse | null>(
    null,
  );
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [statusTarget, setStatusTarget] = useState<StaffResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const refreshStaff = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchStaff() {
      setLoading(true);
      setError("");

      try {
        const response = await staffService.getAllStaff({
          page,
          size: PAGE_SIZE,
          search: search || undefined,
          status: status || undefined,
        });

        if (cancelled) return;

        setStaff(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } catch (err) {
        if (cancelled) return;

        setError(getErrorMessage(err));
        setStaff([]);
        setTotalPages(0);
        setTotalElements(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStaff();

    return () => {
      cancelled = true;
    };
  }, [page, search, status, reloadKey]);

  // Search
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setPage(0);
  };

  // Create and edit
  const openCreateForm = () => {
    setFormStaff(null);
    setFormError("");
    setFormMode("create");
  };

  const openEditForm = (member: StaffResponse) => {
    setFormStaff(member);
    setFormError("");
    setFormMode("edit");
    setSelectedStaff(null);
  };

  const closeForm = () => {
    if (formLoading) return;

    setFormMode(null);
    setFormStaff(null);
    setFormError("");
  };

  const handleFormSubmit = async (
    values: CreateStaffRequest | UpdateStaffRequest,
  ) => {
    setFormError("");
    setSuccessMessage("");

    try {
      setFormLoading(true);

      if (formMode === "create") {
        await staffService.createStaff(values as CreateStaffRequest);
        setSuccessMessage("Staff account created successfully.");
        setSearch("");
        setSearchInput("");
        setStatus("");
        setPage(0);
      } else if (formMode === "edit" && formStaff) {
        await staffService.updateStaff(
          formStaff.id,
          values as UpdateStaffRequest,
        );

        setSuccessMessage("Staff details updated successfully.");
      }

      setFormMode(null);
      setFormStaff(null);
      refreshStaff();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  // View staff
  const handleViewStaff = async (member: StaffResponse) => {
    setDetailError("");
    setDetailLoading(true);
    setSelectedStaff(null);

    try {
      const response = await staffService.getStaffById(member.id);
      setSelectedStaff(response);
    } catch (err) {
      setDetailError(getErrorMessage(err));
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedStaff(null);
    setDetailError("");
  };

  // Activate and suspend
  const handleStatusChange = async () => {
    if (!statusTarget) return;

    const nextStatus: AccountStatus =
      statusTarget.status.toUpperCase() === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    try {
      setStatusLoading(true);
      setSuccessMessage("");

      await staffService.updateStaffStatus(statusTarget.id, {
        status: nextStatus,
      });

      setSuccessMessage(
        `${statusTarget.fullName}'s account was ${
          nextStatus === "ACTIVE" ? "activated" : "suspended"
        } successfully.`,
      );

      setStatusTarget(null);
      refreshStaff();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setStatusLoading(false);
    }
  };

  const statusAction =
    statusTarget?.status.toUpperCase() === "ACTIVE" ? "suspend" : "activate";

  const formInitialValues: CreateStaffRequest | UpdateStaffRequest =
    formMode === "edit" && formStaff
      ? {
          fullName: formStaff.fullName,
          email: formStaff.email,
          phoneNumber: formStaff.phoneNumber || "",
        }
      : emptyCreateForm;

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 pb-8">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-400">
            <Users size={14} />
            COLLEGE ADMINISTRATION
            <span>/</span>
            <span className="text-gray-600">Staff</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">
            Staff management
          </h1>

          <p className="mt-1.5 text-sm text-gray-500">
            Manage staff accounts, profile information and access status.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200"
        >
          <Plus size={17} />
          Add staff member
        </button>
      </div>

      {/* Success message */}
      {successMessage && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <p>{successMessage}</p>

          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="shrink-0 rounded-lg px-2 py-1 text-emerald-700 hover:bg-emerald-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary cards */}
      {/* <StaffStats staff={staff} totalElements={totalElements} /> */}

      {/* Filters */}
      <StaffFilters
        searchInput={searchInput}
        status={status}
        onSearchInputChange={setSearchInput}
        onSearch={handleSearch}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(0);
        }}
        onClear={handleClearFilters}
      />

      {/* Directory */}
      <StaffTable
        staff={staff}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        updatingStatusId={statusLoading ? (statusTarget?.id ?? null) : null}
        onView={handleViewStaff}
        onEdit={openEditForm}
        onStatusChange={setStatusTarget}
        onRefresh={refreshStaff}
        onPageChange={setPage}
        onRetry={refreshStaff}
      />

      {/* Create / edit dialog */}
      {formMode && (
        <StaffFormModal
          key={`${formMode}-${formStaff?.id ?? "new"}`}
          mode={formMode}
          initialValues={formInitialValues}
          loading={formLoading}
          error={formError}
          onClose={closeForm}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Staff details dialog */}
      {detailLoading && (
        <StaffModal
          title="Loading staff profile"
          onClose={() => setDetailLoading(false)}
        >
          <div className="flex items-center justify-center gap-3 py-8 text-sm text-gray-500">
            <div className="size-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
            Loading staff details...
          </div>
        </StaffModal>
      )}

      {detailError && (
        <StaffModal title="Unable to load staff profile" onClose={closeDetails}>
          <p role="alert" className="text-sm text-red-700">
            {detailError}
          </p>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={closeDetails}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </StaffModal>
      )}

      {selectedStaff && (
        <StaffDetailsModal
          staff={selectedStaff}
          onClose={closeDetails}
          onEdit={() => openEditForm(selectedStaff)}
        />
      )}

      {/* Status confirmation */}
      <StaffConfirmDialog
        open={Boolean(statusTarget)}
        loading={statusLoading}
        action={statusAction}
        staffName={statusTarget?.fullName ?? ""}
        onClose={() => {
          if (!statusLoading) setStatusTarget(null);
        }}
        onConfirm={handleStatusChange}
      />
    </div>
  );
}
