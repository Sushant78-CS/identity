import { useEffect } from "react";
import { Navigate } from "react-router-dom";

import { useAuthStore } from "../../features/auth/auth.store";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({
  children,
}: ProtectedAdminRouteProps) {
  const status = useAuthStore((state) => state.status);
  const restoreSession = useAuthStore((state) => state.restoreSession);

  useEffect(() => {
    if (status === "idle") {
      void restoreSession();
    }
  }, [status, restoreSession]);

  if (status === "idle" || status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

          <p className="mt-4 text-sm text-gray-500">Checking your session...</p>
        </div>
      </div>
    );
  }

  if (status === "unavailable") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-5">
        <div className="max-w-sm text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Unable to restore your session
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Please check your connection and try again.
          </p>

          <button
            onClick={() => void restoreSession()}
            className="mt-5 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
