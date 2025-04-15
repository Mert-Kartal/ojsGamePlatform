import multer from "multer";
import path from "path";
import fs from "fs";

const makeUploadFolder = (folderPath: string) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = path.join("public", "uploads", "general");

    // farklı alanlara göre farklı klasörlere kaydet
    if (file.fieldname === "profilePhoto") {
      folder = path.join("public", "uploads", "profile_photos");
    } else if (file.fieldname === "coverPhoto") {
      folder = path.join("public", "uploads", "game_covers");
    }

    makeUploadFolder(folder);
    cb(null, folder);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Only jpg, jpeg or png files can upload"));
};

export const upload = multer({ storage, fileFilter });
