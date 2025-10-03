import models from "../models/index.js";
import { Op } from "sequelize";
import { getSelfAndDescendantIds } from "../utils/categoryTree.js";

const { Product, Category } = models;

// ✅ CREATE
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

// READ ALL (filters + pagination + descendants)
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

// ✅ UPDATE
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

// ✅ DELETE
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    await product.destroy();
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
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
