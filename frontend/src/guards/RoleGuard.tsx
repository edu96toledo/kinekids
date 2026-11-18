// frontend/src/guards/RoleGuard.tsx
import React from "react";
import { Navigate } from "react-router-dom";

interface Props {
  allowedRoles: string[]; // e.g. ["Parent"]
  userRole: string | null;
  children?: React.ReactNode;
}

const RoleGuard: React.FC<Props> = ({ allowedRoles, userRole, children }) => {
  if (!userRole || !allowedRoles.includes(userRole)) {
    // redirect to a generic "unauthorized" page or login
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default RoleGuard;
