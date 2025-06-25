const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Get all documents
router.get('/', auth, async (req, res) => {
  try {
    const [documents] = await db.execute(
      'SELECT d.*, u.name as uploaded_by FROM documents d JOIN users u ON d.uploaded_by = u.id ORDER BY d.created_at DESC'
    );
    res.json({ success: true, documents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload document
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, category } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.json({ success: false, error: 'No file uploaded' });
    }
    
    const [result] = await db.execute(
      'INSERT INTO documents (title, filename, file_path, file_size, category, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
      [title, file.originalname, file.path, file.size, category, req.user.userId]
    );
    
    res.json({ success: true, documentId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete document
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.execute('DELETE FROM documents WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
