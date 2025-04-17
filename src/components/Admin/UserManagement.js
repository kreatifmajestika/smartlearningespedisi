"use client";
import { useEffect, useState } from "react";
import {
  getDatabase,
  ref,
  onValue,
  remove,
  set,
  update,
} from "firebase/database";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import Modal from "react-modal";
import CryptoJS from "crypto-js";

const SECRET_KEY = "RAHASIA_ADMIN"; // Ganti dengan key rahasia yang aman

const isPasswordStrong = (password) => password.length >= 6;

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
    Modal.setAppElement("#__next");
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, "users");

    const unsubscribe = onValue(
      usersRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const usersData = snapshot.val();
          const usersList = Object.keys(usersData).map((key) => ({
            id: key,
            ...usersData[key],
            password: usersData[key]?.password
              ? CryptoJS.AES.decrypt(
                  usersData[key].password,
                  SECRET_KEY
                ).toString(CryptoJS.enc.Utf8)
              : "",
          }));
          setUsers(usersList);
        } else {
          setUsers([]);
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddUser = async (data) => {
    try {
      setLoading(true);
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("Admin not authenticated");
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const uid = userCredential.user.uid;

      const encryptedPassword = CryptoJS.AES.encrypt(
        data.password,
        SECRET_KEY
      ).toString();

      const db = getDatabase();
      await set(ref(db, `users/${uid}`), {
        email: data.email,
        nama: data.nama,
        role: data.role,
        mataPelajaran: data.mataPelajaran || "",
        password: encryptedPassword,
        createdAt: new Date().toISOString(),
      });

      // Re-login as admin
      // await signInWithEmailAndPassword(
      //   auth,
      //   currentUser.email,
      //   data.adminPassword
      // );

      alert("Pengguna berhasil ditambahkan!");
      setIsAdding(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (userData) => {
    try {
      setLoading(true);
      const encryptedPassword = CryptoJS.AES.encrypt(
        userData.password,
        SECRET_KEY
      ).toString();

      const db = getDatabase();
      await update(ref(db, `users/${userData.id}`), {
        email: userData.email,
        nama: userData.nama,
        role: userData.role,
        mataPelajaran: userData.mataPelajaran || "",
        password: encryptedPassword,
      });

      alert("Data pengguna berhasil diperbarui.");
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsAdding(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm("Yakin ingin menghapus pengguna ini?")) return;

    try {
      const db = getDatabase();
      await remove(ref(db, `users/${userId}`));
      alert("Pengguna berhasil dihapus.");
    } catch (err) {
      setError(err.message);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setIsEditing(true);
  };

  let formValue = {};

  const UserForm = ({ onSubmit, onClose, defaultValues = {} }) => (
    <div className="space-y-4">
      <input
        name="email"
        type="email"
        required
        defaultValue={defaultValues.email}
        placeholder="Email"
        className="w-full border p-2 rounded"
        onChange={(e) => (formValue = { ...formValue, email: e.target.value })}
      />
      <input
        name="password"
        type="text"
        required
        defaultValue={defaultValues.password}
        placeholder="Password"
        className="w-full border p-2 rounded"
        onChange={(e) =>
          (formValue = { ...formValue, password: e.target.value })
        }
      />
      <input
        name="nama"
        type="text"
        required
        defaultValue={defaultValues.nama}
        placeholder="Nama Lengkap"
        className="w-full border p-2 rounded"
        onChange={(e) => (formValue = { ...formValue, nama: e.target.value })}
      />
      <select
        name="role"
        required
        defaultValue={defaultValues.role}
        className="w-full border p-2 rounded"
        onChange={(e) => (formValue = { ...formValue, role: e.target.value })}
      >
        <option value="">Pilih Role</option>
        <option value="guru">Guru</option>
        <option value="siswa">Siswa</option>
      </select>
      <input
        name="mataPelajaran"
        type="text"
        defaultValue={defaultValues.mataPelajaran}
        placeholder="Mata Pelajaran (opsional)"
        className="w-full border p-2 rounded"
        onChange={(e) =>
          (formValue = { ...formValue, mataPelajaran: e.target.value })
        }
      />
      {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
      <div className="flex gap-3">
        <button
          onClick={() => {
            onSubmit(formValue);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Simpan
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
        >
          Batal
        </button>
      </div>
    </div>
  );

  if (!isBrowser) return null;
  if (loading) return <div>Memuat data pengguna...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manajemen Pengguna</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Tambah Pengguna
        </button>
      </div>

      {users.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <p>Database pengguna kosong. Tambahkan pengguna baru.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Nama</th>
                <th className="py-3 px-4 text-left">Role</th>
                <th className="py-3 px-4 text-left">Mapel</th>
                <th className="py-3 px-4 text-left">Password</th>
                <th className="py-3 px-4 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">{user.nama || "-"}</td>
                  <td className="py-3 px-4 capitalize">{user.role}</td>
                  <td className="py-3 px-4">{user.mataPelajaran || "-"}</td>
                  <td className="py-3 px-4">{user.password || "-"}</td>
                  <td className="py-3 px-4 space-x-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Tambah User */}
      <Modal
        isOpen={isAdding}
        onRequestClose={() => {
          setIsAdding(false);
          setPasswordError("");
        }}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="p-6 bg-white rounded-lg max-w-md mx-auto mt-20">
          <h3 className="text-lg font-semibold mb-4">Tambah Pengguna</h3>
          <UserForm
            onSubmit={handleAddUser}
            onClose={() => setIsAdding(false)}
          />
        </div>
      </Modal>

      {/* Modal Edit User */}
      <Modal
        isOpen={isEditing}
        onRequestClose={() => {
          setIsEditing(false);
          setSelectedUser(null);
        }}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="p-6 bg-white rounded-lg max-w-md mx-auto mt-20">
          <h3 className="text-lg font-semibold mb-4">Edit Pengguna</h3>
          <UserForm
            onSubmit={handleEditUser}
            onClose={() => setIsEditing(false)}
            defaultValues={selectedUser}
          />
        </div>
      </Modal>

      <style jsx global>{`
        .modal {
          position: absolute;
          top: 50%;
          left: 50%;
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
    </div>
  );
}
