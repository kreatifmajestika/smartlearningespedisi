"use client";
import { FaHome, FaUsersCog, FaBook, FaTasks, FaCog } from "react-icons/fa";
import SidebarBase from "./SidebarBase";
/* import { FaHome, FaUsers, FaBook, FaTasks, FaChartBar } from "react-icons/fa"; */

const menuItems = [
  { name: "Beranda", path: "/admin/dashboard", icon: FaHome },
  { name: "Manajemen Pengguna", path: "/admin/pengguna", icon: FaUsersCog },
  { name: "Materi", path: "/admin/materi", icon: FaBook },
  
];

export default function AdminSidebar({}) {
  return <SidebarBase menuItems={menuItems} />;
}
