"use client";
import { useState, useEffect } from "react";
import { getDatabase, ref, set } from "firebase/database";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import Modal from "react-modal";
import { isPasswordStrong } from "@/lib/validation";

export default function AddUserForm() {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    role: "siswa",
    mataPelajaran: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      Modal.setAppElement("#__next");
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nama.trim()) newErrors.nama = "Nama harus diisi";
    if (!formData.email.trim()) newErrors.email = "Email harus diisi";
    if (!formData.password) {
      newErrors.password = "Password harus diisi";
    } else if (!isPasswordStrong(formData.password)) {
      newErrors.password = "Password tidak memenuhi kriteria keamanan";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      // Create user in Authentication
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Save additional data in Realtime Database
      const db = getDatabase();
      await set(ref(db, `users/${userCredential.user.uid}`), {
        email: formData.email,
        nama: formData.nama,
        role: formData.role,
        mataPelajaran: formData.role === "guru" ? formData.mataPelajaran : "",
        createdAt: new Date().toISOString(),
      });

      setSuccess(true);
      setFormData({
        nama: "",
        email: "",
        password: "",
        role: "siswa",
        mataPelajaran: "",
      });

      // Auto-close after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Tambah Pengguna
      </button>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => {
          setIsOpen(false);
          setErrors({});
          setSuccess(false);
        }}
        contentLabel="Tambah Pengguna"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold mb-4">Tambah Pengguna Baru</h3>

          {success ? (
            <div className="p-4 bg-green-50 text-green-700 rounded mb-4">
              Pengguna berhasil ditambahkan!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded ${
                    errors.nama ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Masukkan nama lengkap"
                />
                {errors.nama && (
                  <p className="text-red-500 text-sm mt-1">{errors.nama}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="contoh@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Buat password"
                />
                {errors.password ? (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                ) : (
                  <div className="text-xs text-gray-500 mt-1">
                    Password harus mengandung:
                    <ul className="list-disc pl-5 mt-1">
                      <li>Minimal 8 karakter</li>
                      <li>1 huruf besar</li>
                      <li>1 angka</li>
                      <li>1 simbol</li>
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="siswa">Siswa</option>
                  <option value="guru">Guru</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {formData.role === "guru" && (
                <div>
                  <label className="block text-gray-700 mb-2">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    name="mataPelajaran"
                    value={formData.mataPelajaran}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    placeholder="Masukkan mata pelajaran"
                  />
                </div>
              )}

              {errors.submit && (
                <div className="text-red-500 text-sm mt-2">{errors.submit}</div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? "Memproses..." : "Tambah Pengguna"}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      <style jsx global>{`
        .modal {
          position: absolute;
          top: 50%;
          left: 50%;
          right: auto;
          bottom: auto;
          margin-right: -50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 20px;
          border-radius: 8px;
          outline: none;
          width: 90%;
          max-width: 500px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1000;
        }
      `}</style>
    </>
  );
}
