import { Link } from "react-router-dom";
import UserMenu from "./UserMenu";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/boards"
          className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition"
        >
          🚀 WWW
        </Link>

        {/* User Menu */}
        <UserMenu />
      </div>
    </nav>
  );
}
