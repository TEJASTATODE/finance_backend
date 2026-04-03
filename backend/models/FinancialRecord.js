
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FinancialRecord = sequelize.define("FinancialRecord", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0.01,
    },
  },

  type: {
    type: DataTypes.ENUM("income", "expense"),
    allowNull: false,
  },

  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },

  note: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },

}, {
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ["userId"] },
    { fields: ["date"] },
    { fields: ["type"] },
  ],
});

module.exports = FinancialRecord;