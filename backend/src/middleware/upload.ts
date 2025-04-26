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

async function deleteFileAndEmptyDir(filePath: string): Promise<void> {
  if (fs.existsSync(filePath)) {
    // Delete the file
    await unlinkAsync(filePath);
    console.log(`Deleted file: ${filePath}`);

    // Check if parent directory is empty and remove if so
    const dirPath = path.dirname(filePath);
    const files = await fs.promises.readdir(dirPath);
    if (files.length === 0) {
      await fs.promises.rmdir(dirPath);
    }
  } else {
    console.log(`File not found: ${filePath}`);
  }
}

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

          if (!userId)
            throw new Error(
              "No user Id recieved in the request to process this"
            );

          if (oldFileName.includes("..")) {
            throw new Error("Invalid file path.");
          }

          const filePath = path.join(
            "uploads/posts",
            userId.toString(),
            oldFileName
          );

          await deleteFileAndEmptyDir(filePath);
        }
        next();
      } catch (error) {
        console.error("Error handling file replacement:", error);
        next(error);
      }
    });
  };
}

function deleteImageMiddleWare() {
  return function (req: MulterRequest, res: any, next: any) {
    try {
      // Process the file deletion
      const { fileName } = req.body;
      if (!fileName) {
        return next();
      }

      const userId = req.userId;
      if (!userId) {
        throw new Error("No user Id received in the request to process this");
      }

      // Security check to prevent directory traversal
      if (fileName.includes("..")) {
        throw new Error("Invalid file path.");
      }

      const filePath = path.join("uploads/posts", userId.toString(), fileName);

      deleteFileAndEmptyDir(filePath)
        .then(() => {
          console.log("File succesfully deleted");
          next();
        })
        .catch((error) => {
          console.error("Error during file deletion:", error);
          next(error);
        });
    } catch (error) {
      console.error("Error handling file deletion:", error);
      next(error);
    }
  };
}

// Regular upload middleware
const upload = {
  post: {
    save: multer({ storage: storage.save }), // used for updating
    updateImage: {
      single: (field: string) => updateImageMiddleware(field),
    },
    delete: {
      single: () => deleteImageMiddleWare(),
    },
  },
  profile: multer({
    storage: storage.temporary,
  }),
};

export default upload;

//  utility function
export async function getImages(
  userId: string,
  filePath: string,
  baseUrl: string
): Promise<String[]> {
  try {
    // Security check
    if (userId.includes("..")) {
      throw new Error("Invalid user ID format");
    }

    const uploadPath = path.join("uploads", filePath, userId);

    console.log("File path", uploadPath);

    // Check if directory exists
    if (!fs.existsSync(uploadPath)) {
      return [];
    }

    // Read files
    const files = await fs.promises.readdir(uploadPath);

    // Generate URLs
    return files.map(
      (file) =>
        `${baseUrl}/${
          filePath === "posts" ? "images" : "uploads"
        }/${filePath}/${userId}/${file}`
    );
  } catch (error) {
    console.error("Error getting images: ", error);
    throw error;
  }
}
