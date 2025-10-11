// ============================================================
//  PRODUCT CONTROLLER (Local Storage Only, store clean filenames)
// ============================================================

import fs from "fs";
import path from "path";
import { Op } from "sequelize";
import models from "../models/index.js";
import { getSelfAndDescendantIds } from "../utils/categoryTree.js";
import { generateUniqueFileName } from "../utils/fileName.js";

const { Product, Category } = models;
const BASE_UPLOAD_URL = "/uploads/"; // สำหรับส่งให้ frontend เท่านั้น
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "apps/api/public/uploads");

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
      image_path, // เช่น "abc123.jpg" (ไม่รวม uploads/)
      manual_file_path,
      status = "active",
    } = req.body;

    if (!name || !slug || !price || !category_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ ล้าง path เผื่อ frontend ส่ง /uploads/ มาผิด
    const cleanImage = image_path?.replace(/^\/?uploads\//, "") || null;
    const cleanManual = manual_file_path?.replace(/^\/?uploads\//, "") || null;

    const product = await Product.create({
      name,
      slug,
      price,
      category_id,
      hide_price,
      stock_quantity,
      description,
      image_path: cleanImage,
      manual_file_path: cleanManual,
      status,
    });

    return res.status(201).json(product);
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    return res.status(400).json({ error: err.message });
  }
};

/* ============================================================
   READ ALL PRODUCTS (with filters + pagination)
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

    const data = rows.map((p) => {
      const obj = p.toJSON();
      if (obj.image_path) obj.image_url = BASE_UPLOAD_URL + obj.image_path;
      return obj;
    });

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

    const obj = product.toJSON();
    if (obj.image_path) obj.image_url = BASE_UPLOAD_URL + obj.image_path;

    return res.json(obj);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/* ============================================================
   BULK FETCH PRODUCTS (by IDs)
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

    const data = rows.map((p) => {
      const obj = p.toJSON();
      if (obj.image_path) obj.image_url = BASE_UPLOAD_URL + obj.image_path;
      return obj;
    });

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
    const newImage = req.body.image_path?.replace(/^\/?uploads\//, "") || null;

    await product.update({
      ...req.body,
      image_path: newImage,
    });

    // ลบไฟล์เก่า ถ้ามีการเปลี่ยนชื่อไฟล์
    if (oldImage && newImage && oldImage !== newImage) {
      const localPath = path.join(LOCAL_UPLOAD_DIR, oldImage);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        console.log(`🗑️ Deleted old image: ${oldImage}`);
      }
    }

    const obj = product.toJSON();
    if (obj.image_path) obj.image_url = BASE_UPLOAD_URL + obj.image_path;
    return res.json(obj);
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    return res.status(400).json({ error: err.message });
  }
};

/* ============================================================
   DELETE PRODUCT (remove from local storage)
   ============================================================ */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product.image_path) {
      const localPath = path.join(LOCAL_UPLOAD_DIR, product.image_path);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        console.log("🗑️ Removed local image:", product.image_path);
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

    const obj = product.toJSON();
    if (obj.image_path) obj.image_url = BASE_UPLOAD_URL + obj.image_path;

    return res.json({
      message: "Product status updated",
      id: product.id,
      status: product.status,
      image_url: obj.image_url,
    });
  } catch (err) {
    console.error("PATCH /products/:id/toggle error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/* ============================================================
   UPLOAD PRODUCT IMAGE (local only)
   ============================================================ */
export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

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

    if (!fs.existsSync(LOCAL_UPLOAD_DIR)) fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });

    const newFileName = generateUniqueFileName(req.file.originalname);
    const destPath = path.join(LOCAL_UPLOAD_DIR, newFileName);
    fs.renameSync(req.file.path, destPath);

    // ✅ เก็บเฉพาะชื่อไฟล์ใน DB
    return res.json({
      filename: newFileName,
      url: BASE_UPLOAD_URL + newFileName, // สำหรับ preview ที่ frontend
    });
  } catch (err) {
    console.error("POST /products/upload error:", err);
    return res.status(500).json({ error: err.message });
  }
};
