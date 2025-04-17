"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../lib/auth";
import { getDatabase, ref, get } from "firebase/database";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (loading) return;

    const verifyAccess = async () => {
      try {
        // 1. Jika tidak ada user, redirect ke login
        if (!user) {
          router.push("/login");
          return;
        }

        // 2. Check custom claims (admin)
        const idTokenResult = await user.getIdTokenResult();
        const isAdmin = idTokenResult.claims.admin;

        // 3. Jika role admin sudah valid dari claims
        if (isAdmin && allowedRoles?.includes("admin")) {
          setAuthChecked(true);
          return;
        }

        // 4. Check Realtime Database sebagai fallback
        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const userData = snapshot.val();
          const userRole = userData?.role;

          // 5. Verifikasi role
          if (allowedRoles && !allowedRoles.includes(userRole)) {
            router.push("/unauthorized");
            return;
          }
        } else {
          // 6. Jika data tidak ditemukan di RTDB
          if (!isAdmin) {
            router.push("/unauthorized");
            return;
          }
        }

        setAuthChecked(true);
      } catch (error) {
        console.error("Access verification error:", error);
        router.push("/login");
      }
    };

    verifyAccess();
  }, [user, loading, router, allowedRoles]);

  if (loading || !authChecked) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
