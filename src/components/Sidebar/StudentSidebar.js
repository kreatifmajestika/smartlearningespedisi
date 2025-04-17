"use client";
import SidebarBase from "./SidebarBase";
import { FaHome, FaBook, FaTasks } from "react-icons/fa";

export default function TeacherSidebar({ isOpen, onClose }) {
  const menuItems = [
    { name: "Beranda", path: "/siswa/dashboard", icon: FaHome },
    { name: "Materi", path: "/siswa/materi", icon: FaBook },
    { name: "Tugas", path: "/siswa/tugas", icon: FaTasks },
  ];

  return (
    <SidebarBase menuItems={menuItems} isOpen={isOpen} onClose={onClose} />
  );
}
