const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'test-uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, unique + ext);
  },
});

const upload = multer({ storage });

router.post('/', upload.single('audio'), async (req, res) => {
  console.log('\n========================================');
  console.log('TEST UPLOAD ENDPOINT HIT');
  console.log('========================================');

  console.log('\n📋 REQUEST INFO:');
  console.log('Content-Type:', req.get('content-type'));
  console.log('Content-Length:', req.get('content-length'));

  console.log('\n📦 MULTER FILE INFO:');
  if (req.file) {
    console.log('✅ File received!');
    console.log('Field name:', req.file.fieldname);
    console.log('Original name:', req.file.originalname);
    console.log('Encoding:', req.file.encoding);
    console.log('MIME type:', req.file.mimetype);
    console.log('Size:', req.file.size, 'bytes');
    console.log('Destination:', req.file.destination);
    console.log('Filename:', req.file.filename);
    console.log('Path:', req.file.path);

    // Check if file actually has content
    try {
      const buffer = fs.readFileSync(req.file.path);
      console.log('✅ File read successfully');
      console.log('Buffer length:', buffer.length, 'bytes');
      console.log('First 50 bytes:', buffer.slice(0, 50).toString('hex'));

      // Check if it looks like valid audio
      const header = buffer.slice(0, 12).toString('ascii', 0, 4);
      console.log('File header:', header);

      if (buffer.length < 100) {
        console.log('⚠️ WARNING: File is very small (< 100 bytes)');
      }

      if (buffer.length === 0) {
        console.log('❌ ERROR: File is empty!');
      }
    } catch (err) {
      console.log('❌ Error reading file:', err.message);
    }
  } else {
    console.log('❌ No file received!');
    console.log('Body:', req.body);
  }

  console.log('\n========================================\n');

  res.json({
    success: true,
    file: req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    } : null
  });
});

module.exports = router;
