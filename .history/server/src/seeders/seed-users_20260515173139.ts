import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model";
import { ROLES, Role } from "../constants/roles";
import { generateUserCode } from "../utils/generate-user-code";

dotenv.config();

interface SeedUser {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: Role;
}

const SEED_USERS: SeedUser[] = [
  {
    fullName: "Admin User",
    email: "admin@lms.com",
    password: "Admin@1234",
    phoneNumber: "9000000001",
    role: ROLES.ADMIN,
  },
  {
    fullName: "Sales Executive",
    email: "sales@lms.com",
    password: "Sales@1234",
    phoneNumber: "9000000002",
    role: ROLES.SALES,
  },
  {
    fullName: "Sanction Executive",
    email: "sanction@lms.com",
    password: "Sanction@1234",
    phoneNumber: "9000000003",
    role: ROLES.SANCTION,
  },
  {
    fullName: "Disbursement Executive",
    email: "disbursement@lms.com",
    password: "Disburse@1234",
    phoneNumber: "9000000004",
    role: ROLES.DISBURSEMENT,
  },
  {
    fullName: "Collection Executive",
    email: "collection@lms.com",
    password: "Collect@1234",
    phoneNumber: "9000000005",
    role: ROLES.COLLECTION,
  },
  {
    fullName: "Test Borrower",
    email: "borrower@lms.com",
    password: "Borrower@1234",
    phoneNumber: "9000000006",
    role: ROLES.BORROWER,
  },
];

const seed = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("✅ Connected to MongoDB");

    // Track counts per role for userCode generation
    const roleCounts: Partial<Record<Role, number>> = {};

    for (const seedUser of SEED_USERS) {
      const exists = await User.findOne({ email: seedUser.email });

      if (exists) {
        console.log(`Skipping ${seedUser.email} — already exists`);
        continue;
      }

      roleCounts[seedUser.role] = (roleCounts[seedUser.role] ?? 0) + 1;

      const existingCount = await User.countDocuments({ role: seedUser.role });
      const userCode = generateUserCode(
        seedUser.role,
        existingCount + (roleCounts[seedUser.role] ?? 1)
      );

      await User.create({ ...seedUser, userCode });
      console.log(`Created ${seedUser.role}: ${seedUser.email}`);
    }

    console.log("\nSeed complete. Login credentials:");
    console.log("─────────────────────────────────────────");
    SEED_USERS.forEach((u) => {
      console.log(`${u.role.padEnd(14)} ${u.email.padEnd(28)} ${u.password}`);
    });
    console.log("─────────────────────────────────────────");
  } catch (err) {
    console.error("Seed failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected");
  }
};

seed();