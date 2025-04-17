// src/components/Sidebar/TeacherSidebar.js
"use client";
import SidebarBase from "./SidebarBase";
import { FaHome, FaBook, FaTasks, FaChartLine } from "react-icons/fa";

export default function TeacherSidebar({ isOpen, onClose }) {
  const menuItems = [
    { name: "Beranda", path: "/guru/dashboard", icon: FaHome },
    { name: "Materi", path: "/guru/materi", icon: FaBook },
    { name: "Tugas", path: "/guru/tugas", icon: FaTasks },
    { name: "Nilai", path: "/guru/nilai", icon: FaChartLine },
  ];

  return (
    <SidebarBase
      menuItems={menuItems}
      isOpen={isOpen}
      onClose={onClose}
      userRole="guru"
    />
  );
}
