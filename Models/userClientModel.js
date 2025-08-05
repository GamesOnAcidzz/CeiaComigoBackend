import mongoose from "mongoose";
import mongooseSequence from "mongoose-sequence";

const AutoIncrement = mongooseSequence(mongoose);

const userClientSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now() }
});

userClientSchema.plugin(AutoIncrement, { inc_field: "id" });

const userClientModel = mongoose.model("userClient", userClientSchema);
export default userClientModel;

