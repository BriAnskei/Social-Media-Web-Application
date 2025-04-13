import multer from "multer";
import { Request } from "express";
import fs from "fs";
import { promisify } from "util";
import path from "path";

interface MulterRequest extends Request {
  userId?: string;
}

const unlinkAsync = promisify(fs.unlink);

// Generate a unique name suffix for each upload session
export const generateNameSuffix = () =>
  `${Date.now()}-${Math.round(Math.random() * 1e5)}`;

const storage = {
  save: multer.diskStorage({
    destination(req: MulterRequest, file, callback) {
      const userId = req.userId;
      const uploadPath = `uploads/posts/${userId}`;
      fs.mkdirSync(uploadPath, { recursive: true });
      callback(null, uploadPath);
    },

    filename(req, file, callback) {
      const nameSuffix = generateNameSuffix();
      return callback(null, `${nameSuffix}-${file.originalname}`);
    },
  }),

  temporary: multer.memoryStorage(), // Temporary memory for registration
};

// File upload with replacement middleware
function updateImageMiddleware(fieldName: string) {
  return function (req: MulterRequest, res: any, next: any) {
    // First run the upload
    upload.post.save.single(fieldName)(req, res, async function (err) {
      if (err) return next(err);

      try {
        // After upload is successful, check if we need to delete an old file
        const { oldFileName, deletedImage } = req.body;
        if (oldFileName || deletedImage === "true") {
          const userId = req.userId;

          if (!userId) return next("No user id recieved from the req.");

          const filePath = path.join(
            "uploads/posts",
            userId.toString(),
            oldFileName
          );

          // Check if file exists before deleting
          if (fs.existsSync(filePath)) {
            await unlinkAsync(filePath);
            console.log(`Deleted old file: ${filePath}`);
          } else {
            console.log(`Old file not found: ${filePath}`);
          }
        }
        next();
      } catch (error) {
        console.error("Error handling file replacement:", error);
        next(error);
      }
    });
  };
}

// Regular upload middleware
const upload = {
  post: {
    save: multer({ storage: storage.save }),
    updateImage: {
      single: (field: string) => updateImageMiddleware(field),
    },
  },
  profile: multer({
    storage: storage.temporary,
  }),
};

export default upload;
