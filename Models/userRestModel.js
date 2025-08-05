import mongoose from "mongoose";

const userRestSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now() },
  restIds: [mongoose.SchemaTypes.ObjectId]
});

export default userRestModel = mongoose.model("userRest", userRestSchema);
