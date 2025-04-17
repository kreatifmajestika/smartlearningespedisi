"use client";
import { useState, useMemo, useCallback } from "react";
import { Slate, Editable, withReact } from "slate-react";
import { createEditor } from "slate";
import { withHistory } from "slate-history";
import Toolbar from "./Toolbar";
import { withImages, withEmbeds } from "./plugins";
import FileUploader from "../Shared/J5FileUploader";

const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

export default function MaterialEditor({ onSave }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]);

  const editor = useMemo(
    () => withEmbeds(withImages(withHistory(withReact(createEditor())))),
    []
  );

  const [value, setValue] = useState([
    {
      type: "paragraph",
      children: [{ text: "" }],
    },
  ]);

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case "image":
        return <ImageElement {...props} />;
      case "video":
        return <VideoElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title,
      description,
      content: value,
      attachments,
    });
  };

  const initialValue = [
    {
      type: "paragraph",

      children: [{ text: "A line of text in a paragraph." }],
    },
  ];

  const MyEditor = () => {
    const [editor] = useState(() => withReact(createEditor()));

    return (
      <Slate editor={editor} value={initialValue}>
        <Editable />
      </Slate>
    );
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit}>
        {/* Input Title dan Description */}
        <div className="mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul Materi"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi Singkat"
            className="w-full p-2 border rounded"
            rows="3"
            required
          />
        </div>

        {/* Rich Text Editor */}
        <div className="border rounded mb-4">
          {/* <Slate editor={editor} value={value} onChange={setValue}>
            <Toolbar />
            <Editable
              renderElement={renderElement}
              className="min-h-[200px] p-4"
              placeholder="Tulis konten materi..."
            />
          </Slate> */}

          <h1>kokoko</h1>

          {MyEditor()}
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <FileUploader
            onUploadSuccess={(files) =>
              setAttachments([...attachments, ...files])
            }
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Simpan Materi
        </button>
      </form>
    </div>
  );
}

// Komponen Element
const DefaultElement = ({ attributes, children }) => (
  <p {...attributes}>{children}</p>
);

const ImageElement = ({ attributes, children, element }) => (
  <div {...attributes}>
    <div contentEditable={false}>
      <img src={element.url} alt={element.alt} className="max-w-full" />
    </div>
    {children}
  </div>
);

const VideoElement = ({ attributes, children, element }) => (
  <div {...attributes}>
    <div contentEditable={false} className="my-2">
      {element.provider === "youtube" && (
        <iframe
          src={`https://www.youtube.com/embed/${element.id}`}
          className="w-full h-64"
          allowFullScreen
        />
      )}
      {element.provider === "tiktok" && (
        <blockquote className="tiktok-embed" data-video-id={element.id}>
          <section></section>
        </blockquote>
      )}
    </div>
    {children}
  </div>
);
