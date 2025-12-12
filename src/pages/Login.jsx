import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import {jwtDecode} from "jwt-decode";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loading, error } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- LOGIN NORMAL ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate("/boards");
  };

  // --- LOGIN GOOGLE ---
  const handleGoogleSuccess = async (response) => {
    try {
      const cred = response.credential;
      const userData = jwtDecode(cred); 

      const ok = await loginWithGoogle({
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
      });

      if (ok) navigate("/boards");
    } catch (err) {
      console.error("Google Login decode error:", err);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-96"
      >
        <h1 className="text-2xl font-semibold mb-4 text-center">Login</h1>

        {/* Error */}
        {error && <p className="text-red-500 mb-3 text-center">{error}</p>}

        {/* Email */}
        <input
          type="email"
          className="border w-full p-2 rounded mb-3"
          placeholder="Email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password */}
        <input
          type="password"
          className="border w-full p-2 rounded mb-3"
          placeholder="Password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* LOGIN BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Loading..." : "Login"}
        </button>

        {/* GOOGLE LOGIN */}
        <div className="mt-4 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log("Google Login Failed")}
          />
        </div>
      </form>
    </div>
  );
}
