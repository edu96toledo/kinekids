// frontend/src/guards/AuthGuard.tsx
import React from "react";
import { Navigate } from "react-router-dom";

interface Props {
  token: string | null;
  children?: React.ReactNode;
}

const AuthGuard: React.FC<Props> = ({ token, children }) => {
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default AuthGuard;
