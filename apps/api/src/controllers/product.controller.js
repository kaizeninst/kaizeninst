// ============================================================
//  PRODUCT CONTROLLER
// ============================================================

import fs from "fs";
import path from "path";
import { Op } from "sequelize";
import models from "../models/index.js";
import { getSelfAndDescendantIds } from "../utils/categoryTree.js";
import { generateUniqueFileName } from "../utils/fileName.js";
import { uploadToGCS, deleteFromGCS, generateSignedUrl } from "../utils/gcs.js";

const { Product, Category } = models;

/* ============================================================
   CREATE PRODUCT
   ============================================================ */
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

    return res.status(201).json(product);
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    return res.status(400).json({ error: err.message });
  }
};

/* ============================================================
   READ ALL PRODUCTS (with filters + pagination + descendants)
   ============================================================ */
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

    const mode = process.env.STORAGE_MODE || "local";
    let data = rows;

    // ✅ Generate signed URL if using GCS
    if (mode === "gcs") {
      data = await Promise.all(
        rows.map(async (p) => {
          const obj = p.toJSON();
          if (obj.image_path) {
            try {
              obj.image_url = await generateSignedUrl(obj.image_path);
            } catch {
              obj.image_url = null;
            }
          }
          return obj;
        })
      );
    }

    return res.json({
      data,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error("GET /products error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/* ============================================================
   READ SINGLE PRODUCT
   ============================================================ */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, attributes: ["id", "name", "slug"] }],
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const mode = process.env.STORAGE_MODE || "local";
    const obj = product.toJSON();

    if (mode === "gcs" && obj.image_path) {
      try {
        obj.image_url = await generateSignedUrl(obj.image_path);
      } catch {
        obj.image_url = null;
      }
    }

    return res.json(obj);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/* ============================================================
   BULK FETCH PRODUCTS
   ============================================================ */
export const getProductsBulk = async (req, res) => {
  try {
    const ids = (req.body?.ids || []).map(Number).filter(Boolean);
    if (!ids.length) return res.json({ data: [] });

    const rows = await Product.findAll({
      where: { id: ids },
      include: [{ model: Category, attributes: ["id", "name", "slug"] }],
      order: [["id", "ASC"]],
    });

    const mode = process.env.STORAGE_MODE || "local";
    let data = rows;

    if (mode === "gcs") {
      data = await Promise.all(
        rows.map(async (p) => {
          const obj = p.toJSON();
          if (obj.image_path) {
            try {
              obj.image_url = await generateSignedUrl(obj.image_path);
            } catch {
              obj.image_url = null;
            }
          }
          return obj;
        })
      );
    }

    return res.json({ data });
  } catch (err) {
    console.error("POST /products/bulk error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/* ============================================================
   UPDATE PRODUCT (delete old image if replaced)
   ============================================================ */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const oldImage = product.image_path;
    const newImage = req.body.image_path;
    const mode = process.env.STORAGE_MODE || "local";

    await product.update(req.body);

    // Delete old image if replaced
    if (oldImage && newImage && oldImage !== newImage) {
      if (mode === "gcs") {
        await deleteFromGCS(oldImage);
        console.log(`🗑️ Deleted old image from GCS: ${oldImage}`);
      } else {
        const localPath = path.join(process.cwd(), "apps/api/public", oldImage);
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
          console.log(`🗑️ Deleted old local image: ${oldImage}`);
        }
      }
    }

    return res.json(product);
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    return res.status(400).json({ error: err.message });
  }
};

/* ============================================================
   DELETE PRODUCT (remove from local or GCS)
   ============================================================ */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const mode = process.env.STORAGE_MODE || "local";

    if (product.image_path) {
      if (mode === "gcs") {
        await deleteFromGCS(product.image_path);
        console.log("🗑️ Removed from GCS:", product.image_path);
      } else {
        const localPath = path.join(process.cwd(), "apps/api/public", product.image_path);
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
          console.log("🗑️ Removed local:", localPath);
        }
      }
    }

    await product.destroy();
    return res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("DELETE /products error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/* ============================================================
   TOGGLE PRODUCT STATUS
   ============================================================ */
export const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    product.status = product.status === "active" ? "inactive" : "active";
    await product.save();

    return res.json({
      message: "Product status updated",
      id: product.id,
      status: product.status,
    });
  } catch (err) {
    console.error("PATCH /products/:id/toggle error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/* ============================================================
   UPLOAD PRODUCT IMAGE (local + GCS)
   ============================================================ */
export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const mime = req.file.mimetype?.toLowerCase() || "";
    const ext = path.extname(req.file.originalname).toLowerCase();
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    // Validate type
    if (!allowed.includes(mime)) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        error: "Only image files are allowed (jpg, png, webp, gif)",
      });
    }

    // Validate size
    if (req.file.size > 5 * 1024 * 1024) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Image too large (max 5MB allowed)" });
    }

    const mode = process.env.STORAGE_MODE || "local";
    let fileUrl = "";

    if (mode === "gcs") {
      fileUrl = await uploadToGCS(req.file.path, req.file.originalname);
    } else {
      const uploadDir = path.join(process.cwd(), "apps/api/public/uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const newFileName = generateUniqueFileName(req.file.originalname);
      const destPath = path.join(uploadDir, newFileName);
      fs.renameSync(req.file.path, destPath);

      fileUrl = `/uploads/${newFileName}`;
    }

    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    return res.json({ url: fileUrl, storage: mode });
  } catch (err) {
    console.error("POST /products/upload error:", err);
    return res.status(500).json({ error: err.message });
  }
};
