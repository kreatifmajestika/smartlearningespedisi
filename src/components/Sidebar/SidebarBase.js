"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaBars, FaTimes } from "react-icons/fa";
import Image from "next/image";

const NavItem = ({ icon: Icon, text, path, active, onClick }) => {
  return (
    <Link
      href={path}
      onClick={onClick}
      className={`flex items-center space-x-2 p-3 rounded-md cursor-pointer transition-colors ${
        active
          ? "bg-blue-100 text-blue-600 font-semibold"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{text}</span>
    </Link>
  );
};

export default function SidebarBase({
  menuItems,
  isOpen,
  onClose,
  userData,
  onLogout,
  logoutIcon,
  logoutText,
}) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const handleNavigation = () => {
    if (isMobile) {
      onClose?.();
    }
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
        onClick={() => onClose(!isOpen)}
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transform transition-transform duration-300 ease-in-out fixed md:relative w-56 bg-white shadow-md p-6 flex flex-col min-h-screen z-40`}
      >
        <div className="flex items-center justify-center mb-6">
          <Image
            src="/logosmp.png"
            alt="Logo Sekolah"
            width={80} // Tetap pertahankan width
            height={80} // Tambahkan height yang sesuai
            className="w-20 h-auto" // Gunakan h-auto untuk maintain aspect ratio
            priority // Tambahkan priority untuk LCP
          />
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-4 flex-1">
          {menuItems.map((item) => (
            <NavItem
              key={item.path}
              icon={item.icon}
              text={item.name}
              path={item.path}
              active={router.pathname === item.path}
              onClick={handleNavigation}
            />
          ))}
        </nav>

        {/* User Info and Logout */}
        {userData && onLogout && (
          <div className="mt-auto pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {userData.initial}
              </div>
              <div>
                <p className="font-medium text-sm">{userData.name}</p>
                {userData.role && (
                  <p className="text-xs text-gray-500">{userData.role}</p>
                )}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 w-full p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              {logoutIcon}
              <span>{logoutText}</span>
            </button>
          </div>
        )}
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => onClose(false)}
        />
      )}
    </>
  );
}
