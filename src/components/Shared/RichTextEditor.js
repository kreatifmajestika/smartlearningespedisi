"use client";
import React, { useMemo, useState } from "react";
import { createEditor } from "slate";
import { Slate, Editable, withReact } from "slate-react";

const RichTextEditor = ({ initialValue, onChange }) => {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState(
    initialValue || [{ type: "paragraph", children: [{ text: "" }] }]
  );

  const handleChange = (newValue) => {
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="border rounded-lg p-4 min-h-[200px]">
      <Slate editor={editor} value={value} onChange={handleChange}>
        <Editable placeholder="Tulis materi pembelajaran di sini..." />
      </Slate>
    </div>
  );
};

export default RichTextEditor;
