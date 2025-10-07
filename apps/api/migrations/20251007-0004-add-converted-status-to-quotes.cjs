"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ✅ เปลี่ยน ENUM ของ status ในตาราง quotes
    await queryInterface.sequelize.query(`
      ALTER TABLE quotes
      MODIFY COLUMN status
      ENUM('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted')
      NOT NULL DEFAULT 'draft';
    `);
  },

  async down(queryInterface, Sequelize) {
    // 🔙 ถ้า rollback จะกลับไปไม่มี converted
    await queryInterface.sequelize.query(`
      ALTER TABLE quotes
      MODIFY COLUMN status
      ENUM('draft', 'sent', 'accepted', 'rejected', 'expired')
      NOT NULL DEFAULT 'draft';
    `);
  },
};
