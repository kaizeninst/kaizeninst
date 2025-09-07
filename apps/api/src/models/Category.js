import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Category = sequelize.define(
    "Category",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      parent_id: { type: DataTypes.INTEGER, allowNull: true },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
      },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: "categories",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Category.associate = (models) => {
    Category.hasMany(models.Category, { as: "children", foreignKey: "parent_id" });
    Category.belongsTo(models.Category, { as: "parent", foreignKey: "parent_id" });
    Category.hasMany(models.Product, { foreignKey: "category_id" });
  };

  return Category;
};
