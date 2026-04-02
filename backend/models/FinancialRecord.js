const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FinancialRecord = sequelize.define("FinancialRecord", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  type: {
    type: DataTypes.ENUM("income", "expense"),
    allowNull: false,
  },

  category: {
    type: DataTypes.STRING,
  },

  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  note: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true,
});

module.exports = FinancialRecord;