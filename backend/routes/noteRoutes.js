const express = require("express");
const mongoose = require("mongoose");
const Note = require("../models/Note");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/notes — Create a note
router.post("/", async (req, res) => {
  try {
    const { title, content, collaborators } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required." });
    }

    const note = await Note.create({
      title,
      content,
      owner: req.user.id,
      collaborators: collaborators || [],
    });

    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// GET /api/notes — List all notes the user owns or collaborates on
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;

    const notes = await Note.find({
      $or: [{ owner: userId }, { collaborators: userId }],
    })
      .populate("owner", "name email")
      .populate("collaborators", "name email")
      .sort({ updatedAt: -1 });

    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// GET /api/notes/:id — Read a single note (owner or collaborator only)
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid note ID." });
    }

    const note = await Note.findById(req.params.id)
      .populate("owner", "name email")
      .populate("collaborators", "name email");

    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }

    const userId = req.user.id;
    const isOwner = note.owner._id.toString() === userId;
    const isCollaborator = note.collaborators.some(
      (c) => c._id.toString() === userId
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// PUT /api/notes/:id — Update a note (owner or collaborator only)
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid note ID." });
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }

    const userId = req.user.id;
    const isOwner = note.owner.toString() === userId;
    const isCollaborator = note.collaborators.some(
      (c) => c.toString() === userId
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: "Access denied." });
    }

    const { title, content, collaborators } = req.body;

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    // Only the owner can change the collaborators list
    if (collaborators !== undefined && isOwner) {
      note.collaborators = collaborators;
    }

    await note.save();

    const updated = await Note.findById(note._id)
      .populate("owner", "name email")
      .populate("collaborators", "name email");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// GET /api/notes/search — Full-text search on accessible notes
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ message: "Search query (q) is required." });
    }

    const userId = req.user.id;

    const notes = await Note.find({
      $text: { $search: q },
      $or: [{ owner: userId }, { collaborators: userId }],
    })
      .populate("owner", "name email")
      .populate("collaborators", "name email")
      .sort({ score: { $meta: "textScore" } });

    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// PUT /api/notes/:id/collaborators/email — Add a collaborator by email (owner only)
router.put("/:id/collaborators", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid note ID." });
    }

    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required." });
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }

    if (note.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the owner can manage collaborators." });
    }

    const userToAdd = await User.findOne({ email: email.toLowerCase().trim() });

    if (!userToAdd) {
      return res.status(404).json({ message: "No user found with that email." });
    }

    if (userToAdd._id.toString() === note.owner.toString()) {
      return res.status(400).json({ message: "Owner cannot be added as a collaborator." });
    }

    if (note.collaborators.some((c) => c.toString() === userToAdd._id.toString())) {
      return res.status(409).json({ message: "User is already a collaborator." });
    }

    note.collaborators.push(userToAdd._id);
    await note.save();

    const updated = await Note.findById(note._id)
      .populate("owner", "name email")
      .populate("collaborators", "name email");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// PATCH /api/notes/:id/collaborators — Add a collaborator by userId (owner only)
router.patch("/:id/collaborators", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid note ID." });
    }

    const { userId } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "A valid userId is required." });
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }

    if (note.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the owner can manage collaborators." });
    }

    if (userId === note.owner.toString()) {
      return res.status(400).json({ message: "Owner cannot be added as a collaborator." });
    }

    if (note.collaborators.some((c) => c.toString() === userId)) {
      return res.status(409).json({ message: "User is already a collaborator." });
    }

    note.collaborators.push(userId);
    await note.save();

    const updated = await Note.findById(note._id)
      .populate("owner", "name email")
      .populate("collaborators", "name email");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// DELETE /api/notes/:id/collaborators — Remove a collaborator (owner only)
router.delete("/:id/collaborators", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid note ID." });
    }

    const { userId } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "A valid userId is required." });
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }

    if (note.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the owner can manage collaborators." });
    }

    const index = note.collaborators.findIndex((c) => c.toString() === userId);

    if (index === -1) {
      return res.status(404).json({ message: "User is not a collaborator." });
    }

    note.collaborators.splice(index, 1);
    await note.save();

    const updated = await Note.findById(note._id)
      .populate("owner", "name email")
      .populate("collaborators", "name email");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// DELETE /api/notes/:id — Delete a note (owner only)
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid note ID." });
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }

    if (note.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the owner can delete this note." });
    }

    await note.deleteOne();

    res.json({ message: "Note deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

module.exports = router;
