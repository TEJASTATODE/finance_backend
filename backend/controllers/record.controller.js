
const { FinancialRecord, User } = require("../models");
const { Op } = require("sequelize");

exports.getRecords = async (req, res) => {
  try {
    // 1. Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;


    const { type, category, startDate, endDate, search } = req.query;


    const where = {};

    if (type) {
      const validTypes = ["income", "expense"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: "Invalid type. Must be income or expense." });
      }
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = startDate;
      if (endDate) where.date[Op.lte] = endDate;
    }

    if (search) {
      where[Op.or] = [
        { note: { [Op.iLike]: `%${search}%` } },
        { category: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await FinancialRecord.findAndCountAll({
      where,
      limit,
      offset,
      order: [["date", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.status(200).json({
      message: "Records fetched successfully.",
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecord = async (req, res) => {
  try {

    const record = await FinancialRecord.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!record) {
      return res.status(404).json({ message: "Record not found." });
    }

    res.status(200).json({
      message: "Record fetched successfully.",
      data: record,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createRecord = async (req, res) => {
  try {
    const { amount, type, category, date, note } = req.body;

    if (!amount || !type || !date) {
      return res.status(400).json({ message: "Amount, type and date are required." });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number." });
    }

    const validTypes = ["income", "expense"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid type. Must be income or expense." });
    }

    // 4. Validate date
    if (isNaN(new Date(date).getTime())) {
      return res.status(400).json({ message: "Invalid date format." });
    }

    const record = await FinancialRecord.create({
      amount: Number(amount),
      type,
      category: category || null,
      date,
      note: note || null,
      userId: req.user.id,
    });

    res.status(201).json({
      message: "Record created successfully.",
      data: record,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateRecord = async (req, res) => {
  try {
  
    const record = await FinancialRecord.findOne({
      where: { id: req.params.id },
    });

    if (!record) {
      return res.status(404).json({ message: "Record not found." });
    }

    const { amount, type, category, date, note } = req.body;


    if (amount !== undefined) {
      if (isNaN(amount) || Number(amount) <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number." });
      }
    }

    if (type !== undefined) {
      const validTypes = ["income", "expense"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: "Invalid type. Must be income or expense." });
      }
    }


    if (date !== undefined) {
      if (isNaN(new Date(date).getTime())) {
        return res.status(400).json({ message: "Invalid date format." });
      }
    }

    await record.update({
      amount: amount !== undefined ? Number(amount) : record.amount,
      type: type ?? record.type,
      category: category ?? record.category,
      date: date ?? record.date,
      note: note ?? record.note,
    });
    res.status(200).json({
      message: "Record updated successfully.",
      data: record,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
   
    const record = await FinancialRecord.findOne({
      where: { id: req.params.id },
    });

    if (!record) {
      return res.status(404).json({ message: "Record not found." });
    }

    await record.destroy();

    res.status(200).json({
      message: "Record deleted successfully.",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};