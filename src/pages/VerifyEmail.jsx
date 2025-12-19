import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const verifyEmail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.post("/users/verify-email", { token });
      setMessage(res.data.message || "Email verified successfully!");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify email");
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) {
      setError("Invalid verification link");
      setLoading(false);
      return;
    }

    verifyEmail();
  }, [token, verifyEmail]);

  const handleResendVerification = async () => {
    const email = prompt("Please enter your email address:");
    if (!email) return;

    try {
      setLoading(true);
      setError("");
      const res = await axiosClient.post("/users/resend-verification", { email });
      setMessage(res.data.message || "Verification email sent!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend verification email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          {loading ? (
            <div className="py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-gray-800">Verifying Email...</h1>
              <p className="text-gray-600 mt-2">Please wait while we verify your email address</p>
            </div>
          ) : message ? (
            <div>
              <div className="mb-4">
                <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Email Verified! ✅</h1>
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                {message}
              </div>
              <p className="text-gray-600 mb-4">Redirecting to login page...</p>
              <Link 
                to="/login"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Click here if not redirected automatically
              </Link>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Verification Failed</h1>
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
              <p className="text-gray-600 mb-4">
                The verification link may have expired or is invalid.
              </p>
              <div className="space-y-2">
                <button
                  onClick={handleResendVerification}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Resend Verification Email
                </button>
                <Link
                  to="/login"
                  className="block w-full text-center text-gray-600 hover:text-gray-800 py-2"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
