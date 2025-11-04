import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.SchemaTypes.ObjectId, ref: "UserRest", required: true },
  usageCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
})

const Tag = mongoose.model("Tag", tagSchema);
export default Tag;
