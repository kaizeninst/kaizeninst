import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  process.env.DB_NAME, // database
  process.env.DB_USER, // user
  process.env.DB_PASS, // password
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false, // ปิด log SQL (เปิดตอน debug ได้)
  }
);

export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Database connected");
  } catch (err) {
    console.error("Database connection error:", err);
  }
}
