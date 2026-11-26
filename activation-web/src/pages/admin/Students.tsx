import { useCallback, useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { GraduationCap, Users } from "lucide-react";

import { studentsService } from "../../features/students/students.service";

import type {
  StudentDetailsResponse,
  StudentListResponse,
} from "../../features/students/students.types";

import StudentStats from "../../features/students/components/StudentStats";
import StudentFilters from "../../features/students/components/StudentFilters";
import StudentTable from "../../features/students/components/StudentTable";
import StudentDetailsModal from "../../features/students/components/StudentDetailsModal";
import StudentModal from "../../features/students/components/StudentModal";

const PAGE_SIZE = 10;

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: string;
          detail?: string;
          error?: string;
        }
      | undefined;

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

export default function Students() {
  const [students, setStudents] = useState<StudentListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [selectedStudent, setSelectedStudent] =
    useState<StudentDetailsResponse | null>(null);

  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);

  const refreshStudents = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  // Fetch students
  useEffect(() => {
    let cancelled = false;

    async function fetchStudents() {
      setLoading(true);
      setError("");

      try {
        const response = await studentsService.getAllStudents({
          page,
          size: PAGE_SIZE,
          search: search || undefined,
          status: status || undefined,
        });

        if (cancelled) return;

        setStudents(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } catch (err) {
        if (cancelled) return;

        setError(getErrorMessage(err));
        setStudents([]);
        setTotalPages(0);
        setTotalElements(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStudents();

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

  // Clear filters
  const handleClearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setPage(0);
  };

  // View student details
  const handleViewStudent = async (student: StudentListResponse) => {
    setSelectedStudent(null);
    setDetailError("");
    setDetailLoading(true);

    try {
      const response = await studentsService.getStudentById(student.id);
      setSelectedStudent(response);
    } catch (err) {
      setDetailError(getErrorMessage(err));
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedStudent(null);
    setDetailError("");
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 pb-8">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-400">
            <GraduationCap size={14} />
            COLLEGE ADMINISTRATION
            <span>/</span>
            <span className="text-gray-600">Students</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">
            Student management
          </h1>

          <p className="mt-1.5 text-sm text-gray-500">
            View student records, academic information and account status.
          </p>
        </div>
      </div>

      {/* Student statistics */}
      <StudentStats students={students} totalElements={totalElements} />

      {/* Filters */}
      <StudentFilters
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

      {/* Student table */}
      <StudentTable
        students={students}
        loading={loading}
        error={error}
        page={page}
        pageSize={PAGE_SIZE}
        totalPages={totalPages}
        totalElements={totalElements}
        onView={handleViewStudent}
        onRefresh={refreshStudents}
        onPageChange={setPage}
        onRetry={refreshStudents}
      />

      {/* Loading details */}
      {detailLoading && (
        <StudentModal
          title="Loading student profile"
          onClose={() => setDetailLoading(false)}
        >
          <div className="flex items-center justify-center gap-3 py-8 text-sm text-gray-500">
            <div className="size-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
            Loading student details...
          </div>
        </StudentModal>
      )}

      {/* Details error */}
      {detailError && (
        <StudentModal
          title="Unable to load student profile"
          onClose={closeDetails}
        >
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
        </StudentModal>
      )}

      {/* Student details */}
      {selectedStudent && (
        <StudentDetailsModal student={selectedStudent} onClose={closeDetails} />
      )}
    </div>
  );
}
