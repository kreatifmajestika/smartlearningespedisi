"use client";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import { AuthProvider, useAuth } from "@/lib/auth"; // Added useAuth import
import { AdminAuthProvider } from "@/lib/adminAuth";
import "../styles/globals.css";
import { usePathname } from "next/navigation";
import AdminLayout from "@/layouts/AdminLayout";
import TeacherLayout from "@/layouts/TeacherLayout";
import StudentLayout from "@/layouts/StudentLayout";
import dynamic from "next/dynamic";

const LoadingSpinner = dynamic(() => import("@/components/LoadingSpinner"), {
  ssr: false,
});

// Create a separate component to use the useAuth hook
function AppContent({ Component, pageProps }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const getLayout = () => {
    if (user?.role === "admin" || pathname?.startsWith("/admin")) {
      return (
        <AdminAuthProvider>
          <AdminLayout>
            <Component {...pageProps} />
          </AdminLayout>
        </AdminAuthProvider>
      );
    }
    if (user?.role === "guru" || pathname?.startsWith("/guru")) {
      return (
        <TeacherLayout>
          <Component {...pageProps} />
        </TeacherLayout>
      );
    }
    if (user?.role === "siswa" || pathname?.startsWith("/siswa")) {
      return (
        <StudentLayout>
          <Component {...pageProps} />
        </StudentLayout>
      );
    }
    return <Component {...pageProps} />;
  };

  return getLayout();
}

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      Modal.setAppElement("#__next");
    }
  }, []);

  if (!mounted) {
    return <LoadingSpinner />;
  }

  return (
    <AuthProvider>
      <AppContent Component={Component} pageProps={pageProps} />
    </AuthProvider>
  );
}

MyApp.getInitialProps = async () => ({});

export default MyApp;
