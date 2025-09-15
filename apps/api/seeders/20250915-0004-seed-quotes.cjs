/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // ดึง products ที่เคย seed ไว้ (เอามาใช้ product_id)
    const [products] = await queryInterface.sequelize.query(
      `SELECT id, price FROM products ORDER BY id LIMIT 10;`
    );

    if (products.length === 0) {
      throw new Error("No products found. Seed products first!");
    }

    // สร้าง quotes 5 อัน
    const quotes = [
      {
        customer_name: "Alice Johnson",
        customer_email: "alice@example.com",
        company_name: "Alice Co., Ltd.",
        requested_at: now,
        valid_until: "2025-12-31",
        status: "draft",
        notes: "Need urgent quotation.",
        created_at: now,
        updated_at: now,
      },
      {
        customer_name: "Bob Smith",
        customer_email: "bob@example.com",
        company_name: "Bob Engineering",
        requested_at: now,
        valid_until: "2025-12-15",
        status: "sent",
        notes: "Please include shipping cost.",
        created_at: now,
        updated_at: now,
      },
      {
        customer_name: "Charlie Lee",
        customer_email: "charlie@example.com",
        company_name: "CL Solutions",
        requested_at: now,
        valid_until: "2025-12-20",
        status: "accepted",
        notes: null,
        created_at: now,
        updated_at: now,
      },
      {
        customer_name: "Diana Prince",
        customer_email: "diana@example.com",
        company_name: "Wonder Works",
        requested_at: now,
        valid_until: "2025-11-30",
        status: "rejected",
        notes: "Found cheaper alternative.",
        created_at: now,
        updated_at: now,
      },
      {
        customer_name: "Ethan Hunt",
        customer_email: "ethan@example.com",
        company_name: "MI Tech",
        requested_at: now,
        valid_until: "2025-12-05",
        status: "expired",
        notes: "Customer did not respond.",
        created_at: now,
        updated_at: now,
      },
    ];

    await queryInterface.bulkInsert("quotes", quotes);

    // ดึง quotes ที่เพิ่ง insert
    const [insertedQuotes] = await queryInterface.sequelize.query(
      `SELECT id FROM quotes ORDER BY id DESC LIMIT ${quotes.length};`
    );

    // ทำ QuoteItems โดยสุ่ม products มาใส่
    const quoteItems = [];
    insertedQuotes.forEach((quote, i) => {
      // ให้แต่ละ quote มี 2 product
      const prod1 = products[(i * 2) % products.length];
      const prod2 = products[(i * 2 + 1) % products.length];

      [prod1, prod2].forEach((p, idx) => {
        const quantity = Math.floor(Math.random() * 3) + 1; // 1–3
        quoteItems.push({
          quote_id: quote.id,
          product_id: p.id,
          quantity,
          unit_price: p.price,
          line_total: (p.price * quantity).toFixed(2),
        });
      });
    });

    await queryInterface.bulkInsert("quote_items", quoteItems);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("quote_items", null, {});
    await queryInterface.bulkDelete("quotes", null, {});
  },
};
