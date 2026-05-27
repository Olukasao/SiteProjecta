import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

type RoleRouteProps = {
  allowedRoles: string[];
  children: ReactNode;
};

function getStoredUser() {
  try {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return null;

    const parsed: unknown = JSON.parse(rawUser);
    if (parsed && typeof parsed === "object" && "role" in parsed) {
      return parsed as { role?: unknown };
    }
  } catch {
    return null;
  }

  return null;
}

export default function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const user = getStoredUser();
  const role = typeof user?.role === "string" ? user.role : "";

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/admin/imoveis" replace />;
  }

  return <>{children}</>;
}
