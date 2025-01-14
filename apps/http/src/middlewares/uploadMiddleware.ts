import multer from "multer";
import path from "path";

const imageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "../uploads"));
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
});

export const uploadSingleImage = imageUpload.single("image");

export const uploadMultipleImages = imageUpload.array("images", 5);
