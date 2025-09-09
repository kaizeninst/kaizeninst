/** @type {import('sequelize-cli').Seeder} */

const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hash = await bcrypt.hash("Admin!234", 10); // เปลี่ยนรหัสผ่านก่อนใช้จริง
    const now = new Date();

    await queryInterface.bulkInsert("staff", [
      {
        name: "System Admin",
        email: "admin@kaizeninst.local",
        password_hash: hash,
        role: "admin",
        status: "active",
        last_login: null,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("staff", { email: "admin@kaizeninst.local" });
  },
};
