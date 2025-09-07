import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Product = sequelize.define(
    "Product",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(255), allowNull: false },
      slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      category_id: { type: DataTypes.INTEGER, allowNull: false },
      hide_price: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      stock_quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      description: DataTypes.TEXT,
      image_path: DataTypes.STRING(255),
      manual_file_path: DataTypes.STRING(255),
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: "products",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.Category, { foreignKey: "category_id" });
    Product.hasMany(models.OrderItem, { foreignKey: "product_id" });
    Product.hasMany(models.QuoteItem, { foreignKey: "product_id" });
  };

  return Product;
};
