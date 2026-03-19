import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

let sequelize;

// Check if using Neon (cloud) or local PostgreSQL
const neonUrl = process.env.NEON_DATABASE_URL;
const localDbName = process.env.DB_NAME;
const localDbUser = process.env.DB_USER;
const localDbPassword = process.env.DB_PASSWORD;
const localDbHost = process.env.DB_HOST || "localhost";
const localDbPort = process.env.DB_PORT || 5432;

if (neonUrl) {
  // Use Neon (cloud Postgres)
  console.log("📦 Connecting to Neon database (cloud)...");
  sequelize = new Sequelize(neonUrl, {
    dialect: "postgres",
    logging: false,
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
} else if (localDbName && localDbUser) {
  // Use local PostgreSQL
  console.log(`🗄️  Connecting to local PostgreSQL: ${localDbName}@${localDbHost}:${localDbPort}...`);
  sequelize = new Sequelize(localDbName, localDbUser, localDbPassword, {
    host: localDbHost,
    port: localDbPort,
    dialect: "postgres",
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  throw new Error(
    "❌ No database configuration found!\n\n" +
    "Please set one of:\n" +
    "1. NEON_DATABASE_URL (for cloud Postgres)\n" +
    "2. DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT (for local Postgres)\n\n" +
    "See .env.example for details."
  );
}

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
