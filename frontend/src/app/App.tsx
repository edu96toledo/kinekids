// frontend/src/app/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import AuthGuard from "../guards/AuthGuard";
import RoleGuard from "../guards/RoleGuard";

// Core pages (placeholders for now)
import Login from "../routes/auth/Login";
import Register from "../routes/auth/Register";

// Parent area
import ChildrenList from "../routes/parent/ChildrenList";
import EvaluationWizard from "../routes/parent/EvaluationWizard";
import EvaluationHistory from "../routes/parent/EvaluationHistory";

// Clinician area
import ClinicianDashboard from "../routes/clinician/Dashboard";
import PatientList from "../routes/clinician/PatientList";
import EvaluationView from "../routes/clinician/EvaluationView";
import NotesEditor from "../routes/clinician/NotesEditor";

// SuperAdmin area
import UserManagement from "../routes/superadmin/UserManagement";
import FormBuilder from "../routes/superadmin/FormBuilder";
import StatsPanel from "../routes/superadmin/StatsPanel";

const App: React.FC = () => {
  const { token, role } = useAuthStore();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes – wrapped by AuthGuard */}
      <Route element={<AuthGuard token={token} />}>
        {/* Parent (Padre) */}
        <Route element={<RoleGuard allowedRoles={["Parent"]} userRole={role} />}>
          <Route path="/parent/children" element={<ChildrenList />} />
          <Route path="/parent/children/:childId/evaluate" element={<EvaluationWizard />} />
          <Route path="/parent/evaluations" element={<EvaluationHistory />} />
        </Route>

        {/* Clinician */}
        <Route element={<RoleGuard allowedRoles={["Clinician"]} userRole={role} />}>
          <Route path="/clinician/dashboard" element={<ClinicianDashboard />} />
          <Route path="/clinician/patients" element={<PatientList />} />
          <Route path="/clinician/evaluations/:id" element={<EvaluationView />} />
          <Route path="/clinician/evaluations/:id/notes" element={<NotesEditor />} />
        </Route>

        {/* SuperAdmin */}
        <Route element={<RoleGuard allowedRoles={["SuperAdmin"]} userRole={role} />}>
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/forms" element={<FormBuilder />} />
          <Route path="/admin/stats" element={<StatsPanel />} />
        </Route>
      </Route>

      {/* Catch‑all – redirect to login if not authenticated */}
      <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
    </Routes>
  );
};

export default App;
