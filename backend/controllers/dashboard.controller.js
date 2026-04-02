
const { FinancialRecord } = require("../models");
const { Op, fn, col, literal } = require("sequelize");

exports.getSummary = async (req, res) => {
  try {

    const records = await FinancialRecord.findAll({
      where: { deletedAt: null },
    });

    let totalIncome = 0;
    let totalExpenses = 0;

    records.forEach((record) => {
      if (record.type === "income") {
        totalIncome += parseFloat(record.amount);
      } else if (record.type === "expense") {
        totalExpenses += parseFloat(record.amount);
      }
    });

    const netBalance = totalIncome - totalExpenses;

    res.status(200).json({
      message: "Summary fetched successfully.",
      data: {
        totalIncome: parseFloat(totalIncome.toFixed(2)),
        totalExpenses: parseFloat(totalExpenses.toFixed(2)),
        netBalance: parseFloat(netBalance.toFixed(2)),
        totalRecords: records.length,
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCategoryWise = async (req, res) => {
  try {

    const records = await FinancialRecord.findAll({
      where: { deletedAt: null },
    });

    const categoryTotals = {};

    records.forEach((record) => {
      const category = record.category || "other";
      const amount = parseFloat(record.amount);

      if (!categoryTotals[category]) {
        categoryTotals[category] = {
          category,
          totalIncome: 0,
          totalExpenses: 0,
          net: 0,
        };
      }

      if (record.type === "income") {
        categoryTotals[category].totalIncome += amount;
      } else {
        categoryTotals[category].totalExpenses += amount;
      }

      categoryTotals[category].net =
        categoryTotals[category].totalIncome -
        categoryTotals[category].totalExpenses;
    });

    const result = Object.values(categoryTotals).map((cat) => ({
      category: cat.category,
      totalIncome: parseFloat(cat.totalIncome.toFixed(2)),
      totalExpenses: parseFloat(cat.totalExpenses.toFixed(2)),
      net: parseFloat(cat.net.toFixed(2)),
    }));

    res.status(200).json({
      message: "Category wise totals fetched successfully.",
      data: result,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
  
    const limit = parseInt(req.query.limit) || 10;

    const records = await FinancialRecord.findAll({
      where: { deletedAt: null },
      order: [["date", "DESC"]],
      limit,
    });

    res.status(200).json({
      message: "Recent activity fetched successfully.",
      data: records,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTrends = async (req, res) => {
  try {
    const records = await FinancialRecord.findAll({
      where: { deletedAt: null },
      order: [["date", "ASC"]],
    });

    const monthlyTotals = {};

    records.forEach((record) => {

      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const amount = parseFloat(record.amount);

      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = {
          month: monthKey,
          totalIncome: 0,
          totalExpenses: 0,
          net: 0,
        };
      }

      if (record.type === "income") {
        monthlyTotals[monthKey].totalIncome += amount;
      } else {
        monthlyTotals[monthKey].totalExpenses += amount;
      }

      monthlyTotals[monthKey].net =
        monthlyTotals[monthKey].totalIncome -
        monthlyTotals[monthKey].totalExpenses;
    });

    const result = Object.values(monthlyTotals).map((month) => ({
      month: month.month,
      totalIncome: parseFloat(month.totalIncome.toFixed(2)),
      totalExpenses: parseFloat(month.totalExpenses.toFixed(2)),
      net: parseFloat(month.net.toFixed(2)),
    }));

    res.status(200).json({
      message: "Monthly trends fetched successfully.",
      data: result,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};