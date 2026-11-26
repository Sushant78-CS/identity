import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { AnimatePresence, motion } from "framer-motion";

// Public components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Public pages
import HomePage from "./pages/HomePage";
import ActivateAccount from "./pages/ActivateAccount";

// Admin components
import AdminLayout from "./layouts/AdminLayout";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import Students from "./pages/admin/Students";
import StudentImport from "./pages/admin/StudentImport";
import Staff from "./pages/admin/Staff";
import Settings from "./pages/admin/Settings";
import Profile from "./pages/admin/Profile";

function PublicLayout() {
  return (
    <>
      <Navbar />
      <HomePage />
      <Footer />
    </>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public website */}
        <Route
          path="/"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <PublicLayout />
            </motion.div>
          }
        />

        {/* Student activation */}
        <Route path="/activate" element={<ActivateAccount />} />

        {/* College Admin login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected College Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />

          <Route path="dashboard" element={<Dashboard />} />

          <Route path="profile" element={<Profile />} />

          <Route path="students" element={<Students />} />

          <Route path="students/import" element={<StudentImport />} />

          <Route path="staff" element={<Staff />} />

          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
