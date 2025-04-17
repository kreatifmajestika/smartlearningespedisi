"use client";
import { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import BottomNav from "@/components/BottomNav/BottomNav";
import { FaChevronDown } from "react-icons/fa";
import MateriCard from "@/components/MateriCard"; // Import komponen MateriCard

export default function Home() {
  const [listMateri, setMaterials] = useState([]);
  const [selectedMapel, setSelectedMapel] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [filteredMateri, setFilteredMateri] = useState([]);
  const [expandedBab, setExpandedBab] = useState(null);
  const [selectedSubBab, setSelectedSubBab] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase();
    const materialsRef = ref(db, "materi");

    onValue(materialsRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Data dari Firebase:", data);

      if (data) {
        const materiArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
          // Normalisasi field kelas (mungkin ada typo di database)
          kelas: data[key].kclass || data[key].kelas || "",
        }));
        setMaterials(materiArray);
      } else {
        setMaterials([]);
      }
      setLoading(false);
    });
  }, []);

  // Filter materi berdasarkan pilihan
  useEffect(() => {
    if (selectedMapel && selectedKelas && selectedSemester) {
      const filtered = listMateri.filter(
        (materi) =>
          materi.mapel?.toLowerCase() === selectedMapel.toLowerCase() &&
          materi.kelas?.toString() ===
            selectedKelas.toLowerCase().replace("kelas ", "") &&
          materi.semester?.toString() ===
            selectedSemester.toLowerCase().replace("semester ", "")
      );
      console.log("Materi yang difilter:", filtered);
      setFilteredMateri(filtered);
    } else {
      setFilteredMateri([]);
    }
    setExpandedBab(null);
    setSelectedSubBab(null);
  }, [selectedMapel, selectedKelas, selectedSemester, listMateri]);

  // Fungsi untuk menangani perubahan dropdown
  const handleMapelChange = (e) => setSelectedMapel(e.target.value);
  const handleKelasChange = (e) => setSelectedKelas(e.target.value);
  const handleSemesterChange = (e) => setSelectedSemester(e.target.value);

  const toggleBab = (bab) => {
    setExpandedBab(expandedBab === bab ? null : bab);
    setSelectedSubBab(null);
  };

  const handleSubBabClick = (subBab) => {
    setSelectedSubBab(subBab);
  };

  // Kelompokkan materi berdasarkan bab
  const groupedMateri = filteredMateri.reduce((acc, materi) => {
    const babKey = materi.bab || "Umum"; // Fallback jika bab tidak ada
    if (!acc[babKey]) {
      acc[babKey] = {
        subBabs: [],
      };
    }
    acc[babKey].subBabs.push({
      id: materi.id,
      judul: materi.subBab || materi.bab || "Materi",
      isiMateri: materi.content || materi.isiMateri || "", // Perhatikan field 'content'
      embed: materi.embed,
      gambar: materi.gambar,
    });
    return acc;
  }, {});

  function renderListMateri() {
    if (loading) {
      return <div className="text-center my-4">Memuat data...</div>;
    }

    if (listMateri.length === 0) {
      return <div className="text-center my-4">Tidak ada materi tersedia</div>;
    }

    if (!selectedMapel || !selectedKelas || !selectedSemester) {
      return (
        <div className="text-center my-4">
          Silakan pilih Mapel, Kelas, dan Semester untuk melihat materi
        </div>
      );
    }

    if (filteredMateri.length === 0) {
      return (
        <div className="text-center my-4">
          Tidak ada materi yang tersedia untuk {selectedMapel} Kelas{" "}
          {selectedKelas.replace("kelas ", "")} Semester{" "}
          {selectedSemester.replace("semester ", "")}
        </div>
      );
    }

    return (
      <div className="w-full max-w-xs mt-4">
        {/* <h1 className="text-lg font-semibold mb-2">Materi yang tersedia:</h1> */}
        <div className="space-y-3">
          {filteredMateri.map((materi) => (
            <MateriCard key={materi.id} materi={materi} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col items-center min-h-screen bg-gray-200 px-4 pt-4 pb-16">
        {/* Dropdown untuk Pilih Mapel dan Kelas */}
        <div className="flex gap-2 w-full max-w-xs">
          <select
            value={selectedMapel}
            onChange={handleMapelChange}
            className="flex-1 bg-white px-4 py-2 rounded-lg shadow text-center"
          >
            <option value="">Pilih Mapel</option>
            <option value="bahasa inggris">Bahasa Inggris</option>
            <option value="bahasa indonesia">Bahasa Indonesia</option>
            <option value="pkn">PKN</option>
            <option value="informatika">Informatika</option>
          </select>

          <select
            value={selectedKelas}
            onChange={handleKelasChange}
            className="flex-1 bg-white px-4 py-2 rounded-lg shadow text-center"
          >
            <option value="">Pilih Kelas</option>
            <option value="7">Kelas 7</option>
            <option value="8">Kelas 8</option>
            <option value="9">Kelas 9</option>
          </select>
        </div>

        {/* Dropdown untuk Pilih Semester */}
        <div className="w-full max-w-xs mt-2">
          <select
            value={selectedSemester}
            onChange={handleSemesterChange}
            className="w-full bg-white px-4 py-2 rounded-lg shadow text-center"
          >
            <option value="">Pilih Semester</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
        </div>

        {/* Tampilkan List Materi */}
        {renderListMateri()}

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
