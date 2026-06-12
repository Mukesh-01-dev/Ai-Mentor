import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Payment extends Model { }

Payment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },

    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    courseTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    amount: {
      type: DataTypes.INTEGER, // stored in paise (₹499 = 49900)
      allowNull: false,
    },

    currency: {
      type: DataTypes.STRING,
      defaultValue: "inr",
    },

    // status: initiated | processing | success | failed
    status: {
      type: DataTypes.ENUM("initiated", "processing", "success", "failed"),
      defaultValue: "initiated",
      allowNull: false,
    },

    // The UUID generated on the client — prevents duplicate charges
    idempotencyKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    // Payment gateway: "stripe" | "razorpay"
    gateway: {
      type: DataTypes.ENUM("stripe", "razorpay"),
      defaultValue: "stripe",
      allowNull: false,
    },

    // Stripe fields
    stripeSessionId: {
      type: DataTypes.STRING,
    },

    stripePaymentIntentId: {
      type: DataTypes.STRING,
    },

    // Razorpay fields
    razorpayOrderId: {
      type: DataTypes.STRING,
    },

    razorpayPaymentId: {
      type: DataTypes.STRING,
    },

    // Cached response for idempotency
    cachedResponse: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },

    // Cache expiry (24 hours from creation)
    cacheExpiresAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: "Payment",
    tableName: "Payments",
    timestamps: true, // adds createdAt and updatedAt automatically
    indexes: [
      { fields: ["userId"] },
      { fields: ["idempotencyKey"], unique: true },
      { fields: ["stripeSessionId"] },
      { fields: ["razorpayOrderId"] },
      { fields: ["status"] },
    ],
  }
);

export default Payment;
