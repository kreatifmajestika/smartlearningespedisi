"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { database } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { renderElement, renderLeaf } from "@/components/Student/MateriRenderer";
import { Slate, withReact } from "slate-react";
import { createEditor } from "slate";
import { withHistory } from "slate-history";
import { Editable } from "slate-react";

export default function ViewMateri() {
  const { id } = useParams();
  const router = useRouter();
  const [materi, setMateri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editor] = useState(() => withHistory(withReact(createEditor())));

  useEffect(() => {
    const fetchMateri = async () => {
      try {
        const materiRef = ref(database, `materi/${id}`);
        const snapshot = await get(materiRef);

        if (snapshot.exists()) {
          const materiData = snapshot.val();
          setMateri({
            ...materiData,
            content: Array.isArray(materiData.content)
              ? materiData.content
              : defaultContent,
          });
        } else {
          setMateri(null);
        }
      } catch (error) {
        console.error("Error fetching materi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMateri();
  }, [id]);

  const defaultContent = [
    {
      type: "paragraph",
      children: [{ text: "Materi tidak tersedia atau format tidak valid" }],
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!materi) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Materi Tidak Ditemukan
        </h1>
        <p className="text-gray-600 mb-6">
          Materi dengan ID tersebut tidak ditemukan atau mungkin telah dihapus.
        </p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Kembali
          </button>
          <h1 className="text-xl font-semibold text-gray-800">
            Detail Materi Pembelajaran
          </h1>
          <div className="w-5"></div> {/* Spacer untuk balance */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Materi Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{materi.bab}</h1>
              <h2 className="text-xl text-gray-600 mt-1">{materi.subBab}</h2>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Kelas:</span> {materi.kelas}
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-medium">Mapel:</span> {materi.mapel}
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-medium">Semester:</span> {materi.semester}
              </div>
            </div>
          </div>
        </div>

        {/* Materi Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <Slate
            editor={editor}
            value={materi.content || defaultContent}
            onChange={() => {}}
          >
            <Editable
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              readOnly
              className="prose max-w-none"
            />
          </Slate>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={() => router.push(`/materi/${id}/edit`)}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
          >
            Edit Materi
          </button>
          {/* <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            Cetak Materi
          </button> */}
        </div>
      </main>
    </div>
  );
}
