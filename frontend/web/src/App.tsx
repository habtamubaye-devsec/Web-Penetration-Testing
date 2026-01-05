
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Layouts
import PublicLayout from "./components/layout/PublicLayout";
import DashboardLayout from "./components/layout/DashboardLayout";

// Public Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import ServerError from "./pages/ServerError";

// User Pages
import Dashboard from "./pages/Dashboard";
import ScanSubmission from "./pages/ScanSubmission";
import ScanHistory from "./pages/ScanHistory";
import ScanResult from "./pages/ScanResult";
import UserProfile from "./pages/UserProfile";
import ResetPassword from "./pages/ResetPassword";
import OAuthCallback from "./pages/OAuthCallback";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminScans from "./pages/admin/AdminScans";
import AdminScanDetail from "./pages/admin/AdminScanDetail";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminScanningTools from "./pages/admin/AdminScanningTools";

// Route Guards
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminRoute from "./components/common/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/server-error" element={<ServerError />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/oauth/callback" element={<OAuthCallback />} />
              </Route>

              {/* Protected user routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/scan" element={<ScanSubmission />} />
                <Route path="/scan-history" element={<ScanHistory />} />
                <Route path="/scan-history/scan-result/:scanId" element={<ScanResult />} />
                <Route path="/profile" element={<UserProfile />} />
              </Route>

              {/* Admin routes */}
              <Route
                element={
                  <AdminRoute>
                    <DashboardLayout />
                  </AdminRoute>
                }
              >
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/users/:id" element={<AdminUserDetail />} />
                <Route path="/admin/scans" element={<AdminScans />} />
                <Route path="/admin/scans/:scanId" element={<AdminScanDetail />} />
                <Route path="/admin/tools" element={<AdminScanningTools />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>

              {/* Redirect to dashboard if user is logged in */}
              <Route
                path="/redirect"
                element={<Navigate to="/dashboard" />}
              />

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
