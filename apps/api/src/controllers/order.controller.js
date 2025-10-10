// ============================================================
//  ORDER CONTROLLER
// ============================================================

import models from "../models/index.js";
import { Op } from "sequelize";

const { Order, OrderItem, Product } = models;

/* ============================================================
   CREATE ORDER (POST /api/orders)
   ============================================================ */
export const createOrder = async (req, res) => {
  try {
    const { OrderItems, ...orderData } = req.body;

    // Validate items
    if (!OrderItems || !Array.isArray(OrderItems) || OrderItems.length === 0) {
      return res.status(400).json({ error: "OrderItems are required" });
    }

    // Create main order (initial total = 0)
    const order = await Order.create({ ...orderData, total: 0 });

    let grandTotal = 0;

    // Loop through each item
    for (const item of OrderItems) {
      const product = await Product.findByPk(item.product_id);

      if (!product) {
        await order.destroy();
        return res.status(400).json({ error: `Product with id ${item.product_id} not found` });
      }

      // Use item.unit_price if provided, otherwise product.price
      const unitPrice =
        item.unit_price > 0 ? parseFloat(item.unit_price) : parseFloat(product.price || 0);

      const lineTotal = (item.quantity || 1) * unitPrice;
      grandTotal += lineTotal;

      await OrderItem.create({
        order_id: order.id,
        product_id: product.id,
        quantity: item.quantity,
        unit_price: unitPrice,
        line_total: lineTotal,
      });
    }

    // Update order total
    order.total = grandTotal;
    await order.save();

    // Return full order with items
    const newOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, include: [Product] }],
    });

    return res.status(201).json(newOrder);
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return res.status(400).json({ error: error.message });
  }
};

/* ============================================================
   GET ALL ORDERS (GET /api/orders)
   Support pagination, filters (status, payment, search)
   ============================================================ */
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

    return res.json({
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ============================================================
   GET ORDER BY ID (GET /api/orders/:id)
   ============================================================ */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, include: [Product] }],
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    return res.json(order);
  } catch (error) {
    console.error("GET /api/orders/:id error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ============================================================
   UPDATE ORDER (PUT /api/orders/:id)
   Replace items and update main order fields
   ============================================================ */
export const updateOrder = async (req, res) => {
  try {
    const { OrderItems, ...orderData } = req.body;

    const order = await Order.findByPk(req.params.id, { include: [OrderItem] });
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Update main order info
    await order.update(orderData);

    if (OrderItems && Array.isArray(OrderItems)) {
      // Remove old items
      await OrderItem.destroy({ where: { order_id: order.id } });

      // Recreate items
      for (const item of OrderItems) {
        const product = await Product.findByPk(item.product_id);

        if (!product) {
          return res.status(400).json({ error: `Product with id ${item.product_id} not found` });
        }

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

    const updated = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, include: [Product] }],
    });

    return res.json(updated);
  } catch (error) {
    console.error("PUT /api/orders/:id error:", error);
    return res.status(400).json({ error: error.message });
  }
};

/* ============================================================
   DELETE ORDER (DELETE /api/orders/:id)
   ============================================================ */
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    await order.destroy();
    return res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/orders/:id error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ============================================================
   UPDATE ORDER STATUS (PATCH /api/orders/:id/status)
   ============================================================ */
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
    return res.json({ message: "Status updated successfully", order });
  } catch (error) {
    console.error("PATCH /api/orders/:id/status error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ============================================================
   UPDATE PAYMENT STATUS (PATCH /api/orders/:id/payment)
   ============================================================ */
export const updatePaymentStatus = async (req, res) => {
  try {
    const { payment_status } = req.body;
    const validStatuses = ["paid", "unpaid"];

    if (!validStatuses.includes(payment_status)) {
      return res.status(400).json({
        error: `Invalid payment_status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    await order.update({ payment_status });
    return res.json({ message: "Payment status updated successfully", order });
  } catch (error) {
    console.error("PATCH /api/orders/:id/payment error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ============================================================
   ORDER SUMMARY (GET /api/orders/summary)
   Count total per status
   ============================================================ */
export const getOrderSummary = async (_req, res) => {
  try {
    const statuses = ["pending", "processing", "shipped", "delivered"];

    const counts = await Promise.all(
      statuses.map((s) => Order.count({ where: { order_status: s } }))
    );

    const total = await Order.count();

    return res.json({
      total,
      pending: counts[0],
      processing: counts[1],
      shipped: counts[2],
      delivered: counts[3],
    });
  } catch (error) {
    console.error("GET /api/orders/summary error:", error);
    return res.status(500).json({ error: error.message });
  }
};
