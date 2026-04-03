
const { User } = require("../models");
exports.getUsers = async (req, res) => {
  try {
   
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      attributes: { exclude: ["password"] },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Users fetched.",
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

exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "User fetched successfully.",
      data: user,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;


    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }


    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const validRoles = ["viewer", "analyst", "admin"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be viewer, analyst or admin." });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "viewer",
      status: "active",
    });

    const { password: _, ...safeUser } = user.toJSON();

    res.status(201).json({
      message: "User created successfully.",
      data: safeUser,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const validRoles = ["viewer", "analyst", "admin"];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be viewer, analyst or admin." });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You cannot change your own role." });
    }

    user.role = role;
    await user.save();

    const { password: _, ...safeUser } = user.toJSON();

    res.status(200).json({
      message: "Role updated successfully.",
      data: safeUser,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;


    const validStatuses = ["active", "inactive"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be active or inactive." });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You cannot change your own status." });
    }

    user.status = status;
    await user.save();

   
    const { password: _, ...safeUser } = user.toJSON();

    res.status(200).json({
      message: `User ${status === "active" ? "activated" : "deactivated"} successfully.`,
      data: safeUser,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
  
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account." });
    }

    
    user.status = "inactive";
    await user.save();

    res.status(200).json({
      message: "User deleted successfully.",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};