import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import API from "../utils/api";
import CollaboratorModal from "../components/CollaboratorModal";

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
  const [collaborators, setCollaborators] = useState([]);
  const [isOwner, setIsOwner] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCollab, setShowCollab] = useState(false);

  useEffect(() => {
    if (!isNew) {
      API.get(`/notes/${id}`)
        .then(({ data }) => {
          setTitle(data.title);
          setContent(data.content);
          setCollaborators(data.collaborators || []);
          const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
          setIsOwner(data.owner?._id === storedUser.id);
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
      // if save fails just stay on the page
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* top bar with back, save, and collaborator buttons */}
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
          {!isNew && isOwner && (
            <button
              onClick={() => setShowCollab(true)}
              className="text-blue-500 font-semibold text-sm hover:text-blue-600 transition ml-4"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* editor area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">
        {/* note title input */}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-bold text-gray-900 placeholder-gray-300 outline-none bg-transparent mb-4 border-none"
        />

        {/* rich text editor (react quill) */}
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

      {/* collaborator modal – only shows when you click the people icon */}
      {showCollab && (
        <CollaboratorModal
          noteId={id}
          collaborators={collaborators}
          onClose={() => setShowCollab(false)}
          onUpdate={(updated) => setCollaborators(updated.collaborators || [])}
        />
      )}
    </div>
  );
}
