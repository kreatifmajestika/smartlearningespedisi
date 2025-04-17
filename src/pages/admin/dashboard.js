"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

const StatCard = ({ title, value, icon, link }) => (
  <div className="bg-white rounded-lg shadow p-4 flex items-center">
    <div className="text-3xl mr-4">{icon}</div>
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      <a href={link} className="text-blue-600 hover:text-blue-800 text-sm">
        Lihat Detail
      </a>
    </div>
  </div>
);

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    users: 0,
    materials: 0,
    assignments: 0,
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }

    // Simulasi fetch data
    setTimeout(() => {
      setStats({
        users: 42,
        materials: 15,
        assignments: 8,
      });
    }, 500);

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
      second: "2-digit",
    });
  };

  if (loading || !user || user.role !== "admin") {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 md:ml-0 overflow-x-hidden">
      {/* Main Content */}
      <main className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6">
          Beranda
        </h1>
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <p className="text-gray-700 mb-2">
            Hello{" "}
            <span className="font-semibold">
              {user?.displayName || user?.nama || "Admin"}
            </span>
            ,<br />
            {user?.role === "admin"
              ? "Admin"
              : user?.subject
              ? `Guru ${user.subject}`
              : "Siswa"}
          </p>
          <p className="text-gray-500">{getCurrentDate()}</p>
        </div>
        {/* Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="Total Pengguna"
            value={stats.users}
            icon="👥"
            link="/pengguna"
          />
          <StatCard
            title="Total Materi"
            value={stats.materials}
            icon="📚"
            link="/materi"
          />
          <StatCard
            title="Total Tugas"
            value={stats.assignments}
            icon="📝"
            link="/tugas"
          />
        </div>
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Aktivitas Terkini</h2>
          <p className="text-gray-500">Belum ada aktivitas</p>
        </div>
      </main>
    </div>
  );
}
