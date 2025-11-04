import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userRestSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  restIds: [mongoose.SchemaTypes.ObjectId]
});
userRestSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const UserRest = mongoose.model("UserRest", userRestSchema);
export default UserRest;
