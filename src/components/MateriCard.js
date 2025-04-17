// src/components/MateriCard.js
"use client";
import Link from "next/link";

const MateriCard = ({ materi }) => {
  return (
    <Link href={`/student/materi/${materi.id}`} passHref>
      <div className="cursor-pointer bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow mb-3">
        <h3 className="font-bold text-lg">
          {materi.subBab || materi.bab || "Materi"}
        </h3>
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
          {materi.content?.[0]?.children?.[0]?.text || "Tidak ada deskripsi"}
        </p>
        <div className="mt-3 text-xs text-gray-500">
          <span>{materi.mapel}</span> • <span>Kelas {materi.kelas}</span> •{" "}
          <span>Semester {materi.semester}</span>
        </div>
      </div>
    </Link>
  );
};

export default MateriCard;
