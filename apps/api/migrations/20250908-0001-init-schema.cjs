/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ===== Enums (ใช้ ENUM ของ MySQL ผ่าน Sequelize.ENUM) =====
    const productStatus = ["active", "inactive"];
    const categoryStatus = ["active", "inactive"];
    const paymentStatus = ["paid", "unpaid"];
    const orderStatus = ["pending", "processing", "shipped", "delivered"];
    const quoteStatus = ["draft", "sent", "accepted", "rejected", "expired"];
    const staffRole = ["admin", "staff"];
    const staffStatus = ["active", "inactive"];

    // ===== CATEGORIES =====
    await queryInterface.createTable(
      "categories",
      {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        name: { type: Sequelize.STRING(255), allowNull: false, unique: true },
        slug: { type: Sequelize.STRING(255), allowNull: false, unique: true },
        parent_id: { type: Sequelize.INTEGER, allowNull: true },
        status: {
          type: Sequelize.ENUM(...categoryStatus),
          allowNull: false,
          defaultValue: "active",
        },
        sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
        },
      },
      { charset: "utf8mb4", collate: "utf8mb4_unicode_ci", engine: "InnoDB" }
    );

    // FK: categories.parent_id -> categories.id (self-reference, SET NULL on delete)
    await queryInterface.addConstraint("categories", {
      fields: ["parent_id"],
      type: "foreign key",
      name: "fk_categories_parent",
      references: { table: "categories", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // ===== PRODUCTS =====
    await queryInterface.createTable(
      "products",
      {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        name: { type: Sequelize.STRING(255), allowNull: false },
        slug: { type: Sequelize.STRING(255), allowNull: false, unique: true },
        price: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        category_id: { type: Sequelize.INTEGER, allowNull: false },
        hide_price: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        stock_quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        description: { type: Sequelize.TEXT, allowNull: true },
        image_path: { type: Sequelize.STRING(255), allowNull: true },
        manual_file_path: { type: Sequelize.STRING(255), allowNull: true },
        status: {
          type: Sequelize.ENUM(...productStatus),
          allowNull: false,
          defaultValue: "active",
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
        },
      },
      { charset: "utf8mb4", collate: "utf8mb4_unicode_ci", engine: "InnoDB" }
    );

    await queryInterface.addConstraint("products", {
      fields: ["category_id"],
      type: "foreign key",
      name: "fk_products_category",
      references: { table: "categories", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT", // ห้ามลบ category ถ้ายังมีสินค้าอ้างอิง
    });

    await queryInterface.addIndex("products", ["name"], { name: "idx_products_name" });

    // ===== ORDERS =====
    await queryInterface.createTable(
      "orders",
      {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        customer_name: { type: Sequelize.STRING(255), allowNull: false },
        customer_email: { type: Sequelize.STRING(255), allowNull: false },
        total: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        payment_status: {
          type: Sequelize.ENUM(...paymentStatus),
          allowNull: false,
          defaultValue: "unpaid",
        },
        order_status: {
          type: Sequelize.ENUM(...orderStatus),
          allowNull: false,
          defaultValue: "pending",
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
        },
      },
      { charset: "utf8mb4", collate: "utf8mb4_unicode_ci", engine: "InnoDB" }
    );

    await queryInterface.addIndex("orders", ["customer_email"], {
      name: "idx_orders_customer_email",
    });

    // ===== ORDER_ITEMS =====
    await queryInterface.createTable(
      "order_items",
      {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        order_id: { type: Sequelize.INTEGER, allowNull: false },
        product_id: { type: Sequelize.INTEGER, allowNull: false },
        quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
        unit_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        line_total: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      },
      { charset: "utf8mb4", collate: "utf8mb4_unicode_ci", engine: "InnoDB" }
    );

    await queryInterface.addConstraint("order_items", {
      fields: ["order_id"],
      type: "foreign key",
      name: "fk_order_items_order",
      references: { table: "orders", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE", // ลบ order -> ลบรายการด้วย
    });

    await queryInterface.addConstraint("order_items", {
      fields: ["product_id"],
      type: "foreign key",
      name: "fk_order_items_product",
      references: { table: "products", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT", // ไม่ให้ลบ product ที่ถูกสั่งซื้อไปแล้ว
    });

    await queryInterface.addIndex("order_items", ["order_id"], { name: "idx_order_items_order" });

    // ===== QUOTES =====
    await queryInterface.createTable(
      "quotes",
      {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        customer_name: { type: Sequelize.STRING(255), allowNull: false },
        customer_email: { type: Sequelize.STRING(255), allowNull: false },
        company_name: { type: Sequelize.STRING(255), allowNull: true },
        requested_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        valid_until: { type: Sequelize.DATEONLY, allowNull: true },
        status: {
          type: Sequelize.ENUM(...quoteStatus),
          allowNull: false,
          defaultValue: "draft",
        },
        notes: { type: Sequelize.TEXT, allowNull: true },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
        },
      },
      { charset: "utf8mb4", collate: "utf8mb4_unicode_ci", engine: "InnoDB" }
    );

    // ===== QUOTE_ITEMS =====
    await queryInterface.createTable(
      "quote_items",
      {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        quote_id: { type: Sequelize.INTEGER, allowNull: false },
        product_id: { type: Sequelize.INTEGER, allowNull: false },
        quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
        unit_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        line_total: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      },
      { charset: "utf8mb4", collate: "utf8mb4_unicode_ci", engine: "InnoDB" }
    );

    await queryInterface.addConstraint("quote_items", {
      fields: ["quote_id"],
      type: "foreign key",
      name: "fk_quote_items_quote",
      references: { table: "quotes", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("quote_items", {
      fields: ["product_id"],
      type: "foreign key",
      name: "fk_quote_items_product",
      references: { table: "products", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    await queryInterface.addIndex("quote_items", ["quote_id"], { name: "idx_quote_items_quote" });

    // ===== STAFF =====
    await queryInterface.createTable(
      "staff",
      {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        name: { type: Sequelize.STRING(255), allowNull: false },
        email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
        password_hash: { type: Sequelize.STRING(255), allowNull: true },
        role: {
          type: Sequelize.ENUM(...staffRole),
          allowNull: false,
          defaultValue: "staff",
        },
        status: {
          type: Sequelize.ENUM(...staffStatus),
          allowNull: false,
          defaultValue: "active",
        },
        last_login: { type: Sequelize.DATE, allowNull: true },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
        },
      },
      { charset: "utf8mb4", collate: "utf8mb4_unicode_ci", engine: "InnoDB" }
    );

    await queryInterface.addIndex("staff", ["role", "status"], { name: "idx_staff_role_status" });
  },

  async down(queryInterface, Sequelize) {
    // ลบตารางเรียงลำดับย้อนกลับ + ลบ ENUM
    await queryInterface.dropTable("staff");
    await queryInterface.dropTable("quote_items");
    await queryInterface.dropTable("quotes");
    await queryInterface.dropTable("order_items");
    await queryInterface.dropTable("orders");
    await queryInterface.dropTable("products");

    // ต้องลบ FK self-ref ก่อนค่อยลบ categories
    await queryInterface.removeConstraint("categories", "fk_categories_parent").catch(() => {});
    await queryInterface.dropTable("categories");

    // ลบ ENUM types (MySQL จะลบพร้อมตาราง; ขั้นตอนนี้กันไว้ถ้า dialect อื่น)
    // noop
  },
};
