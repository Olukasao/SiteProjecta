import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }: any) {
  const token = localStorage.getItem("token");

  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}