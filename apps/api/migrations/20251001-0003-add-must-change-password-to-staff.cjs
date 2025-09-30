/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ===== เพิ่ม column must_change_password ในตาราง staff =====
    await queryInterface.addColumn("staff", "must_change_password", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: "password_hash", // optional: ให้อยู่ถัดจาก password_hash
    });
  },

  async down(queryInterface, Sequelize) {
    // ===== rollback: ลบ column ออก =====
    await queryInterface.removeColumn("staff", "must_change_password");
  },
};
