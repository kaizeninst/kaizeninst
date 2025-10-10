// ============================================================
//  QUOTE CONTROLLER
// ============================================================

import models from "../models/index.js";
import { Op } from "sequelize";
import nodemailer from "nodemailer";

const { Quote, QuoteItem, Product } = models;

/* ============================================================
   CREATE QUOTE (POST /api/quotes)
   - Create quote and quote items
   - Hide price if product.hide_price = true
   - Send email notification to admin
   ============================================================ */
export const createQuote = async (req, res) => {
  try {
    const { QuoteItems, ...quoteData } = req.body;

    const quote = await Quote.create(quoteData);

    if (QuoteItems && Array.isArray(QuoteItems)) {
      for (const item of QuoteItems) {
        const product = await Product.findByPk(item.product_id);
        if (!product) continue;

        const unitPrice = product.hide_price ? 0 : parseFloat(product.price || 0);
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

    // Send notification email to admin
    await sendQuoteNotificationEmail(newQuote);

    return res.status(201).json(newQuote);
  } catch (error) {
    console.error("POST /api/quotes error:", error);
    return res.status(400).json({ error: error.message });
  }
};

/* ============================================================
   GET ALL QUOTES (GET /api/quotes)
   Support pagination, filtering by status and search
   ============================================================ */
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
      distinct: true,
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
    console.error("GET /api/quotes error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ============================================================
   GET QUOTE BY ID (GET /api/quotes/:id)
   ============================================================ */
export const getQuoteById = async (req, res) => {
  try {
    const quote = await Quote.findByPk(req.params.id, {
      include: [{ model: QuoteItem, include: [Product] }],
    });
    if (!quote) return res.status(404).json({ error: "Quote not found" });
    return res.json(quote);
  } catch (error) {
    console.error("GET /api/quotes/:id error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ============================================================
   UPDATE QUOTE (PUT /api/quotes/:id)
   Replace quote items and update quote data
   ============================================================ */
export const updateQuote = async (req, res) => {
  try {
    const { QuoteItems, ...quoteData } = req.body;

    const quote = await Quote.findByPk(req.params.id, { include: [QuoteItem] });
    if (!quote) return res.status(404).json({ error: "Quote not found" });

    // Update main quote info
    await quote.update(quoteData);

    if (QuoteItems && Array.isArray(QuoteItems)) {
      await QuoteItem.destroy({ where: { quote_id: quote.id } });

      for (const item of QuoteItems) {
        const product = await Product.findByPk(item.product_id);
        if (!product) continue;

        const unitPrice = product.hide_price ? 0 : parseFloat(product.price || 0);
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

    return res.json(updated);
  } catch (error) {
    console.error("PUT /api/quotes/:id error:", error);
    return res.status(400).json({ error: error.message });
  }
};

/* ============================================================
   DELETE QUOTE (DELETE /api/quotes/:id)
   ============================================================ */
export const deleteQuote = async (req, res) => {
  try {
    const quote = await Quote.findByPk(req.params.id);
    if (!quote) return res.status(404).json({ error: "Quote not found" });

    await quote.destroy();
    return res.json({ message: "Quote deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/quotes/:id error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ============================================================
   UPDATE QUOTE STATUS (PATCH /api/quotes/:id/status)
   ============================================================ */
export const updateQuoteStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["draft", "sent", "accepted", "rejected", "expired", "converted"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const quote = await Quote.findByPk(req.params.id);
    if (!quote) return res.status(404).json({ error: "Quote not found" });

    await quote.update({ status });
    return res.json({ message: "Status updated successfully", quote });
  } catch (error) {
    console.error("PATCH /api/quotes/:id/status error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ============================================================
   QUOTE SUMMARY (GET /api/quotes/summary)
   Count all quotes by status
   ============================================================ */
export const getQuoteSummary = async (_req, res) => {
  try {
    const statuses = ["draft", "sent", "accepted", "rejected", "expired", "converted"];

    const counts = await Promise.all(statuses.map((s) => Quote.count({ where: { status: s } })));
    const total = await Quote.count();

    return res.json({
      total,
      draft: counts[0],
      sent: counts[1],
      accepted: counts[2],
      rejected: counts[3],
      expired: counts[4],
      converted: counts[5],
    });
  } catch (error) {
    console.error("GET /api/quotes/summary error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ============================================================
   CONVERT QUOTE TO ORDER (POST /api/quotes/:id/convert)
   Only accepted quotes can be converted
   ============================================================ */
export const convertQuoteToOrder = async (req, res) => {
  try {
    const quote = await Quote.findByPk(req.params.id, {
      include: [{ model: QuoteItem, include: [Product] }],
    });
    if (!quote) return res.status(404).json({ error: "Quote not found" });

    if (quote.status === "converted") {
      return res.status(400).json({ error: "Quote has already been converted to order" });
    }

    if (quote.status !== "accepted") {
      return res.status(400).json({ error: "Quote must be accepted before converting to order" });
    }

    // Create new order
    const order = await models.Order.create({
      customer_name: quote.customer_name,
      customer_email: quote.customer_email,
      total: quote.QuoteItems.reduce((sum, item) => sum + parseFloat(item.line_total || 0), 0),
      payment_status: "unpaid",
      order_status: "pending",
    });

    // Create order items
    for (const qi of quote.QuoteItems) {
      await models.OrderItem.create({
        order_id: order.id,
        product_id: qi.product_id,
        quantity: qi.quantity,
        unit_price: qi.unit_price,
        line_total: qi.line_total,
      });
    }

    // Update quote status
    await quote.update({ status: "converted" });

    // Return the newly created order
    const newOrder = await models.Order.findByPk(order.id, {
      include: [{ model: models.OrderItem, include: [models.Product] }],
    });

    return res.json({
      message: "Quote converted to order successfully",
      quote_id: quote.id,
      order: newOrder,
    });
  } catch (error) {
    console.error("POST /api/quotes/:id/convert error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ============================================================
   HELPER: SEND QUOTE NOTIFICATION EMAIL
   ============================================================ */
async function sendQuoteNotificationEmail(quote) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const itemsHtml = quote.QuoteItems.map(
      (item, i) => `
        <tr>
          <td style="border:1px solid #ddd;padding:6px;">${i + 1}</td>
          <td style="border:1px solid #ddd;padding:6px;">${item.Product.name}</td>
          <td style="border:1px solid #ddd;padding:6px;">${item.quantity}</td>
          <td style="border:1px solid #ddd;padding:6px;">${item.unit_price.toLocaleString()} ฿</td>
          <td style="border:1px solid #ddd;padding:6px;">${item.line_total.toLocaleString()} ฿</td>
        </tr>`
    ).join("");

    const total = quote.QuoteItems.reduce((sum, it) => sum + (parseFloat(it.line_total) || 0), 0);

    const html = `
      <div style="font-family:system-ui,Segoe UI,Roboto,Arial;">
        <h2>New Quote Request</h2>
        <p><b>Name:</b> ${quote.customer_name}</p>
        <p><b>Email:</b> ${quote.customer_email}</p>
        ${quote.company_name ? `<p><b>Company:</b> ${quote.company_name}</p>` : ""}
        <table style="border-collapse:collapse;width:100%;margin-top:10px;">
          <thead>
            <tr style="background:#f3f3f3;">
              <th style="border:1px solid #ddd;padding:6px;">#</th>
              <th style="border:1px solid #ddd;padding:6px;">Product</th>
              <th style="border:1px solid #ddd;padding:6px;">Qty</th>
              <th style="border:1px solid #ddd;padding:6px;">Unit</th>
              <th style="border:1px solid #ddd;padding:6px;">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p style="margin-top:10px;"><b>Total:</b> ${total.toLocaleString()} ฿</p>
        <p>Created at: ${new Date().toLocaleString("th-TH")}</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Kaizeninst Website" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `[Quote Request] ${quote.customer_name || "Unknown"} (${quote.id})`,
      html,
    });

    console.log(`Quote email sent for quote #${quote.id}`);
  } catch (error) {
    console.error("Failed to send quote email:", error.message);
  }
}
