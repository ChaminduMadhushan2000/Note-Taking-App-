import { useState } from "react";
import API from "../utils/api";

export default function CollaboratorModal({ noteId, collaborators, onClose, onUpdate }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError("");
    setLoading(true);

    try {
      // Look up user by email first
      const { data: users } = await API.get("/users", {
        params: { email },
      });

      if (!users || users.length === 0) {
        setError("No user found with that email.");
        setLoading(false);
        return;
      }

      const userId = users[0]._id;

      const { data } = await API.patch(`/notes/${noteId}/collaborators`, {
        userId,
      });

      onUpdate(data);
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add collaborator.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId) => {
    try {
      const { data } = await API.delete(`/notes/${noteId}/collaborators`, {
        data: { userId },
      });
      onUpdate(data);
    } catch {
      /* silently fail */
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal card */}
      <div
        className="bg-white rounded-3xl w-full max-w-md mx-4 mb-4 sm:mb-0 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag indicator */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="px-6 pt-2 pb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Collaborators</h2>
          <button
            onClick={onClose}
            className="text-blue-500 font-semibold text-sm hover:text-blue-600 transition"
          >
            Done
          </button>
        </div>

        {/* Add form */}
        <form onSubmit={handleAdd} className="px-6 pb-4">
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Add by email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 transition border-none"
            />
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-medium rounded-xl px-4 py-2.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "…" : "Add"}
            </button>
          </div>
          {error && (
            <p className="text-xs text-red-500 mt-2 px-1">{error}</p>
          )}
        </form>

        {/* Collaborator list */}
        <div className="max-h-64 overflow-y-auto">
          {collaborators.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No collaborators yet
            </p>
          ) : (
            <ul>
              {collaborators.map((collab) => (
                <li
                  key={collab._id}
                  className="flex items-center justify-between px-6 py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {collab.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {collab.email}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(collab._id)}
                    className="text-red-400 hover:text-red-500 transition ml-4 shrink-0"
                  >
                    <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Bottom safe area */}
        <div className="h-2" />
      </div>
    </div>
  );
}
