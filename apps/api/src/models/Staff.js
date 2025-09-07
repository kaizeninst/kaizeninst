import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Staff = sequelize.define(
    "Staff",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(255), allowNull: false },
      email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      password_hash: { type: DataTypes.STRING(255), allowNull: true },
      role: { type: DataTypes.ENUM("admin", "staff"), allowNull: false, defaultValue: "staff" },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
      },
      last_login: { type: DataTypes.DATE, allowNull: true },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: "staff",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Staff;
};
