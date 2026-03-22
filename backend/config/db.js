import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.NEON_DATABASE_URL;

if (!connectionString) {
  throw new Error("NEON_DATABASE_URL environment variable is not set");
}

const sequelize = new Sequelize(connectionString, {
  dialect: "postgres",
  logging: false,
  // Pool settings help avoid exhausting Neon connections
  pool: {
    max: parseInt(process.env.DB_POOL_MAX, 10) || 5,
    min: parseInt(process.env.DB_POOL_MIN, 10) || 0,
    acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000,
    idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000,
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true,
    },
  },
});

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to Neon PostgreSQL using Sequelize");
  } catch (error) {
    const messageParts = ["❌ Unable to connect:"];
    if (error && typeof error === "object") {
      if ("message" in error && error.message) {
        messageParts.push(error.message);
      }
      if ("code" in error && error.code) {
        messageParts.push(`(code: ${error.code})`);
      }
    }
    console.error(messageParts.join(" "));
    if (process.env.DB_LOG_VERBOSE_ERRORS === "true") {
      console.error(error);
    }
    throw error;
  }
}

export { sequelize, connectDB };
export default connectDB;
