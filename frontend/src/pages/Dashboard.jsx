import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data } = await API.get("/notes");
      setNotes(data);
    } catch {
      // if this fails just show empty state, no big deal
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearch(query);

    if (!query.trim()) {
      fetchNotes();
      return;
    }

    try {
      const { data } = await API.get("/notes/search", {
        params: { q: query },
      });
      setNotes(data);
    } catch {
      // just keep whatever notes are showing if search fails
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch {
      // not much we can do if delete fails
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // strips html tags so we can show a plain text preview on the card
  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* top bar – sticks to the top when you scroll */}
      <header className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-lg">
        <div className="max-w-5xl mx-auto px-4 pt-6 pb-4">
          {/* title and sign out button */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 hidden sm:inline">
                {user?.name}
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-500 font-medium hover:text-red-600 transition"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* search bar */}
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-gray-100 rounded-full px-4 py-2 pl-10 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 transition border-none"
            />
          </div>
        </div>
      </header>

      {/* main content area */}
      <main className="max-w-5xl mx-auto px-4 pb-24">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              {search ? "No notes found" : "No notes yet"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {search
                ? "Try a different search term"
                : "Tap the button below to create one"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div
                key={note._id}
                onClick={() => navigate(`/notes/${note._id}`)}
                className="bg-white rounded-2xl shadow-sm p-5 cursor-pointer hover:shadow-md transition group"
              >
                {/* note title */}
                <h3 className="font-semibold text-gray-900 truncate">
                  {note.title}
                </h3>

                {/* short preview of the note content */}
                <p className="text-sm text-gray-500 mt-1 line-clamp-3">
                  {stripHtml(note.content) || "No content"}
                </p>

                {/* date and delete button */}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-400">
                    {formatDate(note.updatedAt)}
                  </span>

                  {note.owner?._id === user?.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(note._id);
                      }}
                      className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition font-medium hover:text-red-500"
                    >
                      Delete
                    </button>
                  )}
                </div>

                {/* shows how many people are collaborating */}
                {note.collaborators?.length > 0 && (
                  <div className="mt-3 flex items-center gap-1">
                    <svg
                      className="h-3.5 w-3.5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-xs text-gray-400">
                      {note.collaborators.length}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* floating + button to create a new note */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => navigate("/notes/new")}
          className="h-14 w-14 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition"
        >
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
