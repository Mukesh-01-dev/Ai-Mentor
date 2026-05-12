import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import dns from "dns";

// Force Google DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Monkey-patch dns.lookup so that pg uses our Google DNS instead of OS getaddrinfo
const originalLookup = dns.lookup;
dns.lookup = function(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  if (hostname && hostname.includes('neon.tech')) {
    // Hardcoded IP from successful nslookup to completely bypass broken local DNS
    if (options && options.all) {
      return callback(null, [{ address: '98.85.120.174', family: 4 }]);
    }
    return callback(null, '98.85.120.174', 4);
  } else {
    originalLookup(hostname, options, callback);
  }
};

dotenv.config();

let sequelize;

if (process.env.NEON_DATABASE_URL) {
  // Using Neon Database
  sequelize = new Sequelize(process.env.NEON_DATABASE_URL, {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  });
} else {
  // Using Local PostgreSQL
  sequelize = new Sequelize(
    process.env.DB_NAME || "upboskills",
    process.env.DB_USER || "postgres",
    process.env.DB_PASSWORD || "",
    {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      logging: false,
    }
  );
}

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully!");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

export { sequelize };
