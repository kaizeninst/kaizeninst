import { DataTypes } from "sequelize";

export default (sequelize) => {
  const OrderItem = sequelize.define(
    "OrderItem",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      order_id: { type: DataTypes.INTEGER, allowNull: false },
      product_id: { type: DataTypes.INTEGER, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      line_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    },
    {
      tableName: "order_items",
      timestamps: false,
    }
  );

  // คำนวณ line_total อัตโนมัติก่อนบันทึก
  OrderItem.beforeValidate((item) => {
    const q = Number(item.quantity || 0);
    const u = Number(item.unit_price || 0);
    item.line_total = (q * u).toFixed(2);
  });

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, { foreignKey: "order_id" });
    OrderItem.belongsTo(models.Product, { foreignKey: "product_id" });
  };

  return OrderItem;
};
