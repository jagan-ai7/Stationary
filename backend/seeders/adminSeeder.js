import { hashPassword } from "../utils/hash.js";
import db from "../models/index.js";
import AppError from "../utils/AppError.js";

const seedAdmin = async () => {
  try {
    const { User } = db;
    const adminEmail = "admin@mail.com";

    const existing = await User.findOne({
      where: { email: adminEmail },
    });

    if (existing) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await hashPassword("admin123");

    await User.create({
      firstName: "Super",
      lastName: "Admin",
      email: adminEmail,
      phoneNumber: "9999999999",
      address: "Admin Address",
      country: "India",
      state: "Punjab",
      city: "Mohali",
      zipCode: "160001",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin created");
  } catch (err) {
    console.error("❌ ERROR in seedAdmin:", err);
    throw new AppError(err.message || "Failed to seed admin", 500);
  }
};

export default seedAdmin;
