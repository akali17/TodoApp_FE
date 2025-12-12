import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function Register() {
  const navigate = useNavigate();
  const { register, loading, error } = useAuthStore();

  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ok = await register(username, email, password);

    if (ok) navigate("/login");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form 
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-96"
      >
        <h1 className="text-2xl font-semibold mb-4">Register</h1>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <input
          type="text"
          className="border w-full p-2 rounded mb-3"
          placeholder="Username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="email"
          className="border w-full p-2 rounded mb-3"
          placeholder="Email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          className="border w-full p-2 rounded mb-3"
          placeholder="Password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          {loading ? "Loading..." : "Create Account"}
        </button>

        <p className="text-sm mt-3">
          Already have an account?{" "}
          <Link className="text-blue-600" to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
