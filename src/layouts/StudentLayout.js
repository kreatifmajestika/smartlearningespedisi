"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamic import dengan fallback untuk komponen yang mungkin bermasalah
const TeacherSidebar = dynamic(
  () => import("@/components/Sidebar/StudentSidebar"),
  {
    loading: () => <div>Loading sidebar...</div>,
    ssr: false,
  }
);

const Navbar = dynamic(() => import("@/components/Shared/Navbar"), {
  loading: () => <div>Loading navbar...</div>,
  ssr: false,
});

export default function TeacherLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* TeacherSidebar dengan props yang diperlukan */}
      <TeacherSidebar isOpen={sidebarOpen} onClose={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
