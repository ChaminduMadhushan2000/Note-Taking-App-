import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import API from "../utils/api";

const TOOLBAR_OPTIONS = [
  ["bold", "italic", "underline", "strike"],
  [{ header: 1 }, { header: 2 }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "code-block"],
  ["link"],
  ["clean"],
];

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      API.get(`/notes/${id}`)
        .then(({ data }) => {
          setTitle(data.title);
          setContent(data.content);
        })
        .catch(() => navigate("/"));
    }
  }, [id, isNew, navigate]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);

    try {
      if (isNew) {
        const { data } = await API.post("/notes", { title, content });
        navigate(`/notes/${data._id}`, { replace: true });
      } else {
        await API.put(`/notes/${id}`, { title, content });
      }
    } catch {
      /* save failed — stay on page */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-gray-50/80 backdrop-blur-lg border-b border-gray-200/60">
        <div className="max-w-3xl mx-auto px-4 h-12 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-blue-500 font-semibold text-sm hover:text-blue-600 transition flex items-center gap-1"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Notes
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="text-blue-500 font-semibold text-sm hover:text-blue-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Done"}
          </button>
        </div>
      </header>

      {/* Editor area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">
        {/* Title */}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-bold text-gray-900 placeholder-gray-300 outline-none bg-transparent mb-4 border-none"
        />

        {/* Quill */}
        <div className="note-editor">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={{ toolbar: TOOLBAR_OPTIONS }}
            placeholder="Start writing…"
          />
        </div>
      </main>
    </div>
  );
}
