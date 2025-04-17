"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { AdminSidebar } from "../components/Sidebar"; // Import named export
import { FaHome, FaUsersCog, FaBook, FaTasks, FaCog } from "react-icons/fa";

// Fallback component
const FallbackSidebar = () => (
  <div className="w-56 bg-white p-6">Loading sidebar...</div>
);

// Dynamic import untuk Navbar
const Navbar = dynamic(() => import("../components/Shared/Navbar"), {
  loading: () => <div className="bg-white p-4">Loading navbar...</div>,
  ssr: false,
});

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Menu items untuk admin
  const adminMenuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: FaHome },
    { name: "Pengguna", path: "/admin/users", icon: FaUsersCog },
    { name: "Materi", path: "/admin/materials", icon: FaBook },
    { name: "Tugas", path: "/admin/assignments", icon: FaTasks },
    { name: "Pengaturan", path: "/admin/setting", icon: FaCog },
  ];

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Admin Sidebar */}
      <AdminSidebar menuItems={adminMenuItems} />

      <div className="flex-1 overflow-x-hidden">
        {/* Navbar */}
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
