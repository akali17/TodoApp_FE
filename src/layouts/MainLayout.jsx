import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function MainLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* NAVBAR */}
      <div className="bg-white shadow px-6 py-3 flex items-center justify-between">
        <Link to="/boards" className="text-xl font-semibold">
          🗂 My Boards
        </Link>

        <div className="flex items-center gap-3">
          <span className="font-medium">{user?.username}</span>
          <button 
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-auto p-6">
        <Outlet />
      </div>
    </div>
  );
}
