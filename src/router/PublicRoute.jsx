import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function PublicRoute({ children }) {
  const { token } = useAuthStore();

  // Nếu đã login → chuyển thẳng về boards
  if (token) return <Navigate to="/boards" replace />;

  return children;
}
