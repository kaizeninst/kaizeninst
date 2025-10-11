import express from "express";
import multer from "multer";
import path from "path";
import { ensureTmpDir } from "../utils/tmp.js";
import { uploadFile, deleteFile } from "../controllers/file.controller.js";
import { maybeAuth } from "../middleware/maybeAuth.js";

const router = express.Router();
const upload = multer({ dest: ensureTmpDir() });

router.post("/upload", maybeAuth, upload.single("file"), uploadFile);
router.delete("/", maybeAuth, deleteFile);

export default router;
