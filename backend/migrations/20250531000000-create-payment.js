"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Payments", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      courseId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      courseTitle: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Amount in paise (₹499 = 49900)",
      },
      currency: {
        type: Sequelize.STRING,
        defaultValue: "inr",
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: "initiated",
        comment: "initiated | processing | success | failed",
      },
      // Idempotency key must be generated once client-side and reused on retry
      idempotencyKey: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      gateway: {
        type: Sequelize.STRING,
        defaultValue: "stripe",
        comment: "stripe | razorpay",
      },
      stripeSessionId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      stripePaymentIntentId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      razorpayOrderId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      razorpayPaymentId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      cachedResponse: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      // If cacheExpiresAt has passed, request is NOT idempotent — process as new payment
      cacheExpiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add indexes for fast lookups
    await queryInterface.addIndex("Payments", ["userId"]);
    await queryInterface.addIndex("Payments", ["idempotencyKey"], { unique: true });
    await queryInterface.addIndex("Payments", ["stripeSessionId"]);
    await queryInterface.addIndex("Payments", ["razorpayOrderId"]);
    await queryInterface.addIndex("Payments", ["status"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Payments");
  },
};
