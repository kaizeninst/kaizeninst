/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add username column
    await queryInterface.addColumn("staff", "username", {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
    });

    // 2. (Optional) Copy data from email to username
    // If you want to reuse existing email values as usernames
    await queryInterface.sequelize.query(`
      UPDATE staff SET username = SUBSTRING_INDEX(email, '@', 1)
    `);

    // 3. Drop email column
    await queryInterface.removeColumn("staff", "email");
  },

  async down(queryInterface, Sequelize) {
    // Rollback = put email column back
    await queryInterface.addColumn("staff", "email", {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true,
    });

    // Copy username back to email (just for rollback)
    await queryInterface.sequelize.query(`
      UPDATE staff SET email = CONCAT(username, '@rollback.local')
    `);

    await queryInterface.removeColumn("staff", "username");
  },
};
