import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Quote = sequelize.define(
    "Quote",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      customer_name: { type: DataTypes.STRING(255), allowNull: false },
      customer_email: { type: DataTypes.STRING(255), allowNull: false },
      company_name: { type: DataTypes.STRING(255), allowNull: true },
      requested_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      valid_until: { type: DataTypes.DATEONLY, allowNull: true },
      status: {
        type: DataTypes.ENUM("draft", "sent", "accepted", "rejected", "expired", "converted"),
        allowNull: false,
        defaultValue: "draft",
      },
      notes: { type: DataTypes.TEXT, allowNull: true },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: "quotes",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Quote.associate = (models) => {
    Quote.hasMany(models.QuoteItem, { foreignKey: "quote_id" });
  };

  return Quote;
};
