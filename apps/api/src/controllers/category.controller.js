// ============================================================
//  CATEGORY CONTROLLER
// ============================================================

import models from "../models/index.js";
import { Op } from "sequelize";

const { Category, Product } = models;

/* ============================================================
   CREATE CATEGORY (POST /api/categories)
   ============================================================ */
export const createCategory = async (req, res) => {
  try {
    let { name, slug, parent_id = null } = req.body;

    // Normalize parent_id
    if (parent_id === "" || parent_id === "null") parent_id = null;

    // Find max sort_order within the same parent
    const maxOrder = await Category.max("sort_order", { where: { parent_id } });
    const nextOrder = isNaN(maxOrder) ? 1 : maxOrder + 1;

    // Create new category
    const category = await Category.create({
      name,
      slug,
      parent_id,
      sort_order: nextOrder,
      status: req.body.status || "active",
    });

    return res.status(201).json({
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("POST /categories error:", error);
    return res.status(400).json({ error: error.message });
  }
};

/* ============================================================
   GET ALL CATEGORIES (GET /api/categories)
   Support pagination, filtering, search, and nested children
   ============================================================ */
export const getAllCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { status, search, parent_id } = req.query;

    const where = {};

    // Parent logic
    if (parent_id === undefined || parent_id === "" || parent_id === "null") {
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

    return res.json({
      data,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("GET /categories error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ============================================================
   GET CATEGORY BY ID (GET /api/categories/:id)
   Include children and product count
   ============================================================ */
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

    return res.json({
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
  } catch (error) {
    console.error("GET /categories/:id error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ============================================================
   GET PARENT CATEGORIES (GET /api/categories/parents)
   Only top-level categories with children and product count
   ============================================================ */
export const getParentCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { search, status } = req.query;

    const where = { parent_id: null };
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
      ];
    }

    const totalParents = await Category.count({ where });

    const rows = await Category.findAll({
      where,
      limit,
      offset,
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

    return res.json({
      data,
      pagination: {
        total: totalParents,
        page,
        limit,
        totalPages: Math.ceil(totalParents / limit),
      },
    });
  } catch (error) {
    console.error("GET /categories/parents error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ============================================================
   UPDATE CATEGORY (PUT /api/categories/:id)
   Validate parent_id and sort_order
   ============================================================ */
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    let { parent_id = category.parent_id, sort_order = category.sort_order } = req.body;

    // Normalize parent_id
    if (parent_id === "" || parent_id === "null") {
      parent_id = null;
    } else if (parent_id !== null) {
      const parsed = parseInt(parent_id, 10);
      if (isNaN(parsed)) {
        return res.status(400).json({ error: "parent_id must be a number" });
      }
      parent_id = parsed;
    }

    // Validate sort_order
    if (sort_order !== undefined) {
      sort_order = parseInt(sort_order, 10);
      if (isNaN(sort_order)) {
        return res.status(400).json({ error: "sort_order must be a number" });
      }

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

    await category.update({ ...req.body, parent_id, sort_order });
    return res.json(category);
  } catch (error) {
    console.error("PUT /categories/:id error:", error);
    return res.status(400).json({ error: error.message });
  }
};

/* ============================================================
   DELETE CATEGORY (DELETE /api/categories/:id)
   ============================================================ */
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    await category.destroy();
    return res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("DELETE /categories/:id error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ============================================================
   TOGGLE CATEGORY STATUS (PATCH /api/categories/:id/toggle)
   ============================================================ */
export const toggleCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    category.status = category.status === "active" ? "inactive" : "active";
    await category.save();

    return res.json({
      message: "Category status updated",
      id: category.id,
      status: category.status,
    });
  } catch (error) {
    console.error("PATCH /categories/:id/toggle error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ============================================================
   MOVE CATEGORY (PATCH /api/categories/:id/move)
   Swap sort_order with adjacent category in given direction
   ============================================================ */
export const moveCategory = async (req, res) => {
  try {
    const { direction } = req.body; // "up" or "down"
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });

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

    const temp = category.sort_order;
    category.sort_order = swapWith.sort_order;
    swapWith.sort_order = temp;

    await category.save();
    await swapWith.save();

    return res.json({ message: "Category moved", category, swapWith });
  } catch (error) {
    console.error("PATCH /categories/:id/move error:", error);
    return res.status(500).json({ error: error.message });
  }
};
