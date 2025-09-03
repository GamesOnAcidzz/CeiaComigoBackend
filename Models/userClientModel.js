import mongoose from "mongoose";
import mongooseSequence from "mongoose-sequence";
import bcrypt from "bcryptjs";

const userClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

userClientSchema.pre('save', async function (next){
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const UserClient = mongoose.model("userClient", userClientSchema);
export default UserClient;

