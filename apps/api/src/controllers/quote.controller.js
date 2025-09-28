import models from "../models/index.js";
import { Op } from "sequelize";
const { Quote, QuoteItem, Product } = models;

// ✅ CREATE
export const createQuote = async (req, res) => {
  try {
    const { QuoteItems, ...quoteData } = req.body;

    const quote = await Quote.create(quoteData);

    if (QuoteItems && Array.isArray(QuoteItems)) {
      for (const item of QuoteItems) {
        const product = await Product.findByPk(item.product_id);
        if (!product) continue;

        const unitPrice = product.hide_price ? 0 : parseFloat(product.price);
        const lineTotal = (item.quantity || 1) * unitPrice;

        await QuoteItem.create({
          quote_id: quote.id,
          product_id: product.id,
          quantity: item.quantity,
          unit_price: unitPrice,
          line_total: lineTotal,
        });
      }
    }

    const newQuote = await Quote.findByPk(quote.id, {
      include: [{ model: QuoteItem, include: [Product] }],
    });

    res.status(201).json(newQuote);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ READ ALL (with filters + pagination)
export const getAllQuotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { status, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { customer_name: { [Op.like]: `%${search}%` } },
        { customer_email: { [Op.like]: `%${search}%` } },
        { company_name: { [Op.like]: `%${search}%` } },
        { notes: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Quote.findAndCountAll({
      where,
      offset,
      limit,
      order: [["created_at", "DESC"]],
      include: [{ model: QuoteItem, include: [Product] }],
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
    console.error("GET /quotes error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ READ ONE
export const getQuoteById = async (req, res) => {
  try {
    const quote = await Quote.findByPk(req.params.id, {
      include: [{ model: QuoteItem, include: [Product] }],
    });
    if (!quote) return res.status(404).json({ error: "Quote not found" });
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE
export const updateQuote = async (req, res) => {
  try {
    const { QuoteItems, ...quoteData } = req.body;

    const quote = await Quote.findByPk(req.params.id, {
      include: [QuoteItem],
    });
    if (!quote) return res.status(404).json({ error: "Quote not found" });

    // อัปเดต fields ของ Quote
    await quote.update(quoteData);

    if (QuoteItems && Array.isArray(QuoteItems)) {
      // ลบ items เก่าทิ้งก่อน
      await QuoteItem.destroy({ where: { quote_id: quote.id } });

      // เพิ่มใหม่ทั้งหมด
      for (const item of QuoteItems) {
        const product = await Product.findByPk(item.product_id);
        if (!product) continue;

        const unitPrice = product.hide_price ? 0 : parseFloat(product.price);
        const lineTotal = (item.quantity || 1) * unitPrice;

        await QuoteItem.create({
          quote_id: quote.id,
          product_id: product.id,
          quantity: item.quantity,
          unit_price: unitPrice,
          line_total: lineTotal,
        });
      }
    }

    const updated = await Quote.findByPk(req.params.id, {
      include: [{ model: QuoteItem, include: [Product] }],
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ DELETE
export const deleteQuote = async (req, res) => {
  try {
    const quote = await Quote.findByPk(req.params.id);
    if (!quote) return res.status(404).json({ error: "Quote not found" });

    await quote.destroy();
    res.json({ message: "Quote deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE STATUS
export const updateQuoteStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["draft", "sent", "accepted", "rejected", "expired"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const quote = await Quote.findByPk(req.params.id);
    if (!quote) return res.status(404).json({ error: "Quote not found" });

    await quote.update({ status });
    res.json({ message: "Status updated successfully", quote });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ SUMMARY
export const getQuoteSummary = async (req, res) => {
  try {
    const statuses = ["draft", "sent", "accepted", "rejected", "expired"];

    const counts = await Promise.all(statuses.map((s) => Quote.count({ where: { status: s } })));

    const total = await Quote.count();

    res.json({
      total,
      draft: counts[0],
      sent: counts[1],
      accepted: counts[2],
      rejected: counts[3],
      expired: counts[4],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ CONVERT TO ORDER
export const convertQuoteToOrder = async (req, res) => {
  try {
    const quote = await Quote.findByPk(req.params.id, {
      include: [{ model: QuoteItem, include: [Product] }],
    });
    if (!quote) return res.status(404).json({ error: "Quote not found" });

    if (quote.status !== "accepted") {
      return res.status(400).json({
        error: "Quote must be accepted before converting to order",
      });
    }

    const order = await models.Order.create(
      {
        customer_name: quote.customer_name,
        customer_email: quote.customer_email,
        total: quote.QuoteItems.reduce((sum, item) => sum + parseFloat(item.line_total || 0), 0),
        order_items: quote.QuoteItems.map((qi) => ({
          product_id: qi.product_id,
          quantity: qi.quantity,
          unit_price: qi.unit_price,
        })),
      },
      { include: [models.OrderItem] }
    );

    await quote.update({ status: "converted" }).catch(() => {});

    res.json({ message: "Quote converted to order", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
