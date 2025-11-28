/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ===== เพิ่ม column ใหม่ในตาราง orders =====
    await queryInterface.addColumn("orders", "phone", {
      type: Sequelize.STRING(50),
      allowNull: true,
      after: "customer_email", // optional ถ้าอยากให้เรียงหลัง customer_email
    });

    await queryInterface.addColumn("orders", "shipping_address", {
      type: Sequelize.TEXT,
      allowNull: true,
      after: "phone",
    });

    await queryInterface.addColumn("orders", "tracking_number", {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: "total",
    });

    await queryInterface.addColumn("orders", "notes", {
      type: Sequelize.TEXT,
      allowNull: true,
      after: "tracking_number",
    });

    await queryInterface.addColumn("orders", "shipping_method", {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: "notes",
    });
  },

  async down(queryInterface, Sequelize) {
    // ===== rollback: ลบ column ออก =====
    await queryInterface.removeColumn("orders", "phone");
    await queryInterface.removeColumn("orders", "shipping_address");
    await queryInterface.removeColumn("orders", "tracking_number");
    await queryInterface.removeColumn("orders", "notes");
    await queryInterface.removeColumn("orders", "shipping_method");
  },
};
