"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import UserManagement from "@/components/Admin/UserManagement";
import AdminLayout from "@/layouts/AdminLayout";
import AddUserForm from "@/components/Admin/AddUserForm";

const AdminPenggunaPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("list");

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Tab Content */}
      <div className="pt-4">
        {activeTab === "list" ? (
          <UserManagement currentAdmin={user} />
        ) : (
          <AddUserForm onSuccess={() => setActiveTab("list")} />
        )}
      </div>
    </div>
  );
};

export default AdminPenggunaPage;
