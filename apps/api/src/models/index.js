import { sequelize } from "../db/sequelize.js";

// import factories
import CategoryFactory from "./Category.js";
import ProductFactory from "./Product.js";
import OrderFactory from "./Order.js";
import OrderItemFactory from "./OrderItem.js";
import QuoteFactory from "./Quote.js";
import QuoteItemFactory from "./QuoteItem.js";
import StaffFactory from "./Staff.js";

// init
const models = {};
models.Category = CategoryFactory(sequelize);
models.Product = ProductFactory(sequelize);
models.Order = OrderFactory(sequelize);
models.OrderItem = OrderItemFactory(sequelize);
models.Quote = QuoteFactory(sequelize);
models.QuoteItem = QuoteItemFactory(sequelize);
models.Staff = StaffFactory(sequelize);

// associations
Object.values(models).forEach((m) => {
  if (typeof m.associate === "function") m.associate(models);
});

export { sequelize };
export default models;
