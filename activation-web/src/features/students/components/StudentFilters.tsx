import type { FormEvent } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface Props {
  searchInput: string;
  status: string;
  onSearchInputChange: (value: string) => void;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
  onStatusChange: (value: string) => void;
  onClear: () => void;
}

export default function StudentFilters({
  searchInput,
  status,
  onSearchInputChange,
  onSearch,
  onStatusChange,
  onClear,
}: Props) {
  const hasFilters = Boolean(searchInput || status);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <form
          id="student-search-form"
          onSubmit={onSearch}
          className="relative flex-1"
        >
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Search by name, student ID or email..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 hover:bg-white focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <SlidersHorizontal
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <select
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-sm text-gray-700 outline-none transition hover:bg-gray-50 focus:border-gray-400 sm:w-44"
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          <button
            type="submit"
            form="student-search-form"
            className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Search
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <X size={15} />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
