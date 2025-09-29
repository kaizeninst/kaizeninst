import models from "../models/index.js";
import { Op } from "sequelize";
const { Order, OrderItem, Product } = models;

// ✅ CREATE
export const createOrder = async (req, res) => {
  try {
    const { OrderItems, ...orderData } = req.body;

    const order = await Order.create(orderData);

    if (OrderItems && Array.isArray(OrderItems)) {
      for (const item of OrderItems) {
        const product = await Product.findByPk(item.product_id);
        if (!product) continue;

        const unitPrice = parseFloat(item.unit_price || product.price || 0);
        const lineTotal = (item.quantity || 1) * unitPrice;

        await OrderItem.create({
          order_id: order.id,
          product_id: product.id,
          quantity: item.quantity,
          unit_price: unitPrice,
          line_total: lineTotal,
        });
      }
    }

    const newOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, include: [Product] }],
    });

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ READ ALL (with filters + pagination)
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { status, payment, search } = req.query;

    const where = {};
    if (status) where.order_status = status;
    if (payment) where.payment_status = payment;
    if (search) {
      where[Op.or] = [
        { customer_name: { [Op.like]: `%${search}%` } },
        { customer_email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      offset,
      limit,
      order: [["created_at", "DESC"]],
      include: [{ model: OrderItem, include: [Product] }],
    });

    res.json({
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ READ ONE
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, include: [Product] }],
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    await order.update(req.body);
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ DELETE
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    await order.destroy();
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE STATUS
export const updateOrderStatus = async (req, res) => {
  try {
    const { order_status } = req.body;
    const validStatuses = ["pending", "processing", "shipped", "delivered"];

    if (!validStatuses.includes(order_status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    await order.update({ order_status });
    res.json({ message: "Status updated successfully", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ SUMMARY
export const getOrderSummary = async (_req, res) => {
  try {
    const statuses = ["pending", "processing", "shipped", "delivered"];

    const counts = await Promise.all(
      statuses.map((s) => Order.count({ where: { order_status: s } }))
    );

    const total = await Order.count();

    res.json({
      total,
      pending: counts[0],
      processing: counts[1],
      shipped: counts[2],
      delivered: counts[3],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
