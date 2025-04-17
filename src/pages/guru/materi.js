"use client";

import { useState, useCallback } from "react";
import {
  createEditor,
  Transforms,
  Editor,
  Element as SlateElement,
} from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";
import { database, storage } from "@/lib/firebase";
import { ref, push } from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import isUrl from "is-url";
import imageExtensions from "image-extensions";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaCode,
  FaHeading,
  FaListOl,
  FaListUl,
  FaQuoteLeft,
  FaImage,
  FaVideo,
} from "react-icons/fa";

const LIST_TYPES = ["numbered-list", "bulleted-list"];
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"];
const IMAGE_EXTENSIONS = imageExtensions;

// Pastikan defaultInitialValue selalu terdefinisi
const defaultInitialValue = [
  {
    type: "paragraph",
    children: [{ text: "Tulis materi pelajaran di sini..." }],
  },
];

function getYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

const MateriGuru = () => {
  // Inisialisasi editor dengan nilai default
  const [editor] = useState(() => withHistory(withReact(createEditor())));
  const [value, setValue] = useState(defaultInitialValue);
  const [kelas, setKelas] = useState("");
  const [semester, setSemester] = useState("");
  const [mapel, setMapel] = useState("");
  const [bab, setBab] = useState("");
  const [subBab, setSubBab] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const isMarkActive = (editor, format) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  };

  const toggleMark = (editor, format) => {
    const isActive = isMarkActive(editor, format);
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };

  const isBlockActive = (editor, format, blockType = "type") => {
    const [match] = Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType] === format,
    });
    return !!match;
  };

  const toggleBlock = (editor, format) => {
    const isActive = isBlockActive(
      editor,
      format,
      TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
    );
    const isList = LIST_TYPES.includes(format);

    Transforms.unwrapNodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        LIST_TYPES.includes(n.type) &&
        !TEXT_ALIGN_TYPES.includes(format),
      split: true,
    });

    let newProperties;
    if (TEXT_ALIGN_TYPES.includes(format)) {
      newProperties = {
        align: isActive ? undefined : format,
      };
    } else {
      newProperties = {
        type: isActive ? "paragraph" : isList ? "list-item" : format,
      };
    }

    Transforms.setNodes(editor, newProperties);

    if (!isActive && isList) {
      const block = { type: format, children: [] };
      Transforms.wrapNodes(editor, block);
    }
  };

  const insertImage = (editor, url) => {
    const text = { text: "" };
    const image = { type: "image", url, children: [text] };
    Transforms.insertNodes(editor, image);
  };

  const insertVideo = (editor, url) => {
    const text = { text: "" };
    const video = { type: "video", url, children: [text] };
    Transforms.insertNodes(editor, video);
  };

  const uploadImage = async (file) => {
    setIsUploading(true);
    try {
      const fileRef = storageRef(
        storage,
        `materi-images/${Date.now()}-${file.name}`
      );
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      insertImage(editor, url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Gagal mengupload gambar");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaste = useCallback(
    (event) => {
      const text = event.clipboardData.getData("text/plain");
      if (isUrl(text)) {
        if (IMAGE_EXTENSIONS.some((ext) => text.endsWith(ext))) {
          event.preventDefault();
          insertImage(editor, text);
          return;
        }
        if (
          text.includes("youtube.com") ||
          text.includes("youtu.be") ||
          text.includes("tiktok.com")
        ) {
          event.preventDefault();
          insertVideo(editor, text);
          return;
        }
      }
    },
    [editor]
  );

  const renderElement = useCallback((props) => {
    const { element, attributes, children } = props;
    switch (element.type) {
      case "heading-one":
        return <h1 {...attributes}>{children}</h1>;
      case "heading-two":
        return <h2 {...attributes}>{children}</h2>;
      case "block-quote":
        return <blockquote {...attributes}>{children}</blockquote>;
      case "numbered-list":
        return <ol {...attributes}>{children}</ol>;
      case "bulleted-list":
        return <ul {...attributes}>{children}</ul>;
      case "list-item":
        return <li {...attributes}>{children}</li>;
      case "image":
        return (
          <div {...attributes} contentEditable={false}>
            <img
              src={element.url}
              className="max-w-full h-auto"
              alt="Gambar materi"
            />
            {children}
          </div>
        );
      case "video":
        return (
          <div {...attributes} contentEditable={false}>
            {element.url.includes("youtube") ||
            element.url.includes("youtu.be") ? (
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeId(
                  element.url
                )}`}
                className="w-full aspect-video"
                frameBorder="0"
                allowFullScreen
                title="YouTube video"
              />
            ) : (
              <video controls className="max-w-full">
                <source src={element.url} />
              </video>
            )}
            {children}
          </div>
        );
      default:
        return <p {...attributes}>{children}</p>;
    }
  }, []);

  const renderLeaf = useCallback((props) => {
    let { children, attributes, leaf } = props;
    if (leaf.bold) {
      children = <strong>{children}</strong>;
    }
    if (leaf.italic) {
      children = <em>{children}</em>;
    }
    if (leaf.underline) {
      children = <u>{children}</u>;
    }
    if (leaf.code) {
      children = <code>{children}</code>;
    }
    return <span {...attributes}>{children}</span>;
  }, []);

  const resetForm = () => {
    // Reset semua field form
    setKelas("");
    setSemester("");
    setMapel("");
    setBab("");
    setSubBab("");

    // Reset editor ke nilai default
    setValue([
      {
        type: "paragraph",
        children: [{ text: "Tulis materi pelajaran di sini..." }],
      },
    ]);

    // Fokus kembali ke editor
    Transforms.select(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  };

  const handleSubmit = async () => {
    if (!kelas || !mapel || !bab) {
      alert("Kelas, Mata Pelajaran, dan Bab wajib diisi!");
      return;
    }

    const materiRef = ref(database, "materi");
    const newMateri = {
      kelas,
      semester,
      mapel,
      bab,
      subBab,
      content: value,
      timestamp: Date.now(),
    };

    try {
      await push(materiRef, newMateri);
      alert("Materi berhasil ditambahkan!");

      // Reset form setelah berhasil submit
      resetForm();
    } catch (error) {
      console.error("Gagal menyimpan materi:", error);
      alert("Terjadi kesalahan saat menyimpan materi.");
    }
  };

  // Pastikan Slate menerima value yang valid
  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Kelas"
          className="border p-2 rounded-md w-full"
          value={kelas}
          onChange={(e) => setKelas(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Semester"
          className="border p-2 rounded-md w-full"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        />
        <input
          type="text"
          placeholder="Mata Pelajaran"
          className="border p-2 rounded-md w-full"
          value={mapel}
          onChange={(e) => setMapel(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Bab Materi"
          className="border p-2 rounded-md w-full"
          value={bab}
          onChange={(e) => setBab(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Sub Bab Materi"
          className="border p-2 rounded-md w-full"
          value={subBab}
          onChange={(e) => setSubBab(e.target.value)}
        />
      </div>

      <div className="border rounded-md p-4 mb-6 min-h-[200px]">
        <Slate
          editor={editor}
          value={value}
          initialValue={defaultInitialValue} // Tambahkan ini
          onChange={(newValue) => setValue(newValue)}
        >
          <div className="flex flex-wrap gap-2 mb-4 border-b pb-2">
            <button
              className={`p-2 rounded ${
                isMarkActive(editor, "bold")
                  ? "bg-gray-200"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => toggleMark(editor, "bold")}
              title="Bold"
            >
              <FaBold />
            </button>
            <button
              className={`p-2 rounded ${
                isMarkActive(editor, "italic")
                  ? "bg-gray-200"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => toggleMark(editor, "italic")}
              title="Italic"
            >
              <FaItalic />
            </button>
            <button
              className={`p-2 rounded ${
                isMarkActive(editor, "underline")
                  ? "bg-gray-200"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => toggleMark(editor, "underline")}
              title="Underline"
            >
              <FaUnderline />
            </button>
            <button
              className={`p-2 rounded ${
                isMarkActive(editor, "code")
                  ? "bg-gray-200"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => toggleMark(editor, "code")}
              title="Code"
            >
              <FaCode />
            </button>
            <button
              className={`p-2 rounded ${
                isBlockActive(editor, "heading-one")
                  ? "bg-gray-200"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => toggleBlock(editor, "heading-one")}
              title="Heading"
            >
              <FaHeading />
            </button>
            <button
              className={`p-2 rounded ${
                isBlockActive(editor, "numbered-list")
                  ? "bg-gray-200"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => toggleBlock(editor, "numbered-list")}
              title="Numbered List"
            >
              <FaListOl />
            </button>
            <button
              className={`p-2 rounded ${
                isBlockActive(editor, "bulleted-list")
                  ? "bg-gray-200"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => toggleBlock(editor, "bulleted-list")}
              title="Bulleted List"
            >
              <FaListUl />
            </button>
            <button
              className={`p-2 rounded ${
                isBlockActive(editor, "block-quote")
                  ? "bg-gray-200"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => toggleBlock(editor, "block-quote")}
              title="Quote"
            >
              <FaQuoteLeft />
            </button>
            <label
              className={`p-2 rounded hover:bg-gray-100 cursor-pointer ${
                isUploading ? "opacity-50" : ""
              }`}
              title="Insert Image"
            >
              <FaImage />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) uploadImage(file);
                }}
                disabled={isUploading}
              />
            </label>
            <button
              className="p-2 rounded hover:bg-gray-100"
              onClick={() => {
                const url = window.prompt("Masukkan URL video YouTube/TikTok");
                if (url) insertVideo(editor, url);
              }}
              title="Insert Video"
            >
              <FaVideo />
            </button>
          </div>

          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onPaste={handlePaste}
            placeholder="Tulis isi materi di sini..."
            className="min-h-[150px] focus:outline-none p-2"
          />
        </Slate>
      </div>

      <div className="text-right">
        <button
          onClick={handleSubmit}
          disabled={isUploading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isUploading ? "Mengupload..." : "➕ Tambah Materi"}
        </button>
      </div>
    </div>
  );
};

export default MateriGuru;
