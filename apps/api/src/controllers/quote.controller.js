import models from "../models/index.js";
const { Quote, QuoteItem, Product } = models;

// ✅ CREATE
export const createQuote = async (req, res) => {
  try {
    const quote = await Quote.create(req.body, { include: [QuoteItem] });
    res.status(201).json(quote);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ READ ALL
export const getAllQuotes = async (_req, res) => {
  try {
    const quotes = await Quote.findAll({
      include: [{ model: QuoteItem, include: [Product] }],
    });
    res.json(quotes);
  } catch (err) {
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
    const quote = await Quote.findByPk(req.params.id);
    if (!quote) return res.status(404).json({ error: "Quote not found" });

    await quote.update(req.body);
    res.json(quote);
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
