import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userAccountSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  userProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile' },
  createdAt: { type: Date, default: Date.now }
});

userAccountSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const UserAccount = mongoose.model("UserAccount", userAccountSchema);
export default UserAccount;

