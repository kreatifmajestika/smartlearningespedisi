"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { getDatabase, ref, onValue } from "firebase/database";
import { auth } from "@/lib/firebase";
import StudentLayout from "@/layouts/StudentLayout"; // Pastikan path ini benar

const StatCard = ({ title, value, icon, link }) => (
  <div className="bg-white rounded-lg shadow p-6 flex items-center">
    <div className="text-4xl mr-4">{icon}</div>
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      {link && (
        <a href={link} className="text-blue-600 hover:text-blue-800 text-sm">
          Lihat Detail
        </a>
      )}
    </div>
  </div>
);

export default function StudentDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    materials: 0,
    assignments: 0,
    subject: "",
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!loading && (!user || user.role !== "guru")) {
      router.push("/login");
    }

    const db = getDatabase();
    const userId = auth.currentUser?.uid;

    if (!userId) return;

    // Fetch teacher's data from Firebase
    const studentRef = ref(db, `users/${userId}`);
    onValue(studentRef, (snapshot) => {
      const studentData = snapshot.val();
      if (studentData) {
        setStats((prev) => ({
          ...prev,
          subject: studentData.subject || studentData.mataPelajaran || "",
        }));
      }
    });

    // Fetch student's material count
    const materialsRef = ref(db, "materials");
    onValue(materialsRef, (snapshot) => {
      const materials = snapshot.val() || {};
      const studentMaterials = Object.values(materials).filter(
        (m) => m.studentId === userId
      ).length;
      setStats((prev) => ({ ...prev, materials: studentMaterials }));
    });

    // Fetch student's assignment count
    const assignmentsRef = ref(db, "assignments");
    onValue(assignmentsRef, (snapshot) => {
      const assignments = snapshot.val() || {};
      const studentAssignments = Object.values(assignments).filter(
        (a) => a.studentId === userId
      ).length;
      setStats((prev) => ({ ...prev, assignments: studentAssignments }));
    });

    // Update waktu setiap detik
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [user, loading, router]);

  const getCurrentDate = () => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date().toLocaleDateString("id-ID", options);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading || !user || user.role !== "siswa") {
    return (
      <StudentLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <main className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6">
          Dashboard Siswa
        </h1>

        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <p className="text-gray-700 mb-2">
            Halo{" "}
            <span className="font-semibold">
              {user?.nama || user?.displayName || "Siswa"}
            </span>
            ,<br />
            {stats.subject ? `Siswa ${stats.subject}` : "Siswa"}
          </p>
          <p className="text-gray-500">{getCurrentDate()}</p>
          <p className="text-gray-500 mt-2">
            Waktu sekarang: {formatTime(currentTime)}
          </p>
        </div>

        {/* Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <StatCard
            title="Materi Anda"
            value={stats.materials}
            icon="📚"
            link="/siswa/materi"
          />
          <StatCard
            title="Tugas Anda"
            value={stats.assignments}
            icon="📝"
            link="/siswa/tugas"
          />
        </div>

        {/* Quick Actions and Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3">Aksi Cepat</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                Tambah Materi Baru
              </button>
              <button className="w-full text-left p-2 bg-green-50 text-green-600 rounded hover:bg-green-100">
                Buat Tugas Baru
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3">Aktivitas Terkini</h3>
            <p className="text-gray-500">Belum ada aktivitas</p>
          </div>
        </div>
      </main>
    </StudentLayout>
  );
}
