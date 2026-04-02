const sequelize = require("../config/database");
const User = require("./User");
const FinancialRecord = require("./FinancialRecord");


User.hasMany(FinancialRecord, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

FinancialRecord.belongsTo(User, {
  foreignKey: "userId",
});
const seedAdmin = async () => {
  try {
    const exists = await User.findOne({
      where: { email: "admin@finance.com" }
    });

    if (exists) {
      console.log("Admin already exists.");
      return;
    }
    await User.create({
      name: "System Admin",
      email: "admin@finance.com",
      password: "Admin@123",
      role: "admin",
      status: "active",
    });
    console.log(" Admin seeding done.");
    console.log(" Email: admin@finance.com");
    console.log(" Password: Admin@123");

  } catch (error) {
    console.error("Admin seed failed:", error.message);
  }
};

module.exports = {
  sequelize,
  User,
  FinancialRecord,
  seedAdmin
};