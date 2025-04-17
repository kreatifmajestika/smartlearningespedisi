"use client";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo, useRef } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { Slate, Editable, withReact } from "slate-react";
import { createEditor } from "slate";
import { withHistory } from "slate-history";
import { renderElement, renderLeaf } from "@/components/Student/MateriRenderer";
import { FiSearch, FiArrowUp, FiArrowDown, FiBookmark } from "react-icons/fi";

export default function ViewMateri() {
  const router = useRouter();
  const { id } = router.query;
  const [materi, setMateri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [activeResult, setActiveResult] = useState(0);
  const [headings, setHeadings] = useState([]);
  const editorRef = useRef(null);

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  // Fungsi untuk ekstrak heading dari konten
  const extractHeadings = (content) => {
    if (!content) return [];
    return content
      .filter(
        (node) => node.type?.startsWith("heading-") && node.children?.[0]?.text
      )
      .map((node) => ({
        level: parseInt(node.type.split("-")[1]),
        text: node.children[0].text,
        id: node.children[0].text.toLowerCase().replace(/\s+/g, "-"),
      }));
  };

  // Fungsi pencarian dalam konten
  const handleSearch = () => {
    if (!searchQuery || !materi?.content) {
      setSearchResults([]);
      return;
    }

    const results = [];
    const query = searchQuery.toLowerCase();

    materi.content.forEach((node, index) => {
      if (node.children) {
        node.children.forEach((child) => {
          if (child.text && child.text.toLowerCase().includes(query)) {
            results.push({
              nodeIndex: index,
              text: child.text,
              match: child.text.toLowerCase().indexOf(query),
            });
          }
        });
      }
    });

    setSearchResults(results);
    setActiveResult(0);
  };

  // Navigasi ke hasil pencarian
  const navigateToSearchResult = (index) => {
    if (searchResults.length === 0) return;
    const result = searchResults[index];
    const element = document.querySelector(
      `[data-slate-node="element"]:nth-child(${result.nodeIndex + 1})`
    );
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    setActiveResult(index);
  };

  // Navigasi ke heading
  const navigateToHeading = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!id) return;

    const fetchMateri = async () => {
      try {
        const db = getDatabase();
        const materiRef = ref(db, `materi/${id}`);
        const snapshot = await get(materiRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const normalizedContent = normalizeContent(data.content);
          setMateri({
            id,
            ...data,
            content: normalizedContent,
          });
          setHeadings(extractHeadings(normalizedContent));
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

  useEffect(() => {
    handleSearch();
  }, [searchQuery]);

  if (loading) {
    return <div className="text-center my-4">Memuat materi...</div>;
  }

  if (!materi) {
    return <div className="text-center my-4">Materi tidak ditemukan</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto flex gap-6">
        {/* Sidebar Navigasi */}
        <div className="w-64 flex-shrink-0 hidden lg:block">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <FiBookmark className="text-blue-500" />
              Navigasi Materi
            </h3>
            <ul className="space-y-2">
              {headings.map((heading, index) => (
                <li key={index}>
                  <button
                    onClick={() => navigateToHeading(heading.id)}
                    className={`text-left hover:text-blue-600 ${
                      "pl-" + (heading.level - 1) * 4
                    }`}
                    style={{ paddingLeft: `${(heading.level - 1) * 16}px` }}
                  >
                    {heading.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Konten Utama */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-3 mb-6 items-center justify-between sticky top-0 bg-white py-3 z-10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.scrollBy(0, -100)}
                  className="p-2 rounded hover:bg-gray-100"
                  title="Scroll Up"
                >
                  <FiArrowUp />
                </button>
                <button
                  onClick={() => window.scrollBy(0, 100)}
                  className="p-2 rounded hover:bg-gray-100"
                  title="Scroll Down"
                >
                  <FiArrowDown />
                </button>
              </div>

              <div className="relative flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari dalam materi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FiSearch className="absolute left-3 top-3 text-gray-400" />
                </div>

                {searchResults.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg">
                    <div className="p-2 text-sm text-gray-500 border-b">
                      {searchResults.length} hasil ditemukan
                    </div>
                    {searchResults.slice(0, 5).map((result, index) => (
                      <div
                        key={index}
                        onClick={() => navigateToSearchResult(index)}
                        className={`p-2 hover:bg-blue-50 cursor-pointer ${
                          index === activeResult ? "bg-blue-100" : ""
                        }`}
                      >
                        {result.text.substring(0, result.match)}
                        <span className="bg-yellow-200">
                          {result.text.substring(
                            result.match,
                            result.match + searchQuery.length
                          )}
                        </span>
                        {result.text.substring(
                          result.match + searchQuery.length
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Metadata Materi */}
            <h1 className="text-2xl font-bold mb-2">{materi.bab}</h1>
            <h2 className="text-xl text-gray-600 mb-4">{materi.subBab}</h2>

            <div className="mb-4">
              <span className="text-sm text-gray-500">
                Mapel: {materi.mapel}
              </span>
              <span className="mx-2">•</span>
              <span className="text-sm text-gray-500">
                Kelas: {materi.kelas}
              </span>
              <span className="mx-2">•</span>
              <span className="text-sm text-gray-500">
                Semester: {materi.semester}
              </span>
            </div>

            {/* Konten Materi */}
            <div className="border-t pt-4">
              {materi.content ? (
                <Slate
                  editor={editor}
                  initialValue={materi.content}
                  onChange={() => {}}
                >
                  <Editable
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    readOnly
                    className="prose max-w-none"
                    placeholder="Konten materi kosong"
                  />
                </Slate>
              ) : (
                <p className="text-gray-500">Tidak ada konten yang tersedia</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fungsi normalisasi konten (tetap sama)
const normalizeContent = (content) => {
  if (!content) return [{ type: "paragraph", children: [{ text: "" }] }];
  if (typeof content === "string")
    return [{ type: "paragraph", children: [{ text: content }] }];
  return content;
};
