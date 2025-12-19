import { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import {jwtDecode} from "jwt-decode";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error, pendingEmail: storePendingEmail } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  // Update pendingEmail when store changes
  useEffect(() => {
    if (storePendingEmail) {
      setPendingEmail(storePendingEmail);
    }
  }, [storePendingEmail]);

  // --- LOGIN NORMAL ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setPendingEmail("");
    setResendMessage("");
    const ok = await login(email, password);
    if (ok) {
      navigate("/boards");
    }
  };

  // Resend verification email
  const handleResendVerification = async () => {
    if (!pendingEmail) return;
    try {
      setResendLoading(true);
      const res = await axiosClient.post("/users/resend-verification", { 
        email: pendingEmail 
      });
      setResendMessage("✅ Verification email sent! Check your inbox.");
    } catch (err) {
      setResendMessage("❌ " + (err.response?.data?.message || "Failed to resend email"));
    } finally {
      setResendLoading(false);
    }
  };

  // --- LOGIN GOOGLE ---
  const handleGoogleSuccess = async (response) => {
    try {
      const cred = response.credential;
      const ok = await useAuthStore.getState().googleLogin(cred);
      if (ok) {
        navigate("/boards");
      }
    } catch (err) {
      console.error("Google Login error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 animate-fade-in">
          {/* Header */}
          <div className="mb-8 animate-slide-down">
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                🚀 WWW
              </h1>
              <p className="text-gray-600 text-sm">Welcome back to your workspace</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6">
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded animate-shake">
                <p className="text-red-700 text-sm font-medium">{error}</p>
                {error.includes("verify your email") && (
                  <div className="mt-3 space-y-2">
                    <p className="text-red-600 text-xs">
                      📧 Check your email inbox for a verification link
                    </p>
                    {pendingEmail && (
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resendLoading}
                        className="w-full text-sm bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded font-medium transition disabled:bg-gray-200"
                      >
                        {resendLoading ? "Sending..." : "Resend Verification Email"}
                      </button>
                    )}
                    {resendMessage && (
                      <p className={`text-xs ${resendMessage.includes("✅") ? "text-green-600" : "text-red-600"}`}>
                        {resendMessage}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
            {/* Email Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-300 hover:border-gray-300 bg-gray-50 hover:bg-white"
              />
            </div>

            {/* Password Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-300 hover:border-gray-300 bg-gray-50 hover:bg-white"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Login */}
          <div className="flex justify-center mb-6 animate-fade-in animation-delay-300 w-full">
            <div style={{ width: "100%" }} className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.log("Google Login Failed")}
              />
            </div>
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-gray-600 animate-fade-in animation-delay-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-purple-600 transition-colors duration-300"
            >
              Sign up now
            </Link>
          </p>

          {/* Forgot Password Link */}
          <p className="text-center text-sm text-gray-600 mt-3 animate-fade-in animation-delay-600">
            <Link
              to="/forgot-password"
              className="font-semibold text-blue-600 hover:text-purple-600 transition-colors duration-300"
            >
              Forgot your password?
            </Link>
          </p>
        </div>

        {/* Footer Text */}
        <p className="text-center text-white/80 text-xs mt-8 animate-fade-in animation-delay-1000">
          © 2025 WWW. All rights reserved.
        </p>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-slide-down {
          animation: slide-down 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        .animation-delay-600 {
          animation-delay: 600ms;
        }
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
