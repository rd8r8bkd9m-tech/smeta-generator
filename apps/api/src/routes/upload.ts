import { Router, type Router as RouterType } from 'express'
import multer from 'multer'
import { z } from 'zod'
import {
  uploadFile,
  deleteFile,
  getSignedUploadUrl,
  validateUpload,
  ALLOWED_CONTENT_TYPES,
  MAX_FILE_SIZES,
} from '../services/storage.js'

const router: RouterType = Router()

// Configure multer for memory storage
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
})

/**
 * @swagger
 * /api/upload/presigned:
 *   post:
 *     summary: Get a presigned URL for direct upload
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileName: { type: string }
 *               contentType: { type: string }
 *               folder: { type: string, enum: [stories, avatars, documents] }
 *     responses:
 *       200:
 *         description: Presigned URL generated
 */
router.post('/presigned', async (req, res) => {
  try {
    const schema = z.object({
      fileName: z.string().min(1),
      contentType: z.string(),
      folder: z.enum(['stories', 'avatars', 'documents']).default('stories'),
      userId: z.string().optional(),
    })

    const data = schema.parse(req.body)
    const userId = data.userId || 'anonymous'

    // Validate content type
    const validation = validateUpload(data.contentType, 0, data.folder)
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error })
    }

    const result = await getSignedUploadUrl(
      userId,
      data.fileName,
      data.contentType,
      data.folder
    )

    res.json({
      uploadUrl: result.uploadUrl,
      key: result.key,
      publicUrl: result.publicUrl,
      expiresIn: 300, // 5 minutes
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Error generating presigned URL:', error)
    res.status(500).json({ error: 'Failed to generate upload URL' })
  }
})

/**
 * @swagger
 * /api/upload/story:
 *   post:
 *     summary: Upload a story media file
 *     tags: [Upload]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *       - in: formData
 *         name: userId
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: File uploaded successfully
 */
router.post('/story', upload.single('file'), async (req, res) => {
  try {
    const file = req.file
    const userId = req.body.userId || 'anonymous'

    if (!file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    // Validate file
    const validation = validateUpload(file.mimetype, file.size, 'stories')
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error })
    }

    const result = await uploadFile(
      file.buffer,
      userId,
      file.originalname,
      file.mimetype,
      'stories'
    )

    res.json({
      success: true,
      key: result.key,
      url: result.url,
      contentType: result.contentType,
      size: result.size,
    })
  } catch (error) {
    console.error('Error uploading story:', error)
    res.status(500).json({ error: 'Failed to upload file' })
  }
})

/**
 * @swagger
 * /api/upload/avatar:
 *   post:
 *     summary: Upload a user avatar
 *     tags: [Upload]
 */
router.post('/avatar', upload.single('file'), async (req, res) => {
  try {
    const file = req.file
    const userId = req.body.userId || 'anonymous'

    if (!file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    // Validate file
    const validation = validateUpload(file.mimetype, file.size, 'avatars')
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error })
    }

    const result = await uploadFile(
      file.buffer,
      userId,
      file.originalname,
      file.mimetype,
      'avatars'
    )

    res.json({
      success: true,
      key: result.key,
      url: result.url,
      contentType: result.contentType,
      size: result.size,
    })
  } catch (error) {
    console.error('Error uploading avatar:', error)
    res.status(500).json({ error: 'Failed to upload file' })
  }
})

/**
 * @swagger
 * /api/upload/{key}:
 *   delete:
 *     summary: Delete an uploaded file
 *     tags: [Upload]
 */
router.delete('/:key(*)', async (req, res) => {
  try {
    const { key } = req.params

    if (!key) {
      return res.status(400).json({ error: 'File key is required' })
    }

    await deleteFile(key)
    res.json({ success: true, message: 'File deleted' })
  } catch (error) {
    console.error('Error deleting file:', error)
    res.status(500).json({ error: 'Failed to delete file' })
  }
})

/**
 * @swagger
 * /api/upload/limits:
 *   get:
 *     summary: Get upload limits and allowed types
 *     tags: [Upload]
 */
router.get('/limits', (_req, res) => {
  res.json({
    maxSizes: {
      stories: `${MAX_FILE_SIZES.stories / (1024 * 1024)}MB`,
      avatars: `${MAX_FILE_SIZES.avatars / (1024 * 1024)}MB`,
      documents: `${MAX_FILE_SIZES.documents / (1024 * 1024)}MB`,
    },
    allowedTypes: ALLOWED_CONTENT_TYPES,
  })
})

export default router
