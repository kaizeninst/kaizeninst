import { DataTypes } from "sequelize";

export default (sequelize) => {
  const QuoteItem = sequelize.define(
    "QuoteItem",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      quote_id: { type: DataTypes.INTEGER, allowNull: false },
      product_id: { type: DataTypes.INTEGER, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      line_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    },
    {
      tableName: "quote_items",
      timestamps: false,
    }
  );

  QuoteItem.beforeValidate((item) => {
    const q = Number(item.quantity || 0);
    const u = Number(item.unit_price || 0);
    item.line_total = (q * u).toFixed(2);
  });

  QuoteItem.associate = (models) => {
    QuoteItem.belongsTo(models.Quote, { foreignKey: "quote_id" });
    QuoteItem.belongsTo(models.Product, { foreignKey: "product_id" });
  };

  return QuoteItem;
};
