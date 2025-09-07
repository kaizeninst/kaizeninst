import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Order = sequelize.define(
    "Order",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      customer_name: { type: DataTypes.STRING(255), allowNull: false },
      customer_email: { type: DataTypes.STRING(255), allowNull: false },
      total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      payment_status: {
        type: DataTypes.ENUM("paid", "unpaid"),
        allowNull: false,
        defaultValue: "unpaid",
      },
      order_status: {
        type: DataTypes.ENUM("pending", "processing", "shipped", "delivered"),
        allowNull: false,
        defaultValue: "pending",
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: "orders",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Order.associate = (models) => {
    Order.hasMany(models.OrderItem, { foreignKey: "order_id" });
  };

  return Order;
};
