import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import Login from "./pages/Login";
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
                <div>Dashboard Commercial (à venir)</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/chef_atelier"
            element={
              <ProtectedRoute>
                <div>Dashboard Chef d'atelier (à venir)</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/administrateur"
            element={
              <ProtectedRoute>
                <div>Dashboard Admin (à venir)</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;