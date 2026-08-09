import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import multer from 'multer';
import { uploadFileToDrive } from '../lib/googleWorkspace';

export const uploadRouter = Router();

// Use memory storage so we can stream the buffer directly to Google Drive
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// POST /api/upload
// Uploads a file to Google Drive and returns the Google Drive File ID
uploadRouter.post('/', requireAuth, upload.single('file'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, buffer, mimetype } = req.file;

    // Upload to Google Drive
    const googleDriveFileId = await uploadFileToDrive(buffer, originalname, mimetype);

    if (!googleDriveFileId) {
      return res.status(500).json({ error: 'Failed to upload to Google Workspace' });
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      googleDriveFileId,
      originalName: originalname,
      mimeType: mimetype
    });

  } catch (error) {
    console.error('Error during file upload:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});
