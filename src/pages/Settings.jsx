import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import axiosClient from "../api/axiosClient";

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [avatarMessage, setAvatarMessage] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Sync avatar whenever user changes (e.g., after page reload)
  useEffect(() => {
    if (user?.avatar) {
      setAvatarUrl(user.avatar);
    }
  }, [user?.avatar]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setProfileMessage("");
    setProfileError("");
    setPasswordMessage("");
    setPasswordError("");
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      setProfileError("");
      setProfileMessage("");

      if (!formData.username || !formData.email) {
        setProfileError("Username and email are required");
        return;
      }

      await axiosClient.put("/users/profile", {
        username: formData.username,
        email: formData.email,
      });

      setProfileMessage("✅ Profile updated successfully!");
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 2000);
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      setPasswordError("");
      setPasswordMessage("");

      if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
        setPasswordError("All password fields are required");
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setPasswordError("New passwords do not match");
        return;
      }

      if (formData.newPassword.length < 6) {
        setPasswordError("New password must be at least 6 characters");
        return;
      }

      await axiosClient.post("/users/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setPasswordMessage("✅ Password changed successfully!");
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("File size must be less than 5MB");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result;
      if (base64String) {
        setAvatarUrl(base64String);
        setAvatarError("");
      }
    };
    reader.onerror = () => {
      setAvatarError("Failed to read file");
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateAvatar = async () => {
    try {
      setLoading(true);
      setAvatarError("");
      setAvatarMessage("");

      if (!avatarUrl.trim()) {
        setAvatarError("Avatar URL cannot be empty");
        return;
      }

      const res = await axiosClient.put("/users/profile", {
        avatar: avatarUrl.trim(),
      });

      // Update user in store and localStorage BEFORE showing success
      if (res.data.user) {
        const updatedUser = res.data.user;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      
      setAvatarMessage("✅ Avatar updated successfully!");
    } catch (err) {
      setAvatarError(err.response?.data?.message || "Failed to update avatar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-700 mb-2 flex items-center gap-1"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Avatar Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Profile Avatar</h2>

          {/* Error/Success Message for Avatar */}
          {avatarMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-4">
              {avatarMessage}
            </div>
          )}
          {avatarError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
              {avatarError}
            </div>
          )}

          <div className="space-y-4">
            {/* Avatar Preview */}
            <div className="text-center">
              <img
                src={avatarUrl || `https://ui-avatars.com/api/?name=${user?.username}`}
                alt="Avatar"
                className="w-32 h-32 rounded-full mx-auto border-4 border-gray-200 object-cover"
              />
              <p className="text-gray-600 text-sm mt-2">Current Avatar</p>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload from File
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
              </p>
            </div>

            {/* Update Button */}
            <button
              onClick={handleUpdateAvatar}
              disabled={loading || !avatarUrl.trim()}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
            >
              {loading ? "Updating..." : "Update Avatar"}
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Profile Settings</h2>

          {/* Error/Success Message for Profile */}
          {profileMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-4">
              {profileMessage}
            </div>
          )}
          {profileError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
              {profileError}
            </div>
          )}

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email"
              />
            </div>

            {/* Update Button */}
            <button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Change Password</h2>

          {/* Error/Success Message for Password */}
          {passwordMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-4">
              {passwordMessage}
            </div>
          )}
          {passwordError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
              {passwordError}
            </div>
          )}

          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter current password"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new password"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm new password"
              />
            </div>

            {/* Change Password Button */}
            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
