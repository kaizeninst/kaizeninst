import fs from "fs";
import path from "path";
import models from "../models/index.js";
import { Op } from "sequelize";
import { getSelfAndDescendantIds } from "../utils/categoryTree.js";
import { generateUniqueFileName } from "../utils/fileName.js";
import { uploadToGCS, deleteFromGCS } from "../utils/gcs.js";

const { Product, Category } = models;

// ✅ CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      price,
      category_id,
      hide_price = false,
      stock_quantity = 0,
      description,
      image_path,
      manual_file_path,
      status = "active",
    } = req.body;

    if (!name || !slug || !price || !category_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const product = await Product.create({
      name,
      slug,
      price,
      category_id,
      hide_price,
      stock_quantity,
      description,
      image_path,
      manual_file_path,
      status,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ READ ALL (filters + pagination + descendants)
export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    const { status, search, category_id } = req.query;
    const includeDesc = ["1", "true", "yes"].includes(
      String(req.query.descendants || "").toLowerCase()
    );

    const where = {};
    if (status) where.status = status;

    if (category_id) {
      const cid = Number(category_id);
      if (includeDesc) {
        const ids = await getSelfAndDescendantIds(cid);
        where.category_id = { [Op.in]: ids.length ? ids : [cid] };
      } else {
        where.category_id = cid;
      }
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      offset,
      limit,
      order: [["created_at", "DESC"]],
      include: [{ model: Category, attributes: ["id", "name", "slug", "parent_id"] }],
    });

    res.json({
      data: rows,
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    });
  } catch (err) {
    console.error("GET /products error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ READ ONE
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, attributes: ["id", "name", "slug"] }],
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ BULK FETCH (POST /api/products/bulk  { ids: [1,2,3] })
export const getProductsBulk = async (req, res) => {
  try {
    const ids = (req.body?.ids || []).map(Number).filter(Boolean);
    if (!ids.length) return res.json({ data: [] });

    const rows = await Product.findAll({
      where: { id: ids },
      include: [{ model: Category, attributes: ["id", "name", "slug"] }],
      order: [["id", "ASC"]],
    });

    res.json({ data: rows });
  } catch (err) {
    console.error("POST /products/bulk error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    await product.update(req.body);
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ DELETE PRODUCT (ลบจาก local หรือ GCS)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const mode = process.env.STORAGE_MODE || "local";

    if (product.image_path) {
      if (mode === "gcs") {
        // ลบจาก Google Cloud Storage
        await deleteFromGCS(product.image_path);
        console.log("🗑️ Removed from GCS:", product.image_path);
      } else {
        // ลบจาก local (dev mode)
        const localPath = path.join(process.cwd(), "apps/api/public", product.image_path);
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
          console.log("🗑️ Removed local:", localPath);
        }
      }
    }

    await product.destroy();
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("DELETE /products error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ TOGGLE STATUS
export const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    product.status = product.status === "active" ? "inactive" : "active";
    await product.save();

    res.json({
      message: "Product status updated",
      id: product.id,
      status: product.status,
    });
  } catch (err) {
    console.error("PATCH /products/:id/toggle error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPLOAD IMAGE (supports local + GCS, only image, max 5MB)
export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const mode = process.env.STORAGE_MODE || "local";
    const mime = req.file.mimetype?.toLowerCase() || "";
    const ext = path.extname(req.file.originalname).toLowerCase();

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(mime)) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Only image files are allowed (jpg, png, webp, gif)" });
    }
    if (req.file.size > 5 * 1024 * 1024) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Image too large (max 5MB allowed)" });
    }

    const newFileName = generateUniqueFileName(req.file.originalname);
    let fileUrl = "";

    if (mode === "gcs") {
      // Upload to Google Cloud Storage
      fileUrl = await uploadToGCS(req.file.path, newFileName);
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); // remove temp file
    } else {
      // Local mode: save to /public/uploads
      const uploadDir = path.join(process.cwd(), "apps/api/public/uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const destPath = path.join(uploadDir, newFileName);
      fs.renameSync(req.file.path, destPath);
      fileUrl = `/uploads/${newFileName}`;
    }

    return res.json({ url: fileUrl, storage: mode });
  } catch (err) {
    console.error("POST /products/upload error:", err);
    res.status(500).json({ error: err.message });
  }
};
