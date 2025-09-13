import models from "../models/index.js";
import { Op } from "sequelize";
const { Category, Product } = models;

// ✅ CREATE
export const createCategory = async (req, res) => {
  try {
    const { name, slug, parent_id = null, sort_order } = req.body;

    // ✅ กัน sort_order ซ้ำภายใต้ parent เดียวกัน
    if (sort_order !== undefined) {
      const exists = await Category.findOne({
        where: { parent_id, sort_order },
      });
      if (exists) {
        return res.status(400).json({
          error: `Sort order ${sort_order} already exists in this parent category`,
        });
      }
    }

    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ READ ALL (with parent + children + products count)
export const getAllCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { status, search, parent_id } = req.query;

    const where = {};

    // ✅ logic parent_id
    if (parent_id === undefined || parent_id === "" || parent_id === "null") {
      // ไม่ส่ง / ส่งว่าง / ส่ง "null" → top-level
      where.parent_id = null;
    } else {
      const parsed = parseInt(parent_id, 10);
      if (isNaN(parsed)) {
        return res.status(400).json({ error: "parent_id must be a number" });
      }
      where.parent_id = parsed;
    }

    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Category.findAndCountAll({
      where,
      offset,
      limit,
      order: [["sort_order", "ASC"]],
      include: [
        {
          model: Category,
          as: "children",
          attributes: [
            "id",
            "name",
            "slug",
            "status",
            "sort_order",
            "created_at",
            "updated_at",
            "parent_id",
          ],
          include: [{ model: Product, attributes: ["id"] }],
          separate: true,
          order: [["sort_order", "ASC"]],
        },
        { model: Product, attributes: ["id"] },
      ],
    });

    const data = rows.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parent_id: cat.parent_id,
      status: cat.status,
      sort_order: cat.sort_order,
      created_at: cat.created_at,
      updated_at: cat.updated_at,
      productsCount: cat.Products?.length || 0,
      children: cat.children.map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        parent_id: child.parent_id,
        status: child.status,
        sort_order: child.sort_order,
        created_at: child.created_at,
        updated_at: child.updated_at,
        productsCount: child.Products?.length || 0,
      })),
    }));

    res.json({
      data,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error("GET /categories error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ READ ONE
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: "children",
          attributes: [
            "id",
            "name",
            "slug",
            "status",
            "sort_order",
            "created_at",
            "updated_at",
            "parent_id",
          ],
          include: [{ model: Product, attributes: ["id"] }],
        },
        { model: Product, attributes: ["id"] },
      ],
    });

    if (!category) return res.status(404).json({ error: "Category not found" });

    res.json({
      id: category.id,
      name: category.name,
      slug: category.slug,
      parent_id: category.parent_id,
      status: category.status,
      sort_order: category.sort_order,
      created_at: category.created_at,
      updated_at: category.updated_at,
      productsCount: category.Products?.length || 0,
      children: category.children.map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        parent_id: child.parent_id,
        status: child.status,
        sort_order: child.sort_order,
        created_at: child.created_at,
        updated_at: child.updated_at,
        productsCount: child.Products?.length || 0,
      })),
    });
  } catch (err) {
    console.error("GET /categories/:id error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    let { parent_id = category.parent_id, sort_order = category.sort_order } = req.body;

    // ✅ แปลง parent_id ให้ถูกต้อง
    if (parent_id === "" || parent_id === "null") {
      parent_id = null;
    } else if (parent_id !== null) {
      const parsed = parseInt(parent_id, 10);
      if (isNaN(parsed)) {
        return res.status(400).json({ error: "parent_id must be a number" });
      }
      parent_id = parsed;
    }

    // ✅ แปลง sort_order ให้เป็นตัวเลขเสมอ
    if (sort_order !== undefined) {
      sort_order = parseInt(sort_order, 10);
      if (isNaN(sort_order)) {
        return res.status(400).json({ error: "sort_order must be a number" });
      }

      // ✅ กัน sort_order ซ้ำ (ยกเว้นอันเดิมของตัวเอง)
      const exists = await Category.findOne({
        where: {
          parent_id,
          sort_order,
          id: { [Op.ne]: category.id },
        },
      });
      if (exists) {
        return res.status(400).json({
          error: `Sort order ${sort_order} already exists in this parent category`,
        });
      }
    }

    await category.update({
      ...req.body,
      parent_id,
      sort_order,
    });

    res.json(category);
  } catch (err) {
    console.error("PUT /categories/:id error:", err);
    res.status(400).json({ error: err.message });
  }
};

// ✅ DELETE
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    await category.destroy();
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ TOGGLE STATUS
export const toggleCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    // toggle active/inactive
    category.status = category.status === "active" ? "inactive" : "active";
    await category.save();

    res.json({
      message: "Category status updated",
      id: category.id,
      status: category.status,
    });
  } catch (err) {
    console.error("PATCH /categories/:id/toggle error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ MOVE UP / DOWN
export const moveCategory = async (req, res) => {
  try {
    const { direction } = req.body; // "up" หรือ "down"
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    // หา category ที่ต้องสลับตำแหน่ง
    const operator = direction === "up" ? Op.lt : Op.gt;
    const order = direction === "up" ? [["sort_order", "DESC"]] : [["sort_order", "ASC"]];

    const swapWith = await Category.findOne({
      where: {
        parent_id: category.parent_id || null,
        sort_order: { [operator]: category.sort_order },
      },
      order,
    });

    if (!swapWith) {
      return res.json({ message: "Already at the edge" });
    }

    // สลับค่า sort_order
    const temp = category.sort_order;
    category.sort_order = swapWith.sort_order;
    swapWith.sort_order = temp;

    await category.save();
    await swapWith.save();

    res.json({ message: "Category moved", category, swapWith });
  } catch (err) {
    console.error("PATCH /categories/:id/move error:", err);
    res.status(500).json({ error: err.message });
  }
};
