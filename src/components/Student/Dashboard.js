"use client";
import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";

const StudentDashboard = () => {
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const db = getDatabase();

    // Fetch materials
    const materialsRef = ref(db, "materials");
    onValue(materialsRef, (snapshot) => {
      const materialsData = snapshot.val() || {};
      setMaterials(Object.values(materialsData).slice(0, 3));
    });

    // Fetch assignments
    const assignmentsRef = ref(db, "assignments");
    onValue(assignmentsRef, (snapshot) => {
      const assignmentsData = snapshot.val() || {};
      setAssignments(Object.values(assignmentsData).slice(0, 3));
    });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard Siswa</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Materi Terbaru</h2>
          {materials.length > 0 ? (
            <ul className="space-y-3">
              {materials.map((material, index) => (
                <li key={index} className="border-b pb-3">
                  <h3 className="font-medium">{material.title}</h3>
                  <p className="text-sm text-gray-500">
                    {material.subject} •{" "}
                    {new Date(material.createdAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Belum ada materi</p>
          )}
          <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
            Lihat Semua Materi →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Tugas Terbaru</h2>
          {assignments.length > 0 ? (
            <ul className="space-y-3">
              {assignments.map((assignment, index) => (
                <li key={index} className="border-b pb-3">
                  <h3 className="font-medium">{assignment.title}</h3>
                  <p className="text-sm text-gray-500">
                    {assignment.subject} • Deadline:{" "}
                    {new Date(assignment.deadline).toLocaleDateString()}
                  </p>
                  <div className="mt-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        assignment.submitted
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {assignment.submitted ? "Terkumpul" : "Belum dikumpulkan"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Belum ada tugas</p>
          )}
          <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
            Lihat Semua Tugas →
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
