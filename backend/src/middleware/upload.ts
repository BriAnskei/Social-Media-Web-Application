import multer from "multer";
import { Request } from "express";
import fs from "fs";

interface MulterRequest extends Request {
  userId?: string;
}

export const nameSuffix = `${Date.now()}-${Math.round(Math.random() * 1e5)}`;

const storage = {
  post: multer.diskStorage({
    destination(req: MulterRequest, file, callback) {
      const userId = req.userId;

      const uploadPath = `uploads/posts/${userId}`;

      fs.mkdirSync(uploadPath, { recursive: true });

      callback(null, uploadPath);
    },

    filename(req, file, callback) {
      return callback(null, `${nameSuffix}-${file.originalname}`);
    },
  }),

  temporary: multer.memoryStorage(), // Tempoaray memory for registration
};

const upload = {
  post: multer({ storage: storage.post }),
  profile: multer({
    storage: storage.temporary,
  }),
};

export default upload;
