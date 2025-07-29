const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

class FileUploadService {
  constructor() {
    this.uploadDir = process.env.UPLOAD_PATH || 'uploads/';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
    this.allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx').split(',');
    
    this.ensureUploadDirs();
  }

  ensureUploadDirs() {
    const dirs = ['images', 'documents', 'temp'];
    dirs.forEach(dir => {
      const dirPath = path.join(this.uploadDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  getStorage(subfolder = '') {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = path.join(this.uploadDir, subfolder);
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });
  }

  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    
    if (this.allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type .${ext} is not allowed`), false);
    }
  }

  getUploader(subfolder = '', options = {}) {
    return multer({
      storage: this.getStorage(subfolder),
      fileFilter: this.fileFilter.bind(this),
      limits: {
        fileSize: options.maxFileSize || this.maxFileSize,
        files: options.maxFiles || 5
      }
    });
  }

  async processImage(filePath, options = {}) {
    try {
      const {
        width = 800,
        height = 600,
        quality = 80,
        format = 'jpeg'
      } = options;

      const processedPath = filePath.replace(
        path.extname(filePath),
        `_processed${path.extname(filePath)}`
      );

      await sharp(filePath)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality })
        .toFile(processedPath);

      // Remove original file
      fs.unlinkSync(filePath);

      return processedPath;
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error('Failed to process image');
    }
  }

  async createThumbnail(filePath, options = {}) {
    try {
      const {
        width = 150,
        height = 150,
        quality = 70
      } = options;

      const thumbnailPath = filePath.replace(
        path.extname(filePath),
        `_thumb${path.extname(filePath)}`
      );

      await sharp(filePath)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality })
        .toFile(thumbnailPath);

      return thumbnailPath;
    } catch (error) {
      console.error('Thumbnail creation error:', error);
      throw new Error('Failed to create thumbnail');
    }
  }

  deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }

  getFileInfo(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return {
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        extension: path.extname(filePath).toLowerCase(),
        basename: path.basename(filePath)
      };
    } catch (error) {
      return null;
    }
  }

  validateFile(file) {
    const errors = [];

    if (!file) {
      errors.push('No file provided');
      return { valid: false, errors };
    }

    if (file.size > this.maxFileSize) {
      errors.push(`File size exceeds ${this.maxFileSize / (1024 * 1024)}MB limit`);
    }

    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    if (!this.allowedTypes.includes(ext)) {
      errors.push(`File type .${ext} is not allowed`);
    }

    // Check for double extensions
    const filename = file.originalname;
    if ((filename.match(/\./g) || []).length > 1) {
      errors.push('Multiple file extensions not allowed');
    }

    // Check for malicious patterns
    const maliciousPatterns = [
      /\.php/i,
      /\.asp/i,
      /\.jsp/i,
      /\.exe/i,
      /\.bat/i,
      /\.cmd/i,
      /\.sh/i,
      /javascript:/i,
      /<script/i
    ];

    if (maliciousPatterns.some(pattern => pattern.test(filename))) {
      errors.push('File contains potentially malicious content');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  generateSecureFileName(originalName) {
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    const sanitizedName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
    return `${sanitizedName}_${uuidv4()}${ext}`;
  }
}

module.exports = new FileUploadService();