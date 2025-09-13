import models from "../models/index.js";
import { Op } from "sequelize";
const { Category, Product } = models;

// ✅ CREATE
export const createCategory = async (req, res) => {
  try {
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
    const { status, search } = req.query;

    const where = { parent_id: null }; // ✅ ดึงเฉพาะ parent เท่านั้น
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
          include: [
            {
              model: Product,
              attributes: ["id"], // เอาไว้สำหรับนับ
            },
          ],
        },
        {
          model: Product,
          attributes: ["id"],
        },
      ],
    });

    // ✅ แปลง response ให้มี productsCount
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

    await category.update(req.body);
    res.json(category);
  } catch (err) {
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
