"use client";
import { useState } from "react";
import { FaBars } from "react-icons/fa";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Navbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getInitials = (name) => {
    if (!name) return "US";
    const names = name.split(" ");
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-500";
      case "guru":
        return "bg-blue-500";
      case "siswa":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
        >
          <FaBars className="h-5 w-5" />
        </button>

        <div className="flex-1 flex justify-end">
          {/* User profile dropdown */}
          <div className="relative">
            <button
              className="flex items-center space-x-2 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-expanded={isDropdownOpen}
              aria-label="User menu"
            >
              <div
                className={`w-10 h-10 ${getRoleColor(
                  user?.role
                )} rounded-full flex items-center justify-center text-white`}
              >
                {getInitials(user?.nama || user?.displayName)}
              </div>
              <div className="hidden md:flex md:flex-col md:items-start">
                <span className="font-medium">
                  {user?.nama || user?.displayName || "Pengguna"}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  {user?.role === "guru"
                    ? `Guru ${user?.mataPelajaran || ""}`
                    : user?.role === "siswa"
                    ? "Siswa"
                    : "Administrator"}
                </span>
              </div>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <div className="font-medium">
                    {user?.nama || user?.displayName}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {user?.role}
                  </div>
                </div>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
                  onClick={handleLogout}
                >
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
