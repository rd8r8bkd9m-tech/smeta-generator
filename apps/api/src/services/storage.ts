import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import crypto from 'crypto'

// S3-compatible storage configuration
// Works with AWS S3, MinIO, DigitalOcean Spaces, Cloudflare R2, etc.
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT, // For MinIO/R2: http://localhost:9000
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true', // Required for MinIO
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'status-app-media'

export interface UploadResult {
  key: string
  url: string
  contentType: string
  size: number
}

/**
 * Generate a unique file key with folder structure
 */
function generateFileKey(
  userId: string,
  originalName: string,
  folder: 'stories' | 'avatars' | 'documents' = 'stories'
): string {
  const timestamp = Date.now()
  const hash = crypto.randomBytes(8).toString('hex')
  const ext = originalName.split('.').pop()?.toLowerCase() || 'bin'
  return `${folder}/${userId}/${timestamp}-${hash}.${ext}`
}

/**
 * Upload a file to S3-compatible storage
 */
export async function uploadFile(
  file: Buffer,
  userId: string,
  originalName: string,
  contentType: string,
  folder: 'stories' | 'avatars' | 'documents' = 'stories'
): Promise<UploadResult> {
  const key = generateFileKey(userId, originalName, folder)

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      // ACL: 'public-read', // Uncomment if bucket is public
      Metadata: {
        'original-name': encodeURIComponent(originalName),
        'uploaded-by': userId,
      },
    })
  )

  // Generate public URL or signed URL
  const url = await getPublicUrl(key)

  return {
    key,
    url,
    contentType,
    size: file.length,
  }
}

/**
 * Get a signed URL for private file access (expires in 1 hour)
 */
export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  return getSignedUrl(s3Client, command, { expiresIn })
}

/**
 * Get a signed URL for direct upload from client (presigned PUT)
 */
export async function getSignedUploadUrl(
  userId: string,
  fileName: string,
  contentType: string,
  folder: 'stories' | 'avatars' | 'documents' = 'stories',
  expiresIn = 300
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const key = generateFileKey(userId, fileName, folder)

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn })
  const publicUrl = await getPublicUrl(key)

  return { uploadUrl, key, publicUrl }
}

/**
 * Delete a file from storage
 */
export async function deleteFile(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  )
}

/**
 * Check if a file exists
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    )
    return true
  } catch {
    return false
  }
}

/**
 * Get public URL for a file
 * Uses CDN URL if configured, otherwise generates signed URL
 */
async function getPublicUrl(key: string): Promise<string> {
  const cdnUrl = process.env.S3_CDN_URL

  if (cdnUrl) {
    // Use CDN URL (CloudFront, Bunny CDN, etc.)
    return `${cdnUrl}/${key}`
  }

  // If no CDN, use signed URL (private bucket)
  return getSignedDownloadUrl(key)
}

/**
 * Allowed content types for different file categories
 */
export const ALLOWED_CONTENT_TYPES = {
  stories: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
  ],
  avatars: ['image/jpeg', 'image/png', 'image/webp'],
  documents: ['application/pdf', 'image/jpeg', 'image/png'],
}

/**
 * Max file sizes in bytes
 */
export const MAX_FILE_SIZES = {
  stories: 50 * 1024 * 1024, // 50MB for stories
  avatars: 5 * 1024 * 1024, // 5MB for avatars
  documents: 10 * 1024 * 1024, // 10MB for documents
}

/**
 * Validate file upload
 */
export function validateUpload(
  contentType: string,
  size: number,
  folder: 'stories' | 'avatars' | 'documents'
): { valid: boolean; error?: string } {
  const allowedTypes = ALLOWED_CONTENT_TYPES[folder]
  const maxSize = MAX_FILE_SIZES[folder]

  if (!allowedTypes.includes(contentType)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
    }
  }

  if (size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`,
    }
  }

  return { valid: true }
}
