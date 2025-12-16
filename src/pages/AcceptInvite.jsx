import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [board, setBoard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const acceptInvite = async () => {
      if (!token) {
        setError("Invalid invite link");
        setLoading(false);
        return;
      }

      try {
        const res = await axiosClient.post("/boards/accept-invite", { token });
        setMessage(res.data.message || "Successfully joined board!");
        setBoard(res.data.board);
        
        // Redirect to board after 3 seconds
        setTimeout(() => {
          navigate(`/boards/${res.data.board._id}`);
        }, 3000);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to accept invite");
      } finally {
        setLoading(false);
      }
    };

    acceptInvite();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Board Invitation</h1>

        {loading && (
          <div className="py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Processing your invitation...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {message && board && (
          <div className="py-6">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              ✅ {message}
            </div>
            <p className="text-gray-700 mb-6">
              You have successfully joined the board <strong>"{board.title}"</strong>
            </p>
            <p className="text-gray-600 text-sm">
              Redirecting to board in 3 seconds...
            </p>
          </div>
        )}

        {!loading && !message && (
          <div className="text-center">
            <Link to="/" className="text-blue-600 hover:underline">
              Go back to home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
