import models from "../models/index.js";
import { Op } from "sequelize";
import nodemailer from "nodemailer";
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

    // ✅ ส่งอีเมลแจ้ง admin
    await sendQuoteNotificationEmail(newQuote);

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
      distinct: true,
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
    const validStatuses = ["draft", "sent", "accepted", "rejected", "expired", "converted"];

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
    const statuses = ["draft", "sent", "accepted", "rejected", "expired", "converted"];

    const counts = await Promise.all(statuses.map((s) => Quote.count({ where: { status: s } })));

    const total = await Quote.count();

    res.json({
      total,
      draft: counts[0],
      sent: counts[1],
      accepted: counts[2],
      rejected: counts[3],
      expired: counts[4],
      converted: counts[5],
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

    // ❌ ป้องกัน convert ซ้ำ
    if (quote.status === "converted") {
      return res.status(400).json({ error: "Quote has already been converted to order" });
    }

    // ❌ ต้องเป็น accepted ก่อนเท่านั้น
    if (quote.status !== "accepted") {
      return res.status(400).json({
        error: "Quote must be accepted before converting to order",
      });
    }

    // ✅ 1) สร้าง Order หลัก
    const order = await models.Order.create({
      customer_name: quote.customer_name,
      customer_email: quote.customer_email,
      total: quote.QuoteItems.reduce((sum, item) => sum + parseFloat(item.line_total || 0), 0),
      payment_status: "unpaid",
      order_status: "pending",
    });

    // ✅ 2) สร้าง OrderItems จาก QuoteItems
    for (const qi of quote.QuoteItems) {
      await models.OrderItem.create({
        order_id: order.id,
        product_id: qi.product_id,
        quantity: qi.quantity,
        unit_price: qi.unit_price,
        line_total: qi.line_total,
      });
    }

    // ✅ 3) อัปเดตสถานะ quote → converted
    await quote.update({ status: "converted" });

    // ✅ 4) ดึง order ที่สร้างกลับมา (พร้อม items)
    const newOrder = await models.Order.findByPk(order.id, {
      include: [{ model: models.OrderItem, include: [models.Product] }],
    });

    res.json({
      message: "Quote converted to order successfully",
      quote_id: quote.id,
      order: newOrder,
    });
  } catch (err) {
    console.error("convertQuoteToOrder error:", err);
    res.status(500).json({ error: err.message });
  }
};

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
        <h2>📩 New Quote Request</h2>
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
        <p>🕒 Created at: ${new Date().toLocaleString("th-TH")}</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Kaizeninst Website" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `[Quote Request] ${quote.customer_name || "Unknown"} (${quote.id})`,
      html,
    });

    console.log(`📧 Quote email sent for quote #${quote.id}`);
  } catch (err) {
    console.error("❌ Failed to send quote email:", err.message);
  }
}
