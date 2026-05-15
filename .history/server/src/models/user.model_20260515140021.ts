import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES, Role } from "../constants/roles";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: Role;
  userCode: string;
  panNumber?: string;
  dateOfBirth?: Date;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  isActive: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.BORROWER,
    },
    userCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    panNumber: {
      type: String,
      uppercase: true,
      trim: true,
      sparse: true,
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ userCode: 1 }, { sparse: true });

UserSchema.pre<IUser>("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete (ret as any).password;
    return ret;
  },
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;