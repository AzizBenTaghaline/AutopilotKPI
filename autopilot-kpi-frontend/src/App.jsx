import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import CommercialDashboard from "./pages/dashboards/CommercialDashboard";
import ProtectedRoute from "./auth/ProtectedRoute";
import ChefAtelierDashboard from "./pages/dashboards/ChefAtelierDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import Login from "./pages/Login";
import KpiManagement from "./pages/KpiManagement";
import UserManagement from "./pages/UserManagement";
import ManagerDashboard from "./pages/dashboards/ManagerDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard/manager"
            element={
              <ProtectedRoute>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/commercial"
            element={
              <ProtectedRoute>
                <CommercialDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/chef_atelier"
            element={
              <ProtectedRoute>
                <ChefAtelierDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/administrateur"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kpi-management"
            element={
              <ProtectedRoute allowedRoles={["administrateur", "manager"]}>
                <KpiManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management"
            element={
              <ProtectedRoute allowedRoles={["administrateur"]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
