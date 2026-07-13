import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    audio: config.ALLOWED_AUDIO_FORMATS,
    image: config.ALLOWED_IMAGE_FORMATS,
  };

  const ext = path.extname(file.originalname).slice(1).toLowerCase();
  const type = file.mimetype.split('/')[0];

  if (type === 'audio' && allowedTypes.audio.includes(ext)) {
    cb(null, true);
  } else if (type === 'image' && allowedTypes.image.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${ext}`));
  }
};

export const uploadAudio = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.MAX_AUDIO_FILE_SIZE },
});

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.MAX_IMAGE_FILE_SIZE },
});

export default { uploadAudio, uploadImage };
