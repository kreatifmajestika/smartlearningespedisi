"use client";
import { auth, database, ref, get } from "./firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import nextRouter from "next/router";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const currentPath = nextRouter.pathname;

  const redirectToDashboard = async (role) => {
    try {
      const dashboardPath =
        role === "admin"
          ? "/admin/dashboard"
          : role === "guru"
          ? "/guru/dashboard"
          : role === "siswa"
          ? "/siswa/dashboard"
          : null;

      if (dashboardPath === null) {
        return;
      }

      if (
        typeof window !== "undefined" &&
        window.location.pathname !== dashboardPath
      ) {
        await router.push(dashboardPath);
      }
    } catch (error) {
      console.error("Redirect error:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const notRedirectPathList = ["/login", "/"];

      if (notRedirectPathList.includes(currentPath)) {
        return;
      }

      try {
        if (firebaseUser) {
          const idTokenResult = await firebaseUser.getIdTokenResult();

          if (idTokenResult.claims.admin) {
            const adminUser = {
              ...firebaseUser,
              role: "admin",
              nama: "Administrator",
            };
            setUser(adminUser);
            await redirectToDashboard("admin");
          } else {
            const userRef = ref(database, `users/${firebaseUser.uid}`);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
              const userData = snapshot.val();
              const role = userData.role || "siswa";
              const userWithRole = {
                ...firebaseUser,
                uid: firebaseUser.uid,
                role,
                nama: userData.nama || firebaseUser.displayName || "Pengguna",
                mataPelajaran: userData.mataPelajaran || "",
                kelas: userData.kelas || "",
                status: userData.status || "active",
              };
              setUser(userWithRole);

              if (currentPath === nextRouter.pathname) {
                return;
              }

              await redirectToDashboard(role);
            } else {
              console.warn("User data not found in database");
              await signOut(auth);
              setUser(null);
            }
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [router]);

  const login = async (email, password) => {
    try {
      // Validasi input
      if (!email || !password) {
        throw new Error("Email dan password wajib diisi");
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Format email tidak valid");
      }

      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      ).catch(async (error) => {
        let message = "Gagal login";
        switch (error.code) {
          case "auth/invalid-credential":
          case "auth/wrong-password":
            message = "Kombinasi email dan password salah";
            break;
          case "auth/user-not-found":
            message = "Email tidak terdaftar";
            break;
          case "auth/user-disabled":
            message = "Akun dinonaktifkan";
            break;
          case "auth/too-many-requests":
            message = "Terlalu banyak percobaan gagal. Coba lagi nanti";
            break;
          default:
            message = error.message;
        }

        //throw new Error(message);
        return alert(message);
      });

      if (!userCredential?.user) {
        return;
      }

      const user = userCredential?.user;
      const idTokenResult = await user.getIdTokenResult();

      if (idTokenResult.claims.admin) {
        const adminUser = {
          ...user,
          role: "admin",
          nama: "Administrator",
        };
        setUser(adminUser);
        await redirectToDashboard("admin");
        return { success: true, user: adminUser };
      }

      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        const role = userData.role || "siswa";
        const userWithRole = {
          ...user,
          role,
          nama: userData.nama || user.displayName || "Pengguna",
          mataPelajaran: userData.mataPelajaran || "",
          kelas: userData.kelas || "",
          status: userData.status || "active",
        };
        setUser(userWithRole);
        await redirectToDashboard(role);
        return { success: true, user: userWithRole };
      }

      await signOut(auth);
      return {
        success: false,
        message: "Data pengguna tidak ditemukan di database",
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.message,
        code: error.code || "unknown_error",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      router.push("/login");
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, message: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
